import { Schema, model, Document, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  color: string;
  icon: string;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    color: {
      type: String,
      required: true,
      trim: true,
      match: /^#([A-Fa-f0-9]{6})$/,
    },
    icon: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
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

categorySchema.index(
  {
    user: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

const Category = model<ICategory>("Category", categorySchema);

export default Category;