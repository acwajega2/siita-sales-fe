// src/components/charts/DailyExpensesChart.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
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
  // Get the current month and year to filter the data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Function to group expenses by branch and day for the current month
  const groupExpensesByBranchAndDayForCurrentMonth = () => {
    // Object to hold the grouped data
    const dailyExpensesByBranch: { [branch: string]: { [day: string]: number } } = {};

    // Iterate over the expenses data to group by branch and day
    expensesData.forEach((expense) => {
      const expenseDate = new Date(expense.expenseDate); // Parse the expense date
      const day = expenseDate.getDate(); // Extract the day from the date
      const month = expenseDate.getMonth(); // Extract the month from the date
      const year = expenseDate.getFullYear(); // Extract the year from the date
      const branchCode = expense.branchCode; // Get the branch code

      // Check if the expense is in the current month and year
      if (month === currentMonth && year === currentYear) {
        if (!dailyExpensesByBranch[branchCode]) {
          // Initialize the branch if it doesn't exist
          dailyExpensesByBranch[branchCode] = {};
        }
        // Aggregate the expense amount for the specific branch and day
        dailyExpensesByBranch[branchCode][day] =
          (dailyExpensesByBranch[branchCode][day] || 0) + (expense.expenseAmount || 0);
      }
    });

    return dailyExpensesByBranch; // Return the grouped data
  };

  // Group expenses data by branch and day for the current month
  const dailyExpensesByBranch = groupExpensesByBranchAndDayForCurrentMonth();

  // Get the number of days in the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Create labels for each day in the current month
  const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Generate datasets for each branch to display in the chart
  const datasets = Object.keys(dailyExpensesByBranch).map((branch) => {
    const branchData = dailyExpensesByBranch[branch]; // Get daily data for the branch
    const data = labels.map((day) => branchData[day] || 0); // Map daily data to the array of days

    return {
      label: `Daily Expenses - ${branch}`, // Label for the dataset
      data: data, // Data points for the chart
      fill: false, // No fill under the line
      backgroundColor: getRandomColor(), // Random background color for the line
      borderColor: getRandomColor(), // Random border color for the line
    };
  });

  // Chart data object containing labels and datasets
  const chartData = {
    labels: labels, // Day labels for the X-axis
    datasets: datasets, // Data points for each branch
  };

  // Render the chart inside a Material-UI Paper component
  return (
    <Paper elevation={3} sx={{ padding: 2, height: '300px' }}>
      <Typography variant="h6" gutterBottom>
        Daily Expenses for Current Month
      </Typography>
      <Line data={chartData} /> {/* Line chart component from react-chartjs-2 */}
    </Paper>
  );
};

export default DailyExpensesChart;
