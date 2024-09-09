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

// Define the props for the YtdSalesChart component
interface YtdSalesChartProps {
  salesData: Array<{ saleDate: string; saleAmount?: number; branchCode: string }>;
}

// Component for rendering year-to-date (YTD) sales chart
const YtdSalesChart: React.FC<YtdSalesChartProps> = ({ salesData }) => {
  const chartRef = useRef<Chart | null>(null);

  // Calculate chart data and summary with useMemo to avoid recalculating on every render
  const { chartData, ytdSales, totalYtdSales } = useMemo(() => {
    const groupedData: { [key: string]: number[] } = {};
    const branchColors: { [key: string]: string } = {}; // Store colors for each branch

    salesData.forEach((sale) => {
      const branchCode = sale.branchCode;
      const monthIndex = new Date(sale.saleDate).getMonth();

      if (!groupedData[branchCode]) {
        groupedData[branchCode] = Array(12).fill(0);
      }

      groupedData[branchCode][monthIndex] += sale.saleAmount || 0;

      // Generate and store a color for the branch
      if (!branchColors[branchCode]) {
        branchColors[branchCode] = getRandomColor();
      }
    });

    const calculateYTD = (groupedData: { [key: string]: number[] }) => {
      const ytdTotals: { [key: string]: number } = {};
      let totalYtdSales = 0;
      Object.keys(groupedData).forEach((branch) => {
        ytdTotals[branch] = groupedData[branch].reduce((acc, value) => acc + value, 0);
        totalYtdSales += ytdTotals[branch]; // Sum up all branch YTD sales
      });
      return { ytdTotals, totalYtdSales };
    };

    const { ytdTotals, totalYtdSales } = calculateYTD(groupedData);

    const chartData = {
      labels: Object.keys(ytdTotals),
      datasets: [
        {
          label: 'YTD Sales',
          data: Object.values(ytdTotals),
          backgroundColor: Object.keys(ytdTotals).map((branch) => branchColors[branch]),
        },
      ],
    };

    return { chartData, ytdSales: ytdTotals, branchColors, totalYtdSales };
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
    <Paper elevation={3} sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Year-to-Date Sales per Branch
      </Typography>
      <canvas id="ytdSalesChart" />

      {/* Summary Section */}
      <Box mt={2}>
        <Typography variant="h6" gutterBottom>
          YTD Sales Summary (in UGX)
        </Typography>
        <Grid container spacing={3}>
          {Object.keys(ytdSales).map((branch) => (
            <Grid item xs={12} md={6} key={branch}>
              <Card
                sx={{
                  boxShadow: 4,
                  borderRadius: 3,
                  backgroundColor: '#f4f6f8',
                  padding: '20px',
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: '#1976d2',
                      marginBottom: '15px',
                    }}
                  >
                    {branch} Branch
                  </Typography>

                  <Typography variant="body2" gutterBottom>
                    <strong>Total YTD sales:</strong> {formatCurrencyUGX(ytdSales[branch])}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Card
              sx={{
                boxShadow: 4,
                borderRadius: 3,
                backgroundColor: '#f4f6f8',
                padding: '20px',
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: '#1976d2',
                    marginBottom: '15px',
                  }}
                >
                  Total YTD Sales for All Branches
                </Typography>

                <Typography variant="body1">
                  {formatCurrencyUGX(totalYtdSales)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default YtdSalesChart;
