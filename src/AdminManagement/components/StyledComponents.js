import { styled, alpha } from '@mui/material/styles';
import { Button, TextField, Paper } from '@mui/material';
import { colors } from '../constants';

// Common Styled TextField
export const StyledTextField = styled(TextField)({
  '& label.Mui-focused': { color: colors.gold },
  '& .MuiOutlinedInput-root': {
    color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.2)',
    fontFamily: 'Arial, sans-serif',
    '& fieldset': { borderColor: alpha(colors.white, 0.2) },
    '&:hover fieldset': { borderColor: alpha(colors.gold, 0.7) },
    '&.Mui-focused fieldset': { borderColor: colors.gold },
    '& .MuiSvgIcon-root': { color: colors.textSecondary },
    // Placeholder text styling for better visibility
    '& input::placeholder': {
      color: alpha(colors.white, 0.6),
      opacity: 1,
      fontFamily: 'Arial, sans-serif',
    },
    '& textarea::placeholder': {
      color: alpha(colors.white, 0.6),
      opacity: 1,
      fontFamily: 'Arial, sans-serif',
    },
    // Autofill styles
    '& input:-webkit-autofill': {
      WebkitBoxShadow: `0 0 0 100px ${colors.lightBlack} inset !important`,
      WebkitTextFillColor: `${colors.white} !important`,
      caretColor: colors.white,
      borderRadius: '4px',
    },
    '& input:-webkit-autofill:hover': {
      WebkitBoxShadow: `0 0 0 100px ${colors.lightBlack} inset !important`,
      WebkitTextFillColor: `${colors.white} !important`,
    },
    '& input:-webkit-autofill:focus': {
      WebkitBoxShadow: `0 0 0 100px ${colors.lightBlack} inset !important`,
      WebkitTextFillColor: `${colors.white} !important`,
    },
    '& input:-webkit-autofill:active': {
      WebkitBoxShadow: `0 0 0 100px ${colors.lightBlack} inset !important`,
      WebkitTextFillColor: `${colors.white} !important`,
    },
  },
  '& .MuiInputLabel-root': {
    color: alpha(colors.white, 0.9),
    fontFamily: 'Arial, sans-serif',
    fontWeight: 500,
  },
  // Helper text styling for better visibility
  '& .MuiFormHelperText-root': {
    color: alpha(colors.white, 0.75),
    fontFamily: 'Arial, sans-serif',
    fontSize: '0.875rem',
    marginTop: '8px',
    lineHeight: 1.5,
  },
  // Hide number input spinners
  '& input[type=number]': {
    MozAppearance: 'textfield',
    '&::-webkit-outer-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
    '&::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
  },
});

// Common Styled Button
export const StyledButton = styled(Button)(({ variant = 'contained' }) => ({
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'bold',
  borderRadius: '8px',
  padding: '10px 24px',
  backgroundColor: variant === 'contained' ? colors.gold : 'transparent',
  color: variant === 'contained' ? colors.black : colors.textSecondary,
  border: variant === 'outlined' ? `1px solid ${colors.textSecondary}` : 'none',
  '&:hover': {
    backgroundColor: variant === 'contained' ? colors.darkGold : alpha(colors.white, 0.1),
  },
}));

// Section Card
export const SectionCard = styled(Paper)(({ theme }) => ({
  backgroundColor: colors.lightBlack,
  padding: theme.spacing(4),
  borderRadius: '16px',
  border: `1px solid ${alpha(colors.white, 0.1)}`,
  color: colors.white,
  marginBottom: theme.spacing(4),
}));

// Stat Card
export const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '12px',
  backgroundColor: colors.lightBlack,
  color: colors.white,
  height: '100%',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 16px ${alpha(colors.black, 0.3)}`,
  },
}));

// Welcome Banner
export const WelcomeBanner = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4, 3),
  marginBottom: theme.spacing(4),
  borderRadius: '16px',
  background: `linear-gradient(145deg, ${colors.lightBlack} 30%, ${colors.black} 100%)`,
  borderRight: `5px solid ${colors.gold}`,
  color: colors.white,
  position: 'relative',
}));

// Action Button (for forms)
export const ActionButton = styled(Button)(({ variant = 'contained' }) => ({
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'bold',
  borderRadius: '8px',
  padding: '10px 24px',
  backgroundColor: variant === 'contained' ? colors.gold : 'transparent',
  color: variant === 'contained' ? colors.black : colors.textSecondary,
  border: variant === 'outlined' ? `1px solid ${colors.textSecondary}` : 'none',
  '&:hover': {
    backgroundColor: variant === 'contained' ? colors.darkGold : alpha(colors.white, 0.1),
  },
  '& .MuiButton-startIcon': {
    marginRight: -4,
    marginLeft: 8
  }
}));
