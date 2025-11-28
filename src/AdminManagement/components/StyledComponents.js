import { styled, alpha } from "@mui/material/styles";
import { TextField, Tabs, Tab, Box, Typography } from "@mui/material";
import { colors } from "../utils/constants";
import FindInPageOutlinedIcon from "@mui/icons-material/FindInPageOutlined";

export const SearchTextField = styled(TextField)({
  "& .MuiInput-underline:before": {
    borderBottomColor: alpha(colors.white, 0.4),
  },
  "&:hover .MuiInput-underline:before": { borderBottomColor: colors.gold },
  "& .MuiInput-underline:after": { borderBottomColor: colors.gold },
  "& .MuiInputBase-input": {
    color: colors.white,
    fontFamily: "Arial, sans-serif",
  },
});

export const StyledTabs = styled(Tabs)({
  minHeight: "48px",
  "& .MuiTabs-indicator": {
    backgroundColor: colors.gold,
    height: "3px",
    borderRadius: "2px",
  },
});

export const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: "48px",
  color: alpha(colors.white, 0.7),
  fontWeight: "bold",
  fontFamily: "Cairo, sans-serif",
  "&.Mui-selected": { color: colors.gold },
  textTransform: "none",
  fontSize: "0.8rem",
  gap: theme.spacing(0.75),
}));

export const EmptyState = ({ message, tab }) => {
  const messages = {
    0: "No laws match your search",
    1: "No published laws currently",
    2: "No unpublished laws currently",
    3: "Archive is currently empty",
  };
  return (
    <Box sx={{ textAlign: "center", p: 8, color: colors.textLight }}>
      <FindInPageOutlinedIcon
        sx={{ fontSize: 80, mb: 2, color: alpha(colors.white, 0.3) }}
      />
      <Typography variant="h6" fontWeight="bold">
        {messages[tab]}
      </Typography>
      <Typography variant="body1">{message}</Typography>
    </Box>
  );
};

