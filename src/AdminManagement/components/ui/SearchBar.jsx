import React from 'react';
import { TextField, InputAdornment, Box, Button } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { colors } from '../../constants';

const SearchTextField = styled(TextField)({
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

export default function SearchBar({ 
  searchQuery, 
  onSearchChange, 
  onAddClick, 
  addButtonText = "Add" 
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 3 }}>
      <SearchTextField
        variant="standard"
        placeholder="Search..."
        sx={{ flexGrow: 1 }}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: alpha(colors.white, 0.6) }} />
            </InputAdornment>
          ),
        }}
      />
      {onAddClick && (
        <Button
          onClick={onAddClick}
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: colors.gold,
            color: colors.black,
            fontWeight: "bold",
            padding: "10px 24px",
            borderRadius: "12px",
            "&:hover": { backgroundColor: colors.darkGold },
          }}
        >
          {addButtonText}
        </Button>
      )}
    </Box>
  );
}

