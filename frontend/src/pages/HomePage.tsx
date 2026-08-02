import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import AppLayout from "../components/layout/AppLayout";

import SummaryCard from "../components/dashboard/SummaryCard";
import RecentTransactionList from "../components/dashboard/RecentTransactionList";
import IncomeExpenseChart from "../components/dashboard/IncomeExpenseChart";
import ExpenseCategoryChart from "../components/dashboard/ExpenseCategoryChart";

import dashboardService from "../services/dashboard.service";

import type { DashboardSummary } from "../types/dashboard";

const HomePage = () => {
  const [dashboard, setDashboard] =
    useState<DashboardSummary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const response =
        await dashboardService.getDashboard();

      setDashboard(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      <Stack spacing={4}>
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
          >
            Dashboard
          </Typography>

          <Typography color="text.secondary">
            Welcome back! Here's an overview
            of your finances.
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            onClose={() =>
              setError("")
            }
          >
            {error}
          </Alert>
        )}

        <Grid
          container
          spacing={3}
        >
          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 3,
            }}
          >
            <SummaryCard
              title="Total Balance"
              value={
                dashboard?.totalBalance ??
                0
              }
              icon={
                <AccountBalanceWalletIcon
                  color="primary"
                  fontSize="large"
                />
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 3,
            }}
          >
            <SummaryCard
              title="Income"
              value={
                dashboard?.totalIncome ??
                0
              }
              icon={
                <TrendingUpIcon
                  color="success"
                  fontSize="large"
                />
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 3,
            }}
          >
            <SummaryCard
              title="Expenses"
              value={
                dashboard?.totalExpense ??
                0
              }
              icon={
                <TrendingDownIcon
                  color="error"
                  fontSize="large"
                />
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 3,
            }}
          >
            <SummaryCard
              title="This Month"
              value={
                dashboard?.monthlyExpense ??
                0
              }
              icon={
                <CalendarMonthIcon
                  color="warning"
                  fontSize="large"
                />
              }
            />
          </Grid>
        </Grid>

        <Grid
          container
          spacing={3}
        >
          <Grid
            size={{
              xs: 12,
              lg: 6,
            }}
          >
            <IncomeExpenseChart
              income={
                dashboard?.totalIncome ??
                0
              }
              expense={
                dashboard?.totalExpense ??
                0
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              lg: 6,
            }}
          >
            <ExpenseCategoryChart
              data={
                dashboard?.expenseByCategory ??
                []
              }
            />
          </Grid>
        </Grid>

        <RecentTransactionList
          transactions={
            dashboard?.recentTransactions ??
            []
          }
        />
      </Stack>
    </AppLayout>
  );
};

export default HomePage;