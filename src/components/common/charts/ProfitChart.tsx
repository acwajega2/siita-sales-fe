// src/components/charts/ProfitChart.tsx
import React, { useRef, useEffect, useMemo } from 'react';
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

// Define the props for the ProfitChart component
interface ProfitChartProps {
  salesData: Array<{ saleDate: string; saleAmount?: number; branchCode: string }>;
  expensesData: Array<{ expenseDate: string; expenseAmount?: number; branchCode: string }>;
}

// Component for rendering monthly profit chart
const ProfitChart: React.FC<ProfitChartProps> = ({ salesData, expensesData }) => {
  const chartRef = useRef<Chart | null>(null);

  const chartData = useMemo(() => {
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
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const datasets = Object.keys(monthlyProfitByBranch).map((branch) => {
      const randomColor = getRandomColor();
      return {
        label: `Profit - ${branch}`,
        data: monthlyProfitByBranch[branch],
        fill: false,
        backgroundColor: randomColor,
        borderColor: randomColor,
      };
    });

    return {
      labels: labels,
      datasets: datasets,
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
    <Paper elevation={3} sx={{ padding: 2, height: '300px' }}>
      <Typography variant="h6" gutterBottom>
        Monthly Profit by Branch
      </Typography>
      <canvas id="profitChart" />
    </Paper>
  );
};

export default ProfitChart;
