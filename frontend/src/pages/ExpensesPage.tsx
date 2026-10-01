import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import AppLayout from "../components/layout/AppLayout";

import expenseService from "../services/expense.service";
import categoryService from "../services/category.service";

import type {
  CreateExpenseRequest,
  Expense,
} from "../types/expense";

import type { Category } from "../types/category";

import CategoryIcon from "../components/categories/CategoryIcon";

import AmountCell from "../components/expenses/AmountCell";

import TransactionTypeChip from "../components/expenses/TransactionTypeChip";

import TransactionFormDialog from "../components/expenses/TransactionFormDialog";

import DeleteTransactionDialog from "../components/expenses/DeleteTransactionDialog";

const ExpensesPage = () => {
  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [editingExpense, setEditingExpense] =
    useState<Expense | null>(null);

  const [selectedExpense, setSelectedExpense] =
    useState<Expense | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");
  const loadExpenses = async () => {
    try {
      setLoading(true);

      const response =
        await expenseService.getExpenses();

      setExpenses(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response =
        await categoryService.getCategories();

      setCategories(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load categories."
      );
    }
  };

  const refreshData = async () => {
    await Promise.all([
      loadExpenses(),
      loadCategories(),
    ]);
  };

  useEffect(() => {
    void refreshData();
  }, []);

  const openCreateDialog = () => {
    setEditingExpense(null);
    setDialogOpen(true);
  };

  const openEditDialog = (
    expense: Expense
  ) => {
    setEditingExpense(expense);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingExpense(null);
    setDialogOpen(false);
  };

  const saveExpense = async (
    values: CreateExpenseRequest
  ) => {
    try {
      if (editingExpense) {
        await expenseService.updateExpense(
          editingExpense._id,
          values
        );

        setSuccess(
          "Transaction updated successfully."
        );
      } else {
        await expenseService.createExpense(
          values
        );

        setSuccess(
          "Transaction created successfully."
        );
      }

      closeDialog();

      await loadExpenses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save transaction."
      );
    }
  };

  const openDeleteDialog = (
    expense: Expense
  ) => {
    setSelectedExpense(expense);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setSelectedExpense(null);
    setDeleteDialogOpen(false);
  };

  const deleteExpense = async () => {
    if (!selectedExpense) {
      return;
    }

    try {
      await expenseService.deleteExpense(
        selectedExpense._id
      );

      closeDeleteDialog();

      setSuccess(
        "Transaction deleted successfully."
      );

      await loadExpenses();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete transaction."
      );
    }
  };
  return (
    <AppLayout title="Expenses">
      <Stack spacing={3}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={700}
            >
              Expenses
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Track your income and expenses.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
          >
            Add Transaction
          </Button>
        </Box>

        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        <Paper elevation={3}>
          {loading ? (
            <Box
              py={8}
              display="flex"
              justifyContent="center"
            >
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Date
                  </TableCell>

                  <TableCell>
                    Transaction
                  </TableCell>

                  <TableCell>
                    Category
                  </TableCell>

                  <TableCell align="center">
                    Type
                  </TableCell>

                  <TableCell align="right">
                    Amount
                  </TableCell>

                  <TableCell
                    align="center"
                    width={120}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                    >
                      <Stack
                        spacing={1}
                        py={5}
                        alignItems="center"
                      >
                        <Typography
                          variant="h6"
                        >
                          No Transactions
                        </Typography>

                        <Typography
                          color="text.secondary"
                        >
                          Click "Add
                          Transaction"
                          to create your
                          first record.
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map(
                    (expense) => (
                      <TableRow
                        key={expense._id}
                        hover
                      >
                        <TableCell>
                          {new Date(
                            expense.date
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography
                            fontWeight={
                              600
                            }
                          >
                            {
                              expense.title
                            }
                          </Typography>

                          {expense.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {
                                expense.description
                              }
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1.5}
                          >
                            <CategoryIcon
                              icon={
                                expense
                                  .category
                                  .icon
                              }
                              color={
                                expense
                                  .category
                                  .color
                              }
                            />

                            <Typography>
                              {
                                expense
                                  .category
                                  .name
                              }
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell align="center">
                          <TransactionTypeChip
                            type={
                              expense.type
                            }
                          />
                        </TableCell>

                        <TableCell align="right">
                          <AmountCell
                            amount={
                              expense.amount
                            }
                            type={
                              expense.type
                            }
                          />
                        </TableCell>

                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() =>
                              openEditDialog(
                                expense
                              )
                            }
                          >
                            <EditIcon />
                          </IconButton>

                          <IconButton
                            color="error"
                            onClick={() =>
                              openDeleteDialog(
                                expense
                              )
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          )}
        </Paper>
        <TransactionFormDialog
          open={dialogOpen}
          expense={editingExpense}
          categories={categories}
          onClose={closeDialog}
          onSubmit={saveExpense}
        />

        <DeleteTransactionDialog
          open={deleteDialogOpen}
          title={
            selectedExpense?.title ?? ""
          }
          onCancel={closeDeleteDialog}
          onConfirm={deleteExpense}
        />

        <Snackbar
          open={success.length > 0}
          autoHideDuration={3000}
          onClose={() => setSuccess("")}
          message={success}
        />
      </Stack>
    </AppLayout>
  );
};

export default ExpensesPage;