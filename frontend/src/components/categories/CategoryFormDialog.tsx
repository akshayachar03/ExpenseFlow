import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ReceiptIcon from "@mui/icons-material/Receipt";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import PaymentsIcon from "@mui/icons-material/Payments";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import MovieIcon from "@mui/icons-material/Movie";

import type { Category } from "../../types/category";
import CategoryIcon from "./CategoryIcon";

export interface CategoryFormValues {
  name: string;
  color: string;
  icon: string;
}

interface CategoryFormDialogProps {
  open: boolean;
  loading?: boolean;
  category?: Category | null;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void;
}

const iconOptions = [
  {
    value: "payments",
    label: "Salary",
    icon: <PaymentsIcon />,
  },
  {
    value: "restaurant",
    label: "Food",
    icon: <RestaurantIcon />,
  },
  {
    value: "shopping_cart",
    label: "Shopping",
    icon: <ShoppingCartIcon />,
  },
  {
    value: "directions_car",
    label: "Travel",
    icon: <DirectionsCarIcon />,
  },
  {
    value: "receipt",
    label: "Bills",
    icon: <ReceiptIcon />,
  },
  {
    value: "movie",
    label: "Entertainment",
    icon: <MovieIcon />,
  },
];

const initialValues: CategoryFormValues = {
  name: "",
  color: "#1976d2",
  icon: "payments",
};

const CategoryFormDialog = ({
  open,
  loading = false,
  category,
  onClose,
  onSubmit,
}: CategoryFormDialogProps) => {
  const [values, setValues] =
    useState<CategoryFormValues>(initialValues);

  useEffect(() => {
    if (category) {
      setValues({
        name: category.name,
        color: category.color,
        icon: category.icon,
      });
    } else {
      setValues(initialValues);
    }
  }, [category]);

  const handleSubmit = () => {
    onSubmit(values);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {category
          ? "Edit Category"
          : "Create Category"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} mt={1}>
          <TextField
            label="Category Name"
            value={values.name}
            onChange={(e) =>
              setValues({
                ...values,
                name: e.target.value,
              })
            }
            fullWidth
          />

          <Box>
            <Typography
              variant="body2"
              gutterBottom
            >
              Category Color
            </Typography>

            <TextField
              type="color"
              value={values.color}
              onChange={(e) =>
                setValues({
                  ...values,
                  color: e.target.value,
                })
              }
              fullWidth
            />
          </Box>

          <TextField
            select
            label="Icon"
            value={values.icon}
            onChange={(e) =>
              setValues({
                ...values,
                icon: e.target.value,
              })
            }
            fullWidth
          >
            {iconOptions.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >
                  {option.icon}

                  <Typography>
                    {option.label}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              gutterBottom
            >
              Preview
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <CategoryIcon
                icon={values.icon}
                color={values.color}
                size="large"
              />

              <Typography
                variant="h6"
                sx={{
                  color: values.color,
                  fontWeight: 600,
                }}
              >
                {values.name || "Category Name"}
              </Typography>
            </Stack>
          </Box>
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
          disabled={
            loading || values.name.trim().length < 2
          }
          onClick={handleSubmit}
        >
          {category ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryFormDialog;