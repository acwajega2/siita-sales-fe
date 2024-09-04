// src/components/charts/MonthlySalesChart.tsx
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

// Define the props for the MonthlySalesChart component
interface MonthlySalesChartProps {
  salesData: Array<{ saleDate: string; saleAmount?: number; branchCode: string }>;
}

// Component for rendering monthly sales chart
const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ salesData }) => {
  const chartRef = useRef<Chart | null>(null);

  const chartData = useMemo(() => {
    const groupedData: { [key: string]: number[] } = {};

    salesData.forEach((sale) => {
      const branchCode = sale.branchCode;
      const monthIndex = new Date(sale.saleDate).getMonth();

      if (!groupedData[branchCode]) {
        groupedData[branchCode] = Array(12).fill(0);
      }

      groupedData[branchCode][monthIndex] += sale.saleAmount || 0;
    });

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const datasets = Object.keys(groupedData).map((branch) => {
      const randomColor = getRandomColor();
      return {
        label: `Sales - ${branch}`,
        data: groupedData[branch],
        fill: false,
        backgroundColor: randomColor,
        borderColor: randomColor,
      };
    });

    return {
      labels: labels,
      datasets: datasets,
    };
  }, [salesData]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = (document.getElementById('monthlySalesChart') as HTMLCanvasElement).getContext('2d');
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
        Monthly Sales by Branch
      </Typography>
      <canvas id="monthlySalesChart" />
    </Paper>
  );
};

export default MonthlySalesChart;
