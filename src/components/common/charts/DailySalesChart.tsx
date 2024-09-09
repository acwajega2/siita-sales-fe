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

// Helper function to group sales by branch and day for a given month
const groupSalesByBranchAndMonth = (salesData: any[], month: number, year: number) => {
  const salesByBranch: { [branch: string]: { [day: number]: number } } = {};
  salesData.forEach((sale) => {
    const saleDate = new Date(sale.saleDate);
    const day = saleDate.getDate();
    const saleMonth = saleDate.getMonth();
    const saleYear = saleDate.getFullYear();
    const branchCode = sale.branchCode;

    if (saleMonth === month && saleYear === year) {
      if (!salesByBranch[branchCode]) {
        salesByBranch[branchCode] = {};
      }
      salesByBranch[branchCode][day] = (salesByBranch[branchCode][day] || 0) + (sale.saleAmount || 0);
    }
  });
  return salesByBranch;
};

// Component for rendering daily sales chart
const DailySalesChart: React.FC<DailySalesChartProps> = ({ salesData }) => {
  const chartRef = useRef<Chart | null>(null);

  // Calculate chart data and totals with useMemo to avoid recalculating on every render
  const { labels, datasets, branchTotals, branchLastMonthTotals, branchSalesDifference, branchSalesPercentage, currentSalesTotal, lastMonthSalesTotal } = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const today = new Date().getDate();

    // Calculate sales for the current and last month
    const dailySalesByBranch = groupSalesByBranchAndMonth(salesData, currentMonth, currentYear);
    const lastMonthSalesByBranch = groupSalesByBranchAndMonth(salesData, currentMonth - 1, currentYear);

    const labels = Array.from({ length: today }, (_, i) => i + 1);

    let currentSalesTotal = 0;
    let lastMonthSalesTotal = 0;
    const branchTotals: { [branch: string]: number } = {};
    const branchLastMonthTotals: { [branch: string]: number } = {};
    const branchSalesDifference: { [branch: string]: number } = {};
    const branchSalesPercentage: { [branch: string]: string } = {};

    const datasets = Object.keys(dailySalesByBranch).map((branch) => {
      const branchData = dailySalesByBranch[branch];
      const data = labels.map((day) => branchData[day] || 0);

      // Calculate the total sales for each branch this month
      const totalForBranch = data.reduce((sum, amount) => sum + amount, 0);
      branchTotals[branch] = totalForBranch;
      currentSalesTotal += totalForBranch;

      // Calculate last month’s sales total for the same branch
      const lastMonthBranchData = lastMonthSalesByBranch[branch] || {};
      const lastMonthTotalForBranch = labels.reduce((sum, day) => sum + (lastMonthBranchData[day] || 0), 0);
      branchLastMonthTotals[branch] = lastMonthTotalForBranch;
      lastMonthSalesTotal += lastMonthTotalForBranch;

      // Calculate net improvement or decline and percentage change for each branch
      const difference = totalForBranch - lastMonthTotalForBranch;
      const percentageChange = lastMonthTotalForBranch
        ? ((difference / lastMonthTotalForBranch) * 100).toFixed(2)
        : 'N/A';

      branchSalesDifference[branch] = difference;
      branchSalesPercentage[branch] = percentageChange;

      // Generate a random color for each branch
      const branchColor = getRandomColor();

      return {
        label: `Sales - ${branch}`,
        data: data,
        fill: false,
        backgroundColor: branchColor,
        borderColor: branchColor,
      };
    });

    return { labels, datasets, branchTotals, branchLastMonthTotals, branchSalesDifference, branchSalesPercentage, currentSalesTotal, lastMonthSalesTotal };
  }, [salesData]);

  // Effect to handle the chart lifecycle
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy(); // Destroy the existing chart instance
    }

    const ctx = (document.getElementById('dailySalesChart') as HTMLCanvasElement).getContext('2d');
    if (ctx) {
      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets,
        },
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
  }, [labels, datasets]);

  const overallSalesDifference = currentSalesTotal - lastMonthSalesTotal;
  const overallPercentageChange = lastMonthSalesTotal
    ? ((overallSalesDifference / lastMonthSalesTotal) * 100).toFixed(2)
    : 'N/A';

  return (
    <Paper elevation={3} sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Daily Sales for Current Month (Grouped by Branch)
      </Typography>
      <canvas id="dailySalesChart" />

      {/* Summary Section */}
      <Box mt={2}>
        <Typography variant="h6" gutterBottom>
          Sales Summary (in UGX)
        </Typography>
        <Grid container spacing={3}>
          {Object.keys(branchTotals).map((branch) => {
            const isImprovement = branchSalesDifference[branch] >= 0;
            return (
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
                      <strong>Total Sales (This Month):</strong>{' '}
                      {formatCurrencyUGX(branchTotals[branch])}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Total Sales (Last Month, same period):</strong>{' '}
                      {formatCurrencyUGX(branchLastMonthTotals[branch])}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'bold',
                        color: isImprovement ? 'green' : 'red',
                        marginTop: '10px',
                      }}
                    >
                      {isImprovement ? 'Net Improvement' : 'Decline'}: {formatCurrencyUGX(branchSalesDifference[branch])} ({branchSalesPercentage[branch]}%)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
          <Grid item xs={12}>
            <Card sx={{ boxShadow: 4, borderRadius: 3, backgroundColor: '#f4f6f8', padding: '20px' }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: '#1976d2',
                    marginBottom: '15px',
                  }}
                >
                  Overall Sales Summary
                </Typography>

                <Typography variant="body2" gutterBottom>
                  <strong>Total Sales (This Month):</strong>{' '}
                  {formatCurrencyUGX(currentSalesTotal)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Total Sales (Last Month, same period):</strong>{' '}
                  {formatCurrencyUGX(lastMonthSalesTotal)}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 'bold',
                    color: overallSalesDifference >= 0 ? 'green' : 'red',
                    marginTop: '10px',
                  }}
                >
                  {overallSalesDifference >= 0 ? 'Net Improvement' : 'Decline'}: {formatCurrencyUGX(overallSalesDifference)} ({overallPercentageChange}%)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default DailySalesChart;
