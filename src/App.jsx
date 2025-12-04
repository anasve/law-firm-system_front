import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import AdminLayout from "./AdminManagement/layouts/AdminLayout";

// Admin Pages
import Login from "./AdminManagement/LoginAdmin";
import LawyersManagement from "./AdminManagement/pages/LawyersManagement";
import EmployeesManagement from "./AdminManagement/pages/EmployeesManagement";
import ProfileEdit from "./AdminManagement/pages/ProfileEdit";
import AdminDashboardHome from "./AdminManagement/pages/AdminDashboardHome";
import LawsManagement from "./AdminManagement/pages/LawsManagement";
import SpecializationsManagement from "./AdminManagement/pages/SpecializationsManagement";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Admin Dashboard Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<AdminDashboardHome />} />
          <Route path="/lawyers" element={<LawyersManagement />} />
          <Route path="/employees" element={<EmployeesManagement />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
          <Route path="/laws-management" element={<LawsManagement />} />
          <Route path="/specializations" element={<SpecializationsManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
