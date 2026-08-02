import { Document, Schema, Types, model } from "mongoose";

export interface IExpense extends Document {
  title: string;
  description?: string;
  amount: number;
  type: "income" | "expense";
  date: Date;
  category: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

expenseSchema.index({
  user: 1,
  date: -1,
});

expenseSchema.index({
  user: 1,
  category: 1,
});

const Expense = model<IExpense>("Expense", expenseSchema);

export default Expense;