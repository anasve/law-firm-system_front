import { styled, alpha } from '@mui/material/styles';
import { Tabs, Tab } from '@mui/material';
import { colors } from '../../constants';

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
  fontFamily: "Arial, sans-serif",
  "&.Mui-selected": { color: colors.gold },
  textTransform: "none",
  fontSize: "0.8rem",
  gap: theme.spacing(0.75),
}));

export const newLawInitialState = {
  title: "",
  category: "",
  summary: "",
  full_content: "",
};

