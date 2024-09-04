// src/components/charts/DailyExpensesChart.tsx
import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import { Typography, Paper } from '@mui/material';

// Function to generate a random color for the chart lines
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
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

  // Function to group expenses by branch and day for the current month
  const groupExpensesByBranchAndDayForCurrentMonth = () => {
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
  };

  const dailyExpensesByBranch = groupExpensesByBranchAndDayForCurrentMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const datasets = Object.keys(dailyExpensesByBranch).map((branch) => {
    const branchData = dailyExpensesByBranch[branch];
    const data = labels.map((day) => branchData[day] || 0);

    return {
      label: `Daily Expenses - ${branch}`,
      data: data,
      fill: false,
      backgroundColor: getRandomColor(),
      borderColor: getRandomColor(),
    };
  });

  const chartData = {
    labels: labels,
    datasets: datasets,
  };

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
    <Paper elevation={3} sx={{ padding: 2, height: '300px' }}>
      <Typography variant="h6" gutterBottom>
        Daily Expenses for Current Month
      </Typography>
      <canvas id="dailyExpensesChart" /> {/* Use a canvas for the chart */}
    </Paper>
  );
};

export default DailyExpensesChart;
