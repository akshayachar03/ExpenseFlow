import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import CategoryIcon from "../categories/CategoryIcon";
import AmountCell from "../expenses/AmountCell";
import TransactionTypeChip from "../expenses/TransactionTypeChip";

import type { Expense } from "../../types/expense";

interface RecentTransactionListProps {
  transactions: Expense[];
}

const RecentTransactionList = ({
  transactions,
}: RecentTransactionListProps) => {
  if (transactions.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
        >
          Recent Transactions
        </Typography>

        <Box
          py={5}
          textAlign="center"
        >
          <Typography variant="h6">
            No Transactions
          </Typography>

          <Typography color="text.secondary">
            Add your first transaction to
            see it here.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography
        variant="h6"
        gutterBottom
      >
        Recent Transactions
      </Typography>

      <List disablePadding>
        {transactions.map((expense) => (
          <ListItem
            key={expense._id}
            divider
            disablePadding
            sx={{ py: 1.5 }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor:
                    expense.category.color,
                }}
              >
                <CategoryIcon
                  icon={expense.category.icon}
                />
              </Avatar>
            </ListItemAvatar>

            <ListItemText
              primary={expense.title}
              secondary={
                expense.category.name
              }
            />

            <Stack
              spacing={1}
              alignItems="flex-end"
            >
              <TransactionTypeChip
                type={expense.type}
              />

              <AmountCell
                amount={expense.amount}
                type={expense.type}
              />
            </Stack>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default RecentTransactionList;