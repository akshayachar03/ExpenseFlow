import { Response } from "express";

import Expense from "../models/Expense";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const getSummary = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
      return;
    }

    const expenses = await Expense.find({
      user: req.user.userId,
    });

    const totalIncome = expenses
      .filter((expense) => expense.type === "income")
      .reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

    const totalExpense = expenses
      .filter((expense) => expense.type === "expense")
      .reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyIncome = expenses
      .filter((expense) => {
        const date = new Date(expense.date);

        return (
          expense.type === "income" &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

    const monthlyExpense = expenses
      .filter((expense) => {
        const date = new Date(expense.date);

        return (
          expense.type === "expense" &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance:
          totalIncome - totalExpense,
        monthlyIncome,
        monthlyExpense,
        transactionCount:
          expenses.length,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};