import express from "express";
import cors from "cors";
import routes from "./routes";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:8080",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api", routes);

export default app;