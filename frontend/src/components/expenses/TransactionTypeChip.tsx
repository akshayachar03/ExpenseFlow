import Chip from "@mui/material/Chip";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface TransactionTypeChipProps {
  type: "income" | "expense";
}

const TransactionTypeChip = ({
  type,
}: TransactionTypeChipProps) => {
  const isIncome = type === "income";

  return (
    <Chip
      icon={
        isIncome ? (
          <TrendingUpIcon />
        ) : (
          <TrendingDownIcon />
        )
      }
      label={
        isIncome ? "Income" : "Expense"
      }
      color={
        isIncome ? "success" : "error"
      }
      variant="filled"
      size="small"
    />
  );
};

export default TransactionTypeChip;