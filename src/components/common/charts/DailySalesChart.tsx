import React, { useRef, useEffect, useMemo } from 'react';
import Chart from 'chart.js/auto';
import { Typography, Paper, Box, Grid, Card, CardContent } from '@mui/material';

// Function to generate a random color for the chart lines and backgrounds
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

// Define the props for the DailySalesChart component
interface DailySalesChartProps {
  salesData: Array<{ saleDate: string; saleAmount?: number; branchCode: string }>;
}

// Component for rendering daily sales chart
const DailySalesChart: React.FC<DailySalesChartProps> = ({ salesData }) => {
  const chartRef = useRef<Chart | null>(null); // Reference to store the Chart instance

  // Calculate chart data and totals with useMemo to avoid recalculating on every render
  const { labels, datasets, branchTotals, overallTotal, branchRunningAverages, branchColors } = useMemo(() => {
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

    const branchTotals: { [branch: string]: number } = {};
    const branchRunningAverages: { [branch: string]: number } = {};
    const branchColors: { [branch: string]: string } = {}; // Store colors for each branch
    let overallTotal = 0;

    const datasets = Object.keys(dailySalesByBranch).map((branch) => {
      const branchData = dailySalesByBranch[branch];
      const data = labels.map((day) => branchData[day] || 0);

      // Calculate the total for each branch
      const totalForBranch = data.reduce((sum, amount) => sum + amount, 0);
      branchTotals[branch] = totalForBranch;
      overallTotal += totalForBranch;

      // Calculate the running average for the branch
      const daysWithSales = data.filter((amount) => amount > 0).length;
      branchRunningAverages[branch] = daysWithSales > 0 ? totalForBranch / daysWithSales : 0;

      // Generate and store a color for the branch
      const branchColor = getRandomColor();
      branchColors[branch] = branchColor;

      return {
        label: `Daily Sales - ${branch}`,
        data: data,
        fill: false,
        backgroundColor: branchColor,
        borderColor: branchColor,
      };
    });

    return { labels, datasets, branchTotals, overallTotal, branchRunningAverages, branchColors };
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
        data: {
          labels: labels,
          datasets: datasets,
        },
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
  }, [labels, datasets]); // Depend on labels and datasets

  return (
    <Paper elevation={3} sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Daily Sales for Current Month
      </Typography>
      <canvas id="dailySalesChart" /> {/* Use a canvas for the chart */}
      
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
                    Total Sales: {formatCurrencyUGX(branchTotals[branch])}
                  </Typography>
                  <Typography variant="body1">
                    Running Average: {formatCurrencyUGX(branchRunningAverages[branch])}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Typography variant="h6">
              Overall Total Sales: {formatCurrencyUGX(overallTotal)}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default DailySalesChart;
