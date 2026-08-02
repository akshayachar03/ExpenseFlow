import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

import {
  Card,
  CardContent,
  Typography,
} from "@mui/material";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface IncomeExpenseChartProps {
  income: number;
  expense: number;
}

const IncomeExpenseChart = ({
  income,
  expense,
}: IncomeExpenseChartProps) => {
  const data = {
    labels: [
      "Income",
      "Expense",
    ],
    datasets: [
      {
        data: [
          income,
          expense,
        ],
        backgroundColor: [
          "#4CAF50",
          "#F44336",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
        >
          Income vs Expense
        </Typography>

        <Doughnut data={data} />
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseChart;