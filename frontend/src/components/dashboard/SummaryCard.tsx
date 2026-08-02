import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  format?: "currency" | "number";
}

const currency = new Intl.NumberFormat(
  "en-IN",
  {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }
);

const SummaryCard = ({
  title,
  value,
  icon,
  format = "currency",
}: SummaryCardProps) => {
  return (
    <Card elevation={3}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack spacing={1}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {title}
            </Typography>

            <Typography
              variant="h5"
              fontWeight={700}
            >
              {format === "number"
                ? value.toLocaleString("en-IN")
                : currency.format(value)}
            </Typography>
          </Stack>

          {icon}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;