import { useState } from "react";

import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  AccountCircle,
  Assessment,
  Category,
  Dashboard,
  Logout,
  Menu,
  ReceiptLong,
} from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";

import authService from "../../services/auth.service";
import Logo from "../../assets/expenseflow-logo.svg";

const drawerWidth = 280;

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface AppLayoutProps {
  title: string;
  children: React.ReactNode;
}

const AppLayout = ({
  title,
  children,
}: AppLayoutProps) => {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const user = authService.getUser();

  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: <Dashboard />,
      path: "/",
    },
    {
      label: "Expenses",
      icon: <ReceiptLong />,
      path: "/expenses",
    },
    {
      label: "Categories",
      icon: <Category />,
      path: "/categories",
    },
    {
      label: "Reports",
      icon: <Assessment />,
      path: "/reports",
    },
  ];

  const logout = () => {
    authService.logout();

    navigate("/login", {
      replace: true,
    });
  };

  const drawer = (
    <>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 2,
          minHeight: 120,
        }}
      >
        <Box
          component="img"
          src={Logo}
          alt="ExpenseFlow Logo"
          sx={{
            width: 250,
            height: "auto",
            objectFit: "contain",
          }}
        />
      </Toolbar>

      <Divider />

      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={
              location.pathname ===
              item.path
            }
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={item.label}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      <List>
        <ListItemButton>
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>

          <ListItemText
            primary={
              user?.name ?? "User"
            }
            secondary={
              user?.email ?? ""
            }
          />
        </ListItemButton>

        <ListItemButton
          onClick={logout}
        >
          <ListItemIcon>
            <Logout />
          </ListItemIcon>

          <ListItemText
            primary="Logout"
          />
        </ListItemButton>
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          width: {
            sm: `calc(100% - ${drawerWidth}px)`,
          },
          ml: {
            sm: `${drawerWidth}px`,
          },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() =>
              setMobileOpen(true)
            }
            sx={{
              mr: 2,
              display: {
                sm: "none",
              },
            }}
          >
            <Menu />
          </IconButton>

          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>

          <Tooltip
            title={
              user?.name ?? "User"
            }
          >
            <Avatar
              sx={{
                cursor: "pointer",
              }}
            >
              {user?.name
                ?.charAt(0)
                .toUpperCase() ?? "U"}
            </Avatar>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: {
            sm: drawerWidth,
          },
          flexShrink: {
            sm: 0,
          },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() =>
            setMobileOpen(false)
          }
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: {
              xs: "block",
              sm: "none",
            },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: {
              xs: "none",
              sm: "block",
            },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing:
                "border-box",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: {
            sm: `calc(100% - ${drawerWidth}px)`,
          },
        }}
      >
        <Toolbar />

        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;