import Typography from "@mui/material/Typography";

interface AmountCellProps {
  amount: number;
  type: "income" | "expense";
}

const AmountCell = ({
  amount,
  type,
}: AmountCellProps) => {
  const isIncome = type === "income";

  return (
    <Typography
      fontWeight={700}
      color={
        isIncome
          ? "success.main"
          : "error.main"
      }
    >
      {isIncome ? "+" : "-"} ₹
      {amount.toLocaleString("en-IN")}
    </Typography>
  );
};

export default AmountCell;