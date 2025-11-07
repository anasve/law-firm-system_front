import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  IconButton,
  Chip,
  Tooltip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from '@mui/icons-material/Unarchive'; // تم استيراد أيقونة إلغاء الأرشفة
import VisibilityIcon from "@mui/icons-material/Visibility";

// تم إضافة onUnarchive إلى الخصائص
export default function LawyerCard({ lawyer, onEdit, onDelete, onArchive, onUnarchive, onView }) {
  return (
    <Card
      sx={{
        minWidth: 260,
        borderRadius: 3,
        boxShadow: 3,
        m: 1,
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: 6 }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <Avatar sx={{ bgcolor: "#1976d2", mr: 1 }}>
            {lawyer.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </Avatar>
          <Box>
            <Typography fontWeight="bold">{lawyer.name}</Typography>
            <Typography variant="body2" color="primary">
              {lawyer.specialty}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" noWrap>
          البريد الإلكتروني: {lawyer.email}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          الهاتف: {lawyer.phone}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          رقم النقابة: {lawyer.barNumber}
        </Typography>
        {lawyer.address && (
          <Typography variant="body2" color="text.secondary">
            العنوان: {lawyer.address}
          </Typography>
        )}
        <Box mt={1} mb={1}>
          <Chip
            label={lawyer.status === "active" ? "نشط" : "مؤرشف"}
            color={lawyer.status === "active" ? "success" : "default"}
            size="small"
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          عدد القضايا: {lawyer.cases}
        </Typography>
        <Box mt={1} display="flex" justifyContent="flex-end" gap={1}>
          <Tooltip title="عرض">
            <IconButton onClick={() => onView(lawyer)}>
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="تعديل">
            <IconButton onClick={() => onEdit(lawyer)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          
          {/* --- هذا هو الجزء الذي تم تعديله --- */}
          {lawyer.status === 'active' ? (
            <Tooltip title="أرشفة">
              <IconButton onClick={() => onArchive(lawyer)}>
                <ArchiveIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="إلغاء الأرشفة">
              <IconButton onClick={() => onUnarchive(lawyer)}>
                <UnarchiveIcon />
              </IconButton>
            </Tooltip>
          )}
          {/* --- نهاية الجزء المعدل --- */}

          <Tooltip title="حذف">
            <IconButton color="error" onClick={() => onDelete(lawyer)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}