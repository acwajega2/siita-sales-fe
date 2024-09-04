// src/components/charts/YtdExpensesChart.tsx
import React, { useRef, useEffect, useMemo } from 'react';
import Chart from 'chart.js/auto';
import { Typography, Paper } from '@mui/material';

// Function to generate a random color for the chart bars
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Define the props for the YtdExpensesChart component
interface YtdExpensesChartProps {
  expensesData: Array<{ expenseDate: string; expenseAmount?: number; branchCode: string }>;
}

// Component for rendering year-to-date (YTD) expenses chart
const YtdExpensesChart: React.FC<YtdExpensesChartProps> = ({ expensesData }) => {
  const chartRef = useRef<Chart | null>(null);

  const chartData = useMemo(() => {
    const groupedData: { [key: string]: number[] } = {};

    expensesData.forEach((expense) => {
      const branchCode = expense.branchCode;
      const monthIndex = new Date(expense.expenseDate).getMonth();

      if (!groupedData[branchCode]) {
        groupedData[branchCode] = Array(12).fill(0);
      }

      groupedData[branchCode][monthIndex] += expense.expenseAmount || 0;
    });

    const calculateYTD = (groupedData: { [key: string]: number[] }) => {
      const ytdTotals: { [key: string]: number } = {};
      Object.keys(groupedData).forEach((branch) => {
        ytdTotals[branch] = groupedData[branch].reduce((acc, value) => acc + value, 0);
      });
      return ytdTotals;
    };

    const ytdExpenses = calculateYTD(groupedData);

    return {
      labels: Object.keys(ytdExpenses),
      datasets: [
        {
          label: 'YTD Expenses',
          data: Object.values(ytdExpenses),
          backgroundColor: Object.keys(ytdExpenses).map(() => getRandomColor()),
        },
      ],
    };
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
    <Paper elevation={3} sx={{ padding: 2, height: '300px' }}>
      <Typography variant="h6" gutterBottom>
        Year-to-Date Expenses per Branch
      </Typography>
      <canvas id="ytdExpensesChart" />
    </Paper>
  );
};

export default YtdExpensesChart;
