import type {
  CategoriesResponse,
  CategoryResponse,
  CreateCategoryRequest,
} from "../types/category";
import authService from "./auth.service";

const API_BASE_URL = "http://localhost:5000/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = authService.getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Request failed.");
  }

  return data as T;
}

export const getCategories = async (): Promise<CategoriesResponse> => {
  return request<CategoriesResponse>("/categories");
};

export const createCategory = async (
  payload: CreateCategoryRequest
): Promise<CategoryResponse> => {
  return request<CategoryResponse>("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateCategory = async (
  id: string,
  payload: Partial<CreateCategoryRequest>
): Promise<CategoryResponse> => {
  return request<CategoryResponse>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteCategory = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  return request(`/categories/${id}`, {
    method: "DELETE",
  });
};

const categoryService = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;