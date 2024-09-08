import React, { useRef, useEffect, useMemo } from 'react';
import Chart from 'chart.js/auto';
import { Typography, Paper, Box, Grid, Card, CardContent } from '@mui/material';

// Function to generate a random color for the chart bars and backgrounds
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

// Define the props for the MonthlyExpensesChart component
interface MonthlyExpensesChartProps {
  expensesData: Array<{ expenseDate: string; expenseAmount?: number; branchCode: string }>;
}

// Component for rendering monthly expenses chart
const MonthlyExpensesChart: React.FC<MonthlyExpensesChartProps> = ({ expensesData }) => {
  const chartRef = useRef<Chart | null>(null);

  // Calculate chart data and summary with useMemo to avoid recalculating on every render
  const { chartData, branchTotals, overallTotals, monthlyBranchTotals, branchColors } = useMemo(() => {
    const groupedData: { [branch: string]: number[] } = {};
    const branchTotals: { [branch: string]: number } = {};
    const overallTotals: number[] = Array(12).fill(0);
    const monthlyBranchTotals: { [branch: string]: number[] } = {}; // Track branch totals for each month
    const branchColors: { [branch: string]: string } = {}; // Store colors for each branch

    expensesData.forEach((expense) => {
      const branchCode = expense.branchCode;
      const monthIndex = new Date(expense.expenseDate).getMonth();

      if (!groupedData[branchCode]) {
        groupedData[branchCode] = Array(12).fill(0);
        monthlyBranchTotals[branchCode] = Array(12).fill(0); // Initialize monthly totals for the branch
      }

      const expenseAmount = expense.expenseAmount || 0;
      groupedData[branchCode][monthIndex] += expenseAmount;

      // Add to branch total
      branchTotals[branchCode] = (branchTotals[branchCode] || 0) + expenseAmount;
      monthlyBranchTotals[branchCode][monthIndex] += expenseAmount; // Store monthly total for the branch
      // Add to overall total for the month
      overallTotals[monthIndex] += expenseAmount;

      // Generate and store a color for the branch
      if (!branchColors[branchCode]) {
        branchColors[branchCode] = getRandomColor();
      }
    });

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const datasets = Object.keys(groupedData).map((branch) => {
      return {
        label: `Expenses - ${branch}`,
        data: groupedData[branch],
        backgroundColor: branchColors[branch],
        borderColor: branchColors[branch],
      };
    });

    return {
      chartData: {
        labels: labels,
        datasets: datasets,
      },
      branchTotals: branchTotals,
      overallTotals: overallTotals,
      monthlyBranchTotals: monthlyBranchTotals,
      branchColors: branchColors,
    };
  }, [expensesData]);

  // Effect to handle the chart lifecycle
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = (document.getElementById('monthlyExpensesChart') as HTMLCanvasElement).getContext('2d');
    if (ctx) {
      chartRef.current = new Chart(ctx, {
        type: 'bar',
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
        Monthly Expenses by Branch
      </Typography>
      <canvas id="monthlyExpensesChart" />

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
                  <Typography variant="h6" mt={2}>Monthly Breakdown:</Typography>
                  {chartData.labels.map((month, index) => (
                    <Typography variant="body2" key={month}>
                      {month}: {formatCurrencyUGX(monthlyBranchTotals[branch][index])}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Typography variant="h6">Monthly Overall Expenses:</Typography>
            {chartData.labels.map((month, index) => (
              <Typography variant="body1" key={month}>
                {month}: {formatCurrencyUGX(overallTotals[index])}
              </Typography>
            ))}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default MonthlyExpensesChart;
