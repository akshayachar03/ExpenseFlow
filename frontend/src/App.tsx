import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CategoriesPage from "./pages/CategoriesPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportsPage";

import authService from "./services/auth.service";

const App = () => {
  const authenticated = authService.isAuthenticated();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <ExpensesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <CategoriesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/login"
        element={
          authenticated ? (
            <Navigate
              to="/"
              replace
            />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route
        path="/register"
        element={
          authenticated ? (
            <Navigate
              to="/"
              replace
            />
          ) : (
            <RegisterPage />
          )
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={
              authenticated
                ? "/"
                : "/login"
            }
            replace
          />
        }
      />
    </Routes>
  );
};

export default App;