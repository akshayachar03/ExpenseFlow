export interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
  icon: string;
}

export interface CategoryResponse {
  success: boolean;
  message?: string;
  data: Category;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}