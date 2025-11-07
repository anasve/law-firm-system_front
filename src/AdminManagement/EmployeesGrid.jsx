import React from "react";
import { Box, Card, Typography, Avatar, IconButton, Stack, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArchiveIcon from "@mui/icons-material/Archive";
import VisibilityIcon from "@mui/icons-material/Visibility";

function stringAvatar(name) {
  // إرجاع أول حرفين من الاسم
  const parts = name.split(" ");
  return {
    children: `${(parts[0][0] || "")}${(parts[1]?.[0] || "")}`.toUpperCase(),
  };
}

export default function EmployeesGrid({ employees, onEdit, onDelete, onArchive, onView }) {
  return (
    <Box display="flex" flexWrap="wrap" gap={3}>
      {employees.map((employee) => (
        <Card
          key={employee.id}
          sx={{
            width: 300,
            p: 2.5,
            borderRadius: 4,
            boxShadow: "0 4px 16px 0 rgba(0,0,0,0.10)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            position: "relative",
          }}
        >
          <Box display="flex" alignItems="center" mb={1.5}>
            <Avatar {...stringAvatar(employee.name)} sx={{ bgcolor: "#1976d2", width: 56, height: 56, mr: 2, fontSize: 24 }} />
            <Box>
              <Typography fontWeight="bold" fontSize={18}>{employee.name}</Typography>
              <Typography color="primary" fontSize={15}>{employee.position}</Typography>
            </Box>
          </Box>
          <Typography fontSize={14} mb={0.5}>البريد الإلكتروني: {employee.email}</Typography>
          <Typography fontSize={14} mb={0.5}>الهاتف: {employee.phone}</Typography>
          <Typography fontSize={14} mb={0.5}>العنوان: {employee.address}</Typography>
          <Chip
            label={employee.status === "active" ? "نشط" : "مؤرشف"}
            color={employee.status === "active" ? "success" : "default"}
            size="small"
            sx={{ mt: 1, mb: 1 }}
          />
          <Stack direction="row" spacing={1} mt={1} alignSelf="center">
            <IconButton onClick={() => onView(employee)}><VisibilityIcon /></IconButton>
            <IconButton onClick={() => onEdit(employee)}><EditIcon /></IconButton>
            <IconButton onClick={() => onArchive(employee)}><ArchiveIcon /></IconButton>
            <IconButton onClick={() => onDelete(employee)}><DeleteIcon sx={{ color: "#d32f2f" }} /></IconButton>
          </Stack>
        </Card>
      ))}
    </Box>
  );
}