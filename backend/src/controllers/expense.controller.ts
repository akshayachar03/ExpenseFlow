import { Response } from "express";
import Expense from "../models/Expense";
import Category from "../models/Category";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "../validators/expense.validator";

export const createExpense = async (
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

    const validation = createExpenseSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const category = await Category.findOne({
      _id: validation.data.category,
      user: req.user.userId,
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found.",
      });
      return;
    }

    const expense = await Expense.create({
      ...validation.data,
      user: req.user.userId,
    });

    const populatedExpense = await Expense.findById(expense._id).populate(
      "category",
      "name color icon"
    );

    res.status(201).json({
      success: true,
      message: "Transaction created successfully.",
      data: populatedExpense,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const getExpenses = async (
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

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const updateExpense = async (
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

    const validation = updateExpenseSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    if (validation.data.category) {
      const category = await Category.findOne({
        _id: validation.data.category,
        user: req.user.userId,
      });

      if (!category) {
        res.status(404).json({
          success: false,
          message: "Category not found.",
        });
        return;
      }
    }

    const expense = await Expense.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.userId,
      },
      validation.data,
      {
        new: true,
        runValidators: true,
      }
    ).populate("category", "name color icon");

    if (!expense) {
      res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully.",
      data: expense,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const deleteExpense = async (
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

    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!expense) {
      res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};