// src/components/charts/YtdSalesChart.tsx
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

// Define the props for the YtdSalesChart component
interface YtdSalesChartProps {
  salesData: Array<{ saleDate: string; saleAmount?: number; branchCode: string }>;
}

// Component for rendering year-to-date (YTD) sales chart
const YtdSalesChart: React.FC<YtdSalesChartProps> = ({ salesData }) => {
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

    const calculateYTD = (groupedData: { [key: string]: number[] }) => {
      const ytdTotals: { [key: string]: number } = {};
      Object.keys(groupedData).forEach((branch) => {
        ytdTotals[branch] = groupedData[branch].reduce((acc, value) => acc + value, 0);
      });
      return ytdTotals;
    };

    const ytdSales = calculateYTD(groupedData);

    return {
      labels: Object.keys(ytdSales),
      datasets: [
        {
          label: 'YTD Sales',
          data: Object.values(ytdSales),
          backgroundColor: Object.keys(ytdSales).map(() => getRandomColor()),
        },
      ],
    };
  }, [salesData]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = (document.getElementById('ytdSalesChart') as HTMLCanvasElement).getContext('2d');
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
        Year-to-Date Sales per Branch
      </Typography>
      <canvas id="ytdSalesChart" />
    </Paper>
  );
};

export default YtdSalesChart;
