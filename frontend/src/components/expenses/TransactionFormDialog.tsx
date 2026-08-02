import { useEffect, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

import type { Category } from "../../types/category";
import type {
  CreateExpenseRequest,
  Expense,
} from "../../types/expense";

interface TransactionFormDialogProps {
  open: boolean;
  loading?: boolean;
  expense?: Expense | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (
    values: CreateExpenseRequest
  ) => void;
}

const initialForm: CreateExpenseRequest = {
  title: "",
  description: "",
  amount: 0,
  type: "expense",
  date: new Date()
    .toISOString()
    .substring(0, 10),
  category: "",
};

const TransactionFormDialog = ({
  open,
  loading = false,
  expense,
  categories,
  onClose,
  onSubmit,
}: TransactionFormDialogProps) => {
  const [form, setForm] =
    useState<CreateExpenseRequest>(
      initialForm
    );

  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title,
        description: expense.description,
        amount: expense.amount,
        type: expense.type,
        date: expense.date.substring(0, 10),
        category: expense.category._id,
      });
    } else {
      setForm(initialForm);
    }
  }, [expense, open]);

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {expense
          ? "Edit Transaction"
          : "Add Transaction"}
      </DialogTitle>

      <DialogContent>
        <Stack
          spacing={3}
          mt={1}
        >
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            fullWidth
          />

          <TextField
            label="Description"
            multiline
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description:
                  e.target.value,
              })
            }
            fullWidth
          />

          <TextField
            label="Amount"
            type="number"
            value={form.amount}
            onChange={(e) =>
              setForm({
                ...form,
                amount: Number(
                  e.target.value
                ),
              })
            }
            fullWidth
          />

          <TextField
            select
            label="Transaction Type"
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target
                  .value as
                  | "income"
                  | "expense",
              })
            }
            fullWidth
          >
            <MenuItem value="income">
              Income
            </MenuItem>

            <MenuItem value="expense">
              Expense
            </MenuItem>
          </TextField>

          <TextField
            select
            label="Category"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category:
                  e.target.value,
              })
            }
            fullWidth
          >
            {categories.map(
              (category) => (
                <MenuItem
                  key={category._id}
                  value={
                    category._id
                  }
                >
                  {category.name}
                </MenuItem>
              )
            )}
          </TextField>

          <TextField
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm({
                ...form,
                date: e.target.value,
              })
            }
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            loading ||
            form.title.trim()
              .length < 2 ||
            form.amount <= 0 ||
            form.category === ""
          }
        >
          {expense
            ? "Update"
            : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionFormDialog;