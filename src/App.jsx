import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "./AdminManagement/layouts/AdminLayout";
import { ClientLayout } from "./ClientManagement/layouts";
import { LawyerLayout } from "./LawyerManagement/layouts";
import { EmployeeLayout } from "./EmployeeManagement/layouts";

// Guest Pages
import { Login, Register, HomePage, JobApplicationPage } from "./Guest/pages";

// Admin Pages
import LoginAdmin from "./AdminManagement/LoginAdmin";
import LawyersManagement from "./AdminManagement/pages/LawyersManagement";
import EmployeesManagement from "./AdminManagement/pages/EmployeesManagement";
import ProfileEdit from "./AdminManagement/pages/ProfileEdit";
import AdminDashboardHome from "./AdminManagement/pages/AdminDashboardHome";
import LawsManagement from "./AdminManagement/pages/LawsManagement";
import SpecializationsManagement from "./AdminManagement/pages/SpecializationsManagement";
import JobApplicationsManagement from "./AdminManagement/pages/JobApplicationsManagement";

// Client Pages
import {
  ClientDashboardHome,
  ConsultationsPage as ClientConsultationsPage,
  AppointmentsPage as ClientAppointmentsPage,
  ChatPage as ClientChatPage,
  ProfilePage as ClientProfilePage,
  NewConsultationPage,
  NewAppointmentPage,
  LawsPage as ClientLawsPage,
  FixedPricesPage as ClientFixedPricesPage,
} from "./ClientManagement/pages";

// Lawyer Pages
import LoginLawyer from "./LawyerManagement/LoginLawyer";
import {
  LawyerDashboardHome,
  ConsultationsPage as LawyerConsultationsPage,
  AppointmentsPage as LawyerAppointmentsPage,
  ChatPage as LawyerChatPage,
  ProfilePage as LawyerProfilePage,
  LawsPage as LawyerLawsPage,
} from "./LawyerManagement/pages";

// Employee Pages
import LoginEmployee from "./EmployeeManagement/LoginEmployee";
import {
  EmployeeDashboardHome,
  ClientsManagement,
  AppointmentsManagement,
  ProfilePage as EmployeeProfilePage,
  FixedPricesManagementPage as EmployeeFixedPricesManagementPage,
} from "./EmployeeManagement/pages";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/job-application" element={<JobApplicationPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginAdmin />} />
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<AdminDashboardHome />} />
          <Route path="/lawyers" element={<LawyersManagement />} />
          <Route path="/employees" element={<EmployeesManagement />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
          <Route path="/laws-management" element={<LawsManagement />} />
          <Route path="/specializations" element={<SpecializationsManagement />} />
          <Route path="/job-applications" element={<JobApplicationsManagement />} />
        </Route>

        {/* Client Routes */}
        <Route element={<ClientLayout />}>
          <Route path="/client" element={<Navigate to="/client/dashboard" replace />} />
          <Route path="/client/dashboard" element={<ClientDashboardHome />} />
          <Route path="/client/consultations" element={<ClientConsultationsPage />} />
          <Route path="/client/consultations/new" element={<NewConsultationPage />} />
          <Route path="/client/appointments" element={<ClientAppointmentsPage />} />
          <Route path="/client/appointments/new" element={<NewAppointmentPage />} />
          <Route path="/client/chat" element={<ClientChatPage />} />
          <Route path="/client/laws" element={<ClientLawsPage />} />
          <Route path="/client/fixed-prices" element={<ClientFixedPricesPage />} />
          <Route path="/client/profile" element={<ClientProfilePage />} />
        </Route>

        {/* Lawyer Routes */}
        <Route path="/lawyer/login" element={<LoginLawyer />} />
        <Route path="/lawyer" element={<Navigate to="/lawyer/dashboard" replace />} />
        <Route element={<LawyerLayout />}>
          <Route path="/lawyer/dashboard" element={<LawyerDashboardHome />} />
          <Route path="/lawyer/consultations" element={<LawyerConsultationsPage />} />
          <Route path="/lawyer/appointments" element={<LawyerAppointmentsPage />} />
          <Route path="/lawyer/chat" element={<LawyerChatPage />} />
          <Route path="/lawyer/laws" element={<LawyerLawsPage />} />
          <Route path="/lawyer/profile" element={<LawyerProfilePage />} />
        </Route>

        {/* Employee Routes */}
        <Route path="/employee/login" element={<LoginEmployee />} />
        <Route path="/employee" element={<Navigate to="/employee/dashboard" replace />} />
        <Route element={<EmployeeLayout />}>
          <Route path="/employee/dashboard" element={<EmployeeDashboardHome />} />
          <Route path="/employee/clients" element={<ClientsManagement />} />
          <Route path="/employee/appointments" element={<AppointmentsManagement />} />
          <Route path="/employee/fixed-prices" element={<EmployeeFixedPricesManagementPage />} />
          <Route path="/employee/profile" element={<EmployeeProfilePage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
