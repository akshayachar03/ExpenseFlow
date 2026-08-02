import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import AppLayout from "../components/layout/AppLayout";
import SummaryCard from "../components/dashboard/SummaryCard";

import reportService from "../services/report.service";

import type { ReportSummary } from "../types/report";

const ReportsPage = () => {
  const [report, setReport] =
    useState<ReportSummary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadReport = async () => {
    try {
      setLoading(true);

      const response =
        await reportService.getSummary();

      setReport(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport();
  }, []);

  if (loading) {
    return (
      <AppLayout title="Reports">
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
    <AppLayout title="Reports">
      <Stack spacing={4}>
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
          >
            Reports
          </Typography>

          <Typography color="text.secondary">
            Financial summary of your
            transactions.
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
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
              md: 6,
              lg: 3,
            }}
          >
            <SummaryCard
              title="Total Income"
              value={
                report?.totalIncome ?? 0
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
              md: 6,
              lg: 3,
            }}
          >
            <SummaryCard
              title="Total Expense"
              value={
                report?.totalExpense ?? 0
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
              md: 6,
              lg: 3,
            }}
          >
            <SummaryCard
              title="Balance"
              value={
                report?.balance ?? 0
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
              md: 6,
              lg: 3,
            }}
          >
            <SummaryCard
              title="Transactions"
              value={
                report?.transactionCount ??
                0
              }
              format="number"
              icon={
                <ReceiptLongIcon
                  color="warning"
                  fontSize="large"
                />
              }
            />
          </Grid>
        </Grid>
      </Stack>
    </AppLayout>
  );
};

export default ReportsPage;