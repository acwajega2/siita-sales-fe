import React, { useRef, useEffect, useMemo } from 'react';
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

// Define the props for the ProfitChart component
interface ProfitChartProps {
  salesData: Array<{ saleDate: string; saleAmount?: number; branchCode: string }>;
  expensesData: Array<{ expenseDate: string; expenseAmount?: number; branchCode: string }>;
}

// Component for rendering monthly profit chart
const ProfitChart: React.FC<ProfitChartProps> = ({ salesData, expensesData }) => {
  const chartRef = useRef<Chart | null>(null);

  // Calculate chart data and summary with useMemo to avoid recalculating on every render
  const { chartData, branchProfits, overallMonthlyProfits, branchColors } = useMemo(() => {
    const groupAndAggregateDataByBranch = (data: Array<any>, dateKey: string, valueKey: string) => {
      const groupedData: { [key: string]: number[] } = {};
      data.forEach((item) => {
        const branchCode = item.branchCode;
        const monthIndex = new Date(item[dateKey]).getMonth();
        if (!groupedData[branchCode]) {
          groupedData[branchCode] = Array(12).fill(0);
        }
        groupedData[branchCode][monthIndex] += item[valueKey] || 0;
      });
      return groupedData;
    };

    const monthlySalesByBranch = groupAndAggregateDataByBranch(salesData, 'saleDate', 'saleAmount');
    const monthlyExpensesByBranch = groupAndAggregateDataByBranch(expensesData, 'expenseDate', 'expenseAmount');

    const calculateProfitByBranch = (sales: { [key: string]: number[] }, expenses: { [key: string]: number[] }) => {
      const profitByBranch: { [key: string]: number[] } = {};
      Object.keys(sales).forEach((branch) => {
        profitByBranch[branch] = sales[branch].map((salesAmount, index) => {
          const expenseAmount = expenses[branch] ? expenses[branch][index] : 0;
          return salesAmount - expenseAmount;
        });
      });
      return profitByBranch;
    };

    const monthlyProfitByBranch = calculateProfitByBranch(monthlySalesByBranch, monthlyExpensesByBranch);

    const branchProfits: { [key: string]: number } = {};
    const overallMonthlyProfits: number[] = Array(12).fill(0);
    const branchColors: { [key: string]: string } = {}; // Store colors for each branch

    Object.keys(monthlyProfitByBranch).forEach((branch) => {
      monthlyProfitByBranch[branch].forEach((profit, monthIndex) => {
        branchProfits[branch] = (branchProfits[branch] || 0) + profit;
        overallMonthlyProfits[monthIndex] += profit;

        // Generate and store a color for the branch
        if (!branchColors[branch]) {
          branchColors[branch] = getRandomColor();
        }
      });
    });

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const datasets = Object.keys(monthlyProfitByBranch).map((branch) => {
      return {
        label: `Profit - ${branch}`,
        data: monthlyProfitByBranch[branch],
        fill: false,
        backgroundColor: branchColors[branch],
        borderColor: branchColors[branch],
      };
    });

    return {
      chartData: {
        labels: labels,
        datasets: datasets,
      },
      branchProfits: branchProfits,
      overallMonthlyProfits: overallMonthlyProfits,
      branchColors: branchColors,
    };
  }, [salesData, expensesData]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = (document.getElementById('profitChart') as HTMLCanvasElement).getContext('2d');
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
        Monthly Profit by Branch
      </Typography>
      <canvas id="profitChart" />

      {/* Summary Section */}
      <Box mt={2}>
        <Typography variant="h6">Profit Summary (in UGX)</Typography>
        <Grid container spacing={2}>
          {Object.keys(branchProfits).map((branch) => (
            <Grid item xs={12} md={6} key={branch}>
              <Card sx={{ backgroundColor: branchColors[branch] + '20' }}> {/* Use a transparent background color */}
                <CardContent>
                  <Typography variant="h6">
                    {branch} Branch
                  </Typography>
                  <Typography variant="body1">
                    Total profit: {formatCurrencyUGX(branchProfits[branch])}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Typography variant="h6">Overall Monthly Profits:</Typography>
            {chartData.labels.map((month, index) => (
              <Typography variant="body1" key={month}>
                {month}: {formatCurrencyUGX(overallMonthlyProfits[index])}
              </Typography>
            ))}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ProfitChart;
