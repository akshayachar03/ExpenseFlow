import ReceiptIcon from "@mui/icons-material/Receipt";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import PaymentsIcon from "@mui/icons-material/Payments";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import MovieIcon from "@mui/icons-material/Movie";
import CategoryIconMui from "@mui/icons-material/Category";

interface CategoryIconProps {
  icon: string;
  color?: string;
  size?: "small" | "medium" | "large";
}

const CategoryIcon = ({
  icon,
  color,
  size = "medium",
}: CategoryIconProps) => {
  switch (icon) {
    case "receipt":
      return <ReceiptIcon sx={{ color }} fontSize={size} />;

    case "restaurant":
      return <RestaurantIcon sx={{ color }} fontSize={size} />;

    case "payments":
      return <PaymentsIcon sx={{ color }} fontSize={size} />;

    case "shopping_cart":
      return <ShoppingCartIcon sx={{ color }} fontSize={size} />;

    case "directions_car":
      return <DirectionsCarIcon sx={{ color }} fontSize={size} />;

    case "movie":
      return <MovieIcon sx={{ color }} fontSize={size} />;

    default:
      return <CategoryIconMui sx={{ color }} fontSize={size} />;
  }
};

export default CategoryIcon;