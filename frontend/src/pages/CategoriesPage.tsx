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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import AppLayout from "../components/layout/AppLayout";

import categoryService from "../services/category.service";

import type { Category } from "../types/category";

import CategoryIcon from "../components/categories/CategoryIcon";

import CategoryFormDialog from "../components/categories/CategoryFormDialog";

import type {
  CategoryFormValues,
} from "../components/categories/CategoryFormDialog";

import DeleteCategoryDialog from "../components/categories/DeleteCategoryDialog";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");
  const loadCategories = async () => {
    try {
      setLoading(true);

      const response =
        await categoryService.getCategories();

      setCategories(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const openCreateDialog = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const openEditDialog = (
    category: Category
  ) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingCategory(null);
    setDialogOpen(false);
  };

  const saveCategory = async (
    values: CategoryFormValues
  ) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(
          editingCategory._id,
          values
        );

        setSuccess(
          "Category updated successfully."
        );
      } else {
        await categoryService.createCategory(
          values
        );

        setSuccess(
          "Category created successfully."
        );
      }

      closeDialog();

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save category."
      );
    }
  };

  const openDeleteDialog = (
    category: Category
  ) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setSelectedCategory(null);
    setDeleteDialogOpen(false);
  };

  const deleteCategory = async () => {
    if (!selectedCategory) {
      return;
    }

    try {
      await categoryService.deleteCategory(
        selectedCategory._id
      );

      closeDeleteDialog();

      setSuccess(
        "Category deleted successfully."
      );

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete category."
      );
    }
  };
  return (
    <AppLayout title="Categories">
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
              Categories
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Organize your income and expenses.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
          >
            Add Category
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
                  <TableCell width={80}>
                    Icon
                  </TableCell>

                  <TableCell>
                    Category
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      width: 120,
                    }}
                  >
                    Color
                  </TableCell>

                  <TableCell
                    align="center"
                    width={150}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                    >
                      <Stack
                        py={5}
                        spacing={1}
                        alignItems="center"
                      >
                        <Typography
                          variant="h6"
                        >
                          No Categories
                        </Typography>

                        <Typography
                          color="text.secondary"
                        >
                          Click "Add Category"
                          to create one.
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow
                      key={category._id}
                      hover
                    >
                      <TableCell>
                        <CategoryIcon
                          icon={category.icon}
                          color={category.color}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography
                          fontWeight={600}
                        >
                          {category.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              backgroundColor:
                                category.color,
                              border:
                                "2px solid #e0e0e0",
                            }}
                          />
                        </Box>
                      </TableCell>

                      <TableCell
                        align="center"
                      >
                        <IconButton
                          color="primary"
                          onClick={() =>
                            openEditDialog(
                              category
                            )
                          }
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() =>
                            openDeleteDialog(
                              category
                            )
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Paper>

        <CategoryFormDialog
          open={dialogOpen}
          category={editingCategory}
          onClose={closeDialog}
          onSubmit={saveCategory}
        />

        <DeleteCategoryDialog
          open={deleteDialogOpen}
          categoryName={
            selectedCategory?.name ?? ""
          }
          onCancel={closeDeleteDialog}
          onConfirm={deleteCategory}
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

export default CategoriesPage;