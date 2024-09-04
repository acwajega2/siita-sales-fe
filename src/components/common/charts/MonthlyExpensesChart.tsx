// src/components/charts/MonthlyExpensesChart.tsx
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

// Define the props for the MonthlyExpensesChart component
interface MonthlyExpensesChartProps {
  expensesData: Array<{ expenseDate: string; expenseAmount?: number; branchCode: string }>;
}

// Component for rendering monthly expenses chart
const MonthlyExpensesChart: React.FC<MonthlyExpensesChartProps> = ({ expensesData }) => {
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

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const datasets = Object.keys(groupedData).map((branch) => {
      const randomColor = getRandomColor();
      return {
        label: `Expenses - ${branch}`,
        data: groupedData[branch],
        backgroundColor: randomColor,
        borderColor: randomColor,
      };
    });

    return {
      labels: labels,
      datasets: datasets,
    };
  }, [expensesData]);

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
    <Paper elevation={3} sx={{ padding: 2, height: '300px' }}>
      <Typography variant="h6" gutterBottom>
        Monthly Expenses by Branch
      </Typography>
      <canvas id="monthlyExpensesChart" />
    </Paper>
  );
};

export default MonthlyExpensesChart;
