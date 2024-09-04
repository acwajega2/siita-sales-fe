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

// Define the props for the DailySalesChart component
interface DailySalesChartProps {
  salesData: Array<{ saleDate: string; saleAmount?: number; branchCode: string }>;
}

// Component for rendering daily sales chart
const DailySalesChart: React.FC<DailySalesChartProps> = ({ salesData }) => {
  const chartRef = useRef<Chart | null>(null); // Reference to store the Chart instance

  // Calculate chart data with useMemo to avoid recalculating on every render
  const chartData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Function to group sales by branch and day for the current month
    const groupSalesByBranchAndDayForCurrentMonth = () => {
      const dailySalesByBranch: { [branch: string]: { [day: string]: number } } = {};
      salesData.forEach((sale) => {
        const saleDate = new Date(sale.saleDate);
        const day = saleDate.getDate();
        const month = saleDate.getMonth();
        const year = saleDate.getFullYear();
        const branchCode = sale.branchCode;

        if (month === currentMonth && year === currentYear) {
          if (!dailySalesByBranch[branchCode]) {
            dailySalesByBranch[branchCode] = {};
          }
          dailySalesByBranch[branchCode][day] =
            (dailySalesByBranch[branchCode][day] || 0) + (sale.saleAmount || 0);
        }
      });

      return dailySalesByBranch;
    };

    const dailySalesByBranch = groupSalesByBranchAndDayForCurrentMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const datasets = Object.keys(dailySalesByBranch).map((branch) => {
      const branchData = dailySalesByBranch[branch];
      const data = labels.map((day) => branchData[day] || 0);

      return {
        label: `Daily Sales - ${branch}`,
        data: data,
        fill: false,
        backgroundColor: getRandomColor(),
        borderColor: getRandomColor(),
      };
    });

    return {
      labels: labels,
      datasets: datasets,
    };
  }, [salesData]); // Depend on salesData to update the chart when data changes

  // Effect to handle the chart lifecycle
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy(); // Destroy the existing chart instance if it exists
    }

    // Create a new chart instance
    const ctx = (document.getElementById('dailySalesChart') as HTMLCanvasElement).getContext('2d');
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
  }, [chartData]); // Depend on chartData

  return (
    <Paper elevation={3} sx={{ padding: 2, height: '300px' }}>
      <Typography variant="h6" gutterBottom>
        Daily Sales for Current Month
      </Typography>
      <canvas id="dailySalesChart" /> {/* Use a canvas for the chart */}
    </Paper>
  );
};

export default DailySalesChart;
