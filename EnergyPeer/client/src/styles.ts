import { styled } from "@mui/material/styles";

export const Heading = styled("div")(({ theme }) => ({
  ...theme.typography.h6,
  padding: theme.spacing(1),
  textAlign: "left",
  color: theme.palette.text.primary,
}));

export const Content = styled("div")(({ theme }) => ({
  ...theme.typography.body1,
  padding: theme.spacing(1),
  textAlign: "left",
  color: theme.palette.text.secondary,
}));

export const SmallHeading = styled("div")(({ theme }) => ({
  ...theme.typography.body1,
  padding: theme.spacing(1),
  textAlign: "left",
  color: theme.palette.text.primary,
  fontWeight: "bold",
}));

export const SmallContent = styled("div")(({ theme }) => ({
  ...theme.typography.body1,
  padding: theme.spacing(1),
  textAlign: "left",
  color: theme.palette.text.secondary,
}));
