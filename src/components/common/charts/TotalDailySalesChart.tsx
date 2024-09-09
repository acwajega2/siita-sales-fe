import React, { useRef, useEffect, useMemo } from 'react';
import Chart from 'chart.js/auto';
import { Typography, Paper, Box } from '@mui/material';

// Function to generate a random color for the chart line
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

// Define the props for the TotalDailySalesChart component
interface TotalDailySalesChartProps {
  salesData: Array<{ saleDate: string; saleAmount?: number; branchCode: string }>;
}

// Component for rendering total daily sales for all branches in the current month
const TotalDailySalesChart: React.FC<TotalDailySalesChartProps> = ({ salesData }) => {
  const chartRef = useRef<Chart | null>(null);

  // Get the current month and year
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Memoize the chart data and summary to optimize performance
  const { chartData, totalSales, runningAverage } = useMemo(() => {
    const groupedData: { [key: string]: number } = {};
    let totalSales = 0;

    salesData.forEach((sale) => {
      const saleDate = new Date(sale.saleDate);
      const saleAmount = sale.saleAmount || 0;

      const saleMonth = saleDate.getMonth();
      const saleYear = saleDate.getFullYear();

      // Filter for the current month and year
      if (saleMonth === currentMonth && saleYear === currentYear) {
        const formattedDate = saleDate.toDateString();

        if (!groupedData[formattedDate]) {
          groupedData[formattedDate] = 0;
        }

        groupedData[formattedDate] += saleAmount; // Sum sales for all branches for each day
        totalSales += saleAmount; // Sum total sales for the month
      }
    });

    // Sort the dates in ascending order
    const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const data = sortedDates.map((date) => groupedData[date]); // Total sales per day based on sorted dates

    // Calculate running average
    const runningAverage = totalSales / sortedDates.length;

    return {
      chartData: {
        labels: sortedDates, // Sorted dates
        datasets: [
          {
            label: 'Total Daily Sales (Current Month)',
            data: data,
            fill: false,
            backgroundColor: getRandomColor(),
            borderColor: getRandomColor(),
          },
        ],
      },
      totalSales,
      runningAverage,
    };
  }, [salesData, currentMonth, currentYear]);

  // Effect to handle chart lifecycle
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = (document.getElementById('totalDailySalesChart') as HTMLCanvasElement).getContext('2d');
    if (ctx) {
      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Sales Amount (UGX)',
              },
            },
          },
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
    <Paper elevation={3} sx={{ padding: 3 }}>
      <Typography variant="h6" gutterBottom>
        Total Daily Sales for All Branches (Current Month)
      </Typography>
      <canvas id="totalDailySalesChart" />

      {/* Summary Section */}
      <Box mt={3}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          Total Sales for Current Month: {formatCurrencyUGX(totalSales)}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 1 }}>
          Running Average Daily Sales: {formatCurrencyUGX(runningAverage)}
        </Typography>
      </Box>
    </Paper>
  );
};

export default TotalDailySalesChart;
