import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import Chart from 'chart.js/auto';
import { Typography, Paper, Box, Grid, Card, CardContent } from '@mui/material';

// Function to generate a random color for the chart lines and backgrounds
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Currency formatter for UGX
const formatCurrencyUGX = (amount: number) => {
  return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(amount);
};

// Define the props for the DailyExpensesChart component
interface DailyExpensesChartProps {
  expensesData: Array<{ expenseDate: string; expenseAmount?: number; branchCode: string }>;
}

// Component for rendering daily expenses chart and comparing with last month's data
const DailyExpensesChart: React.FC<DailyExpensesChartProps> = ({ expensesData }) => {
  const chartRef = useRef<Chart | null>(null); // Reference to store the Chart instance

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Helper function to group expenses by branch and day for a given month
  const groupExpensesByBranchAndDay = useCallback(
    (month: number, year: number) => {
      const dailyExpensesByBranch: { [branch: string]: { [day: string]: number } } = {};

      expensesData.forEach((expense) => {
        const expenseDate = new Date(expense.expenseDate);
        const day = expenseDate.getDate();
        const expenseMonth = expenseDate.getMonth();
        const expenseYear = expenseDate.getFullYear();
        const branchCode = expense.branchCode;

        if (expenseMonth === month && expenseYear === year) {
          if (!dailyExpensesByBranch[branchCode]) {
            dailyExpensesByBranch[branchCode] = {};
          }
          dailyExpensesByBranch[branchCode][day] =
            (dailyExpensesByBranch[branchCode][day] || 0) + (expense.expenseAmount || 0);
        }
      });

      return dailyExpensesByBranch;
    },
    [expensesData]
  );

  // Memoize the calculations for the current and last month
  const { labels, datasets,  overallTotal, lastMonthTotal, comparisonData } =
    useMemo(() => {
      const dailyExpensesByBranch = groupExpensesByBranchAndDay(currentMonth, currentYear);
      const lastMonthExpensesByBranch = groupExpensesByBranchAndDay(lastMonth, lastMonthYear);

      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

      const branchTotals: { [branch: string]: number } = {};
      const branchLastMonthTotals: { [branch: string]: number } = {};
      const branchColors: { [branch: string]: string } = {};
      let overallTotal = 0;
      let lastMonthTotal = 0;

      const datasets = Object.keys(dailyExpensesByBranch).map((branch) => {
        const branchData = dailyExpensesByBranch[branch];
        const data = labels.map((day) => branchData[day] || 0);

        const totalForBranch = data.reduce((sum, amount) => sum + amount, 0);
        branchTotals[branch] = totalForBranch;
        overallTotal += totalForBranch;

        // Last month data
        const lastMonthBranchData = lastMonthExpensesByBranch[branch] || {};
        const lastMonthData = labels.map((day) => lastMonthBranchData[day] || 0);
        const totalForLastMonthBranch = lastMonthData.reduce((sum, amount) => sum + amount, 0);
        branchLastMonthTotals[branch] = totalForLastMonthBranch;
        lastMonthTotal += totalForLastMonthBranch;

        const branchColor = getRandomColor();
        branchColors[branch] = branchColor;

        return {
          label: `Daily Expenses - ${branch}`,
          data: data,
          fill: false,
          backgroundColor: branchColor,
          borderColor: branchColor,
        };
      });

      const comparisonData = Object.keys(branchTotals).map((branch) => {
        const currentTotal = branchTotals[branch] || 0;
        const lastMonthTotal = branchLastMonthTotals[branch] || 0;
        const difference = currentTotal - lastMonthTotal;
        const percentageChange = lastMonthTotal ? ((difference / lastMonthTotal) * 100).toFixed(2) : 'N/A';

        return { branch, currentTotal, lastMonthTotal, difference, percentageChange };
      });

      return { labels, datasets, branchTotals, overallTotal, branchLastMonthTotals, lastMonthTotal, comparisonData };
    }, [groupExpensesByBranchAndDay, currentMonth, currentYear, lastMonth, lastMonthYear]);

  const chartData = useMemo(
    () => ({
      labels: labels,
      datasets: datasets,
    }),
    [labels, datasets]
  );

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = (document.getElementById('dailyExpensesChart') as HTMLCanvasElement).getContext('2d');
    if (ctx) {
      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
        },
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [chartData]);

  return (
    <Paper elevation={3} sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Daily Expenses for Current Month
      </Typography>
      <canvas id="dailyExpensesChart" /> {/* Chart canvas */}

      {/* Summary Section */}
      <Box mt={2}>
        <Typography variant="h6" gutterBottom>
          Summary (in UGX)
        </Typography>
        <Grid container spacing={3}>
          {comparisonData.map(({ branch, currentTotal, lastMonthTotal, difference, percentageChange }) => (
            <Grid item xs={12} md={6} key={branch}>
              <Card
                sx={{
                  boxShadow: 4,
                  borderRadius: 3,
                  backgroundColor: '#f4f6f8',
                  padding: '20px',
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: '#1976d2',
                      marginBottom: '10px',
                    }}
                  >
                    {branch} Branch
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Expenses (This Month):</strong> {formatCurrencyUGX(currentTotal)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Expenses (Last Month, same period):</strong> {formatCurrencyUGX(lastMonthTotal)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 'bold',
                      color: currentTotal > lastMonthTotal ? 'red' : 'green',
                      mt: 1,
                    }}
                  >
                    {currentTotal > lastMonthTotal ? 'Increased Spending' : 'Saving'}: {formatCurrencyUGX(Math.abs(difference))} (
                    {percentageChange}%)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Card
              sx={{
                boxShadow: 4,
                borderRadius: 3,
                backgroundColor: '#f4f6f8',
                padding: '20px',
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: '#1976d2',
                    marginBottom: '10px',
                  }}
                >
                  Overall Total Expenses
                </Typography>
                <Typography variant="body1">
                  <strong>This Month:</strong> {formatCurrencyUGX(overallTotal)}
                </Typography>
                <Typography variant="body1">
                  <strong>Last Month, same period:</strong> {formatCurrencyUGX(lastMonthTotal)}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 'bold',
                    color: overallTotal > lastMonthTotal ? 'red' : 'green',
                    mt: 1,
                  }}
                >
            {overallTotal > lastMonthTotal ? 'Increased Spending' : 'Saving'}: 
{formatCurrencyUGX(Math.abs(overallTotal - lastMonthTotal))} 
(
    {lastMonthTotal !== 0 
        ? (((overallTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(2) 
        : 'N/A'}%
)

                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default DailyExpensesChart;
