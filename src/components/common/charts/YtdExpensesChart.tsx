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

// Define the props for the YtdExpensesChart component
interface YtdExpensesChartProps {
  expensesData: Array<{ expenseDate: string; expenseAmount?: number; branchCode: string }>;
}

// Component for rendering year-to-date (YTD) expenses chart
const YtdExpensesChart: React.FC<YtdExpensesChartProps> = ({ expensesData }) => {
  const chartRef = useRef<Chart | null>(null);

  // Calculate chart data and summary with useMemo to avoid recalculating on every render
  const { chartData, ytdExpenses, branchColors, totalYtdExpenses } = useMemo(() => {
    const groupedData: { [key: string]: number[] } = {};
    const branchColors: { [key: string]: string } = {}; // Store colors for each branch

    expensesData.forEach((expense) => {
      const branchCode = expense.branchCode;
      const monthIndex = new Date(expense.expenseDate).getMonth();

      if (!groupedData[branchCode]) {
        groupedData[branchCode] = Array(12).fill(0);
      }

      groupedData[branchCode][monthIndex] += expense.expenseAmount || 0;

      // Generate and store a color for the branch
      if (!branchColors[branchCode]) {
        branchColors[branchCode] = getRandomColor();
      }
    });

    const calculateYTD = (groupedData: { [key: string]: number[] }) => {
      const ytdTotals: { [key: string]: number } = {};
      let totalYtdExpenses = 0;
      Object.keys(groupedData).forEach((branch) => {
        ytdTotals[branch] = groupedData[branch].reduce((acc, value) => acc + value, 0);
        totalYtdExpenses += ytdTotals[branch]; // Sum up all branch YTD expenses
      });
      return { ytdTotals, totalYtdExpenses };
    };

    const { ytdTotals, totalYtdExpenses } = calculateYTD(groupedData);

    const chartData = {
      labels: Object.keys(ytdTotals),
      datasets: [
        {
          label: 'YTD Expenses',
          data: Object.values(ytdTotals),
          backgroundColor: Object.keys(ytdTotals).map((branch) => branchColors[branch]),
        },
      ],
    };

    return { chartData, ytdExpenses: ytdTotals, branchColors, totalYtdExpenses };
  }, [expensesData]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = (document.getElementById('ytdExpensesChart') as HTMLCanvasElement).getContext('2d');
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
        Year-to-Date Expenses per Branch
      </Typography>
      <canvas id="ytdExpensesChart" />

      {/* Summary Section */}
      <Box mt={2}>
        <Typography variant="h6">YTD Expenses Summary (in UGX)</Typography>
        <Grid container spacing={2}>
          {Object.keys(ytdExpenses).map((branch) => (
            <Grid item xs={12} md={6} key={branch}>
              <Card sx={{ backgroundColor: branchColors[branch] + '20' }}> {/* Use a transparent background color */}
                <CardContent>
                  <Typography variant="h6">
                    {branch} Branch
                  </Typography>
                  <Typography variant="body1">
                    Total YTD expenses: {formatCurrencyUGX(ytdExpenses[branch])}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Typography variant="h6">
              Total YTD Expenses for All Branches: {formatCurrencyUGX(totalYtdExpenses)}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default YtdExpensesChart;
