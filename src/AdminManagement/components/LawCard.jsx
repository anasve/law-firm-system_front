import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Divider,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import { colors } from '../constants';

const StyledAccordion = styled(Accordion)({
  backgroundColor: colors.white,
  color: colors.textDark,
  borderRadius: "8px !important",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  marginBottom: "12px",
  "&:before": { display: "none" },
});

const StyledAccordionSummary = styled(AccordionSummary)({
  minHeight: "64px",
  "& .MuiAccordionSummary-expandIconWrapper": { color: colors.textDark },
});

export default function LawCard({ 
  law, 
  expanded, 
  onExpand, 
  onEdit, 
  onStatusChange,
  currentTab 
}) {
  return (
    <StyledAccordion
      expanded={expanded === law.id}
      onChange={(_, isExpanded) => onExpand(isExpanded ? law.id : false)}
    >
      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" fontWeight="bold">
          {law.title}
        </Typography>
      </StyledAccordionSummary>
      <AccordionDetails>
        <Chip
          label={law.category}
          size="small"
          sx={{
            backgroundColor: alpha(colors.gold, 0.1),
            color: colors.gold,
            fontWeight: "bold",
          }}
        />
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: colors.textDark }}>
          Law Summary
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: alpha(colors.textDark, 0.8),
            lineHeight: 1.8,
            mb: 3,
            whiteSpace: "pre-line",
          }}
        >
          {law.summary}
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: colors.textDark }}>
          Full Law Description
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: alpha(colors.textDark, 0.8),
            lineHeight: 1.8,
            mb: 3,
            whiteSpace: "pre-line",
          }}
        >
          {law.full_content || law.fullContent || ''}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            borderTop: `1px solid ${alpha(colors.grey, 0.2)}`,
            pt: 1.5,
          }}
        >
          {law.status === "published" && currentTab !== 3 && (
            <>
              <Tooltip title="Edit">
                <IconButton onClick={() => onEdit(law)}>
                  <EditIcon sx={{ color: colors.gold }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Unpublish">
                <IconButton onClick={() => onStatusChange(law.id, "unpublish")}>
                  <CloudOffOutlinedIcon sx={{ color: colors.info }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Archive">
                <IconButton onClick={() => onStatusChange(law.id, "archive")}>
                  <ArchiveIcon sx={{ color: colors.grey }} />
                </IconButton>
              </Tooltip>
            </>
          )}
          {law.status === "draft" && currentTab !== 3 && (
            <>
              <Tooltip title="Edit">
                <IconButton onClick={() => onEdit(law)}>
                  <EditIcon sx={{ color: colors.gold }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Publish">
                <IconButton onClick={() => onStatusChange(law.id, "publish")}>
                  <CloudUploadOutlinedIcon sx={{ color: colors.success }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Archive">
                <IconButton onClick={() => onStatusChange(law.id, "archive")}>
                  <ArchiveIcon sx={{ color: colors.grey }} />
                </IconButton>
              </Tooltip>
            </>
          )}
          {(law.status === "archived" || currentTab === 3) && (
            <>
              <Tooltip title="Restore">
                <IconButton onClick={() => onStatusChange(law.id, "restore")}>
                  <UnarchiveIcon sx={{ color: colors.success }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Permanently">
                <IconButton onClick={() => onStatusChange(law.id, "delete")}>
                  <DeleteForeverIcon sx={{ color: colors.error }} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </AccordionDetails>
    </StyledAccordion>
  );
}
