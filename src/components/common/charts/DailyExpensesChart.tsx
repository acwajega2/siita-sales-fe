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

// Component for rendering daily expenses chart
const DailyExpensesChart: React.FC<DailyExpensesChartProps> = ({ expensesData }) => {
  const chartRef = useRef<Chart | null>(null); // Reference to store the Chart instance

  // Get the current month and year to filter the data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Memoize the function to group expenses by branch and day for the current month
  const groupExpensesByBranchAndDayForCurrentMonth = useCallback(() => {
    const dailyExpensesByBranch: { [branch: string]: { [day: string]: number } } = {};

    expensesData.forEach((expense) => {
      const expenseDate = new Date(expense.expenseDate);
      const day = expenseDate.getDate();
      const month = expenseDate.getMonth();
      const year = expenseDate.getFullYear();
      const branchCode = expense.branchCode;

      if (month === currentMonth && year === currentYear) {
        if (!dailyExpensesByBranch[branchCode]) {
          dailyExpensesByBranch[branchCode] = {};
        }
        dailyExpensesByBranch[branchCode][day] =
          (dailyExpensesByBranch[branchCode][day] || 0) + (expense.expenseAmount || 0);
      }
    });

    return dailyExpensesByBranch;
  }, [expensesData, currentMonth, currentYear]); // Include currentMonth and currentYear as dependencies

  // Memoize the dailyExpensesByBranch, labels, and datasets to avoid unnecessary recalculations
  const { labels, datasets, branchTotals, overallTotal, branchColors } = useMemo(() => {
    const dailyExpensesByBranch = groupExpensesByBranchAndDayForCurrentMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const branchTotals: { [branch: string]: number } = {};
    const branchColors: { [branch: string]: string } = {}; // Store colors for each branch
    let overallTotal = 0;

    const datasets = Object.keys(dailyExpensesByBranch).map((branch) => {
      const branchData = dailyExpensesByBranch[branch];
      const data = labels.map((day) => branchData[day] || 0);

      // Calculate the total for each branch
      const totalForBranch = data.reduce((sum, amount) => sum + amount, 0);
      branchTotals[branch] = totalForBranch;
      overallTotal += totalForBranch;

      // Generate and store a color for the branch
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

    return { labels, datasets, branchTotals, overallTotal, branchColors };
  }, [groupExpensesByBranchAndDayForCurrentMonth, currentMonth, currentYear]); // Include currentMonth and currentYear as dependencies

  // Memoize the chartData to avoid unnecessary object recreation
  const chartData = useMemo(
    () => ({
      labels: labels,
      datasets: datasets,
    }),
    [labels, datasets]
  );

  // Effect to handle the chart lifecycle
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy(); // Destroy the existing chart instance if it exists
    }

    // Create a new chart instance
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

    // Cleanup function to destroy the chart instance on component unmount or update
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [chartData]); // Depend on chartData to update the chart when data changes

  return (
    <Paper elevation={3} sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Daily Expenses for Current Month
      </Typography>
      <canvas id="dailyExpensesChart" /> {/* Use a canvas for the chart */}
      
      {/* Summary Section */}
      <Box mt={2}>
        <Typography variant="h6">Summary (in UGX)</Typography>
        <Grid container spacing={2}>
          {Object.keys(branchTotals).map((branch) => (
            <Grid item xs={12} md={6} key={branch}>
              <Card sx={{ backgroundColor: branchColors[branch] + '20' }}> {/* Use a transparent background color */}
                <CardContent>
                  <Typography variant="h6">
                    {branch} Branch
                  </Typography>
                  <Typography variant="body1">
                    Total Expenses: {formatCurrencyUGX(branchTotals[branch])}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Typography variant="h6">
              Overall Total Expenses: {formatCurrencyUGX(overallTotal)}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default DailyExpensesChart;
