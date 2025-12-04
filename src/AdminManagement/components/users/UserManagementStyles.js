import { styled, alpha } from '@mui/material/styles';
import { Card, Tabs, Tab, TextField, ToggleButtonGroup, ToggleButton, Dialog } from '@mui/material';
import { colors } from '../../constants';

export const ManagementHeader = styled(Card)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  borderRadius: '16px',
  background: `linear-gradient(135deg, ${colors.lightBlack} 0%, ${colors.black} 100%)`,
  border: `1px solid ${alpha(colors.gold, 0.2)}`,
  color: colors.white
}));

export const StyledTabs = styled(Tabs)({
  '& .MuiTabs-indicator': {
    backgroundColor: colors.gold,
    height: '3px'
  }
});

export const StyledTab = styled(Tab)(({ theme }) => ({
  color: colors.textSecondary,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'bold',
  '&.Mui-selected': {
    color: colors.gold
  }
}));

export const SearchTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    color: colors.white,
    borderRadius: '8px',
    backgroundColor: colors.lightBlack
  },
  '& .MuiOutlinedInput-root fieldset': {
    borderColor: alpha(colors.gold, 0.3)
  }
});

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: colors.lightBlack,
  border: `1px solid ${alpha(colors.gold, 0.2)}`,
  borderRadius: '8px',
}));

export const StyledToggleButton = styled(ToggleButton)({
  color: colors.textSecondary,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'bold',
  border: 'none',
  padding: '8px 16px',
  '&.Mui-selected, &.Mui-selected:hover': {
    color: colors.black,
    backgroundColor: colors.gold,
  },
  '&:hover': {
    backgroundColor: alpha(colors.gold, 0.1),
  }
});

export const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: colors.lightBlack,
    color: colors.white,
    borderRadius: '16px',
    border: `1px solid ${alpha(colors.gold, 0.2)}`,
    fontFamily: 'Arial, sans-serif'
  }
}));

