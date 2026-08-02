import { Response } from "express";

import Expense from "../models/Expense";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const getDashboard = async (
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
    })
      .populate("category", "name color icon")
      .sort({
        date: -1,
        createdAt: -1,
      });

    const totalIncome = expenses
      .filter(
        (expense) => expense.type === "income"
      )
      .reduce(
        (sum, expense) =>
          sum + expense.amount,
        0
      );

    const totalExpense = expenses
      .filter(
        (expense) => expense.type === "expense"
      )
      .reduce(
        (sum, expense) =>
          sum + expense.amount,
        0
      );

    const currentMonth =
      new Date().getMonth();

    const currentYear =
      new Date().getFullYear();

    const monthlyIncome = expenses
      .filter((expense) => {
        const expenseDate = new Date(
          expense.date
        );

        return (
          expense.type === "income" &&
          expenseDate.getMonth() ===
            currentMonth &&
          expenseDate.getFullYear() ===
            currentYear
        );
      })
      .reduce(
        (sum, expense) =>
          sum + expense.amount,
        0
      );

    const monthlyExpense = expenses
      .filter((expense) => {
        const expenseDate = new Date(
          expense.date
        );

        return (
          expense.type === "expense" &&
          expenseDate.getMonth() ===
            currentMonth &&
          expenseDate.getFullYear() ===
            currentYear
        );
      })
      .reduce(
        (sum, expense) =>
          sum + expense.amount,
        0
      );

    const expenseByCategoryMap =
      expenses
        .filter(
          (expense) =>
            expense.type === "expense"
        )
        .reduce<
          Record<string, number>
        >((acc, expense) => {
          const category =
            typeof expense.category ===
              "object" &&
            expense.category &&
            "name" in expense.category
              ? String(
                  expense.category.name
                )
              : "Unknown";

          acc[category] =
            (acc[category] ?? 0) +
            expense.amount;

          return acc;
        }, {});

    const expenseByCategory =
      Object.entries(
        expenseByCategoryMap
      ).map(
        ([category, amount]) => ({
          category,
          amount,
        })
      );

    res.status(200).json({
      success: true,
      data: {
        totalBalance:
          totalIncome - totalExpense,

        totalIncome,

        totalExpense,

        monthlyIncome,

        monthlyExpense,

        expenseByCategory,

        recentTransactions:
          expenses.slice(0, 10),
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Internal server error.",
    });
  }
};