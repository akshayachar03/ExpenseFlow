import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";

import { Bar } from "react-chartjs-2";

import {
  Card,
  CardContent,
  Typography,
} from "@mui/material";

import type {
  ExpenseByCategory,
} from "../../types/dashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

interface ExpenseCategoryChartProps {
  data: ExpenseByCategory[];
}

const ExpenseCategoryChart = ({
  data,
}: ExpenseCategoryChartProps) => {
  return (
    <Card elevation={3}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
        >
          Expenses by Category
        </Typography>

        <Bar
          data={{
            labels: data.map(
              (item) =>
                item.category
            ),
            datasets: [
              {
                label: "Expense",
                data: data.map(
                  (item) =>
                    item.amount
                ),
                backgroundColor:
                  "#1976D2",
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
            },
          }}
        />
      </CardContent>
    </Card>
  );
};

export default ExpenseCategoryChart;