// App.js

import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import AdminLayout from "./AdminManagement/AdminLayout";
// import ClientLayout from "./ClientManagement/ClientLayout";
// import LawyerLayout from "./LawyerManagement/LawyerLayout";
// import EmployeeLayout from "./EmployeeManagement/EmployeeLayout"; // تم إضافة إطار الموظف

// المدير
import Login from "./AdminManagement/LoginAdmin";
import LawyersManagement from "./AdminManagement/LawyersManagement";
import ProfileEdit from "./AdminManagement/ProfileEdit";
import AddLawyer from "./AdminManagement/AddLawyer";
import AddEmployee from "./AdminManagement/AddEmployee";
import AdminDashboardHome from "./AdminManagement/AdminDashboardHome";
import LawsManagement from "./AdminManagement/LawsManagement";
import SpecializationsManagement from "./AdminManagement/SpecializationsManagement"; // تمت الإضافة

// المحامي
// import LoginLawyer from "./LawyerManagement/LoginLawyer";
// import LawyerLawsPage from "./LawyerManagement/LawyerLawsPage";
// import PasswordChangeLawyer from "./LawyerManagement/PasswordChangeLawyer";
// import LawyerAppointmentsTable from "./LawyerManagement/LawyerAppointmentsTable";
// import ConsultationDetails from "./LawyerManagement/ConsultationDetails";
// import LawsViewer from "./LawyerManagement/LawsViewer";

// الموظف
// import LoginEmployee from "./EmployeeManagement/LoginEmployee"; // تم إضافة تسجيل دخول الموظف
// import EmployeeAppointmentsPage from "./EmployeeManagement/EmployeeAppointmentsPage";
// import EditAppointmentDialog from "./EmployeeManagement/EditAppointmentDialog";
// import DeleteAppointmentDialog from "./EmployeeManagement/DeleteAppointmentDialog";

// // العميل
// import ClientManagement from "./ClientManagement/ClientManagement";
// import ClientLogin from "./ClientManagement/ClientLogin";
// import AboutOffice from "./ClientManagement/AboutOffice";
// import WhyUs from "./ClientManagement/WhyUs";
// import Services from "./ClientManagement/Services";
// import Fields from "./ClientManagement/Fields"; 
// import Team from "./ClientManagement/Team"; 
// import Careers from "./ClientManagement/Careers"; 

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* --- صفحات تسجيل الدخول (خارج أي إطار) --- */}
        <Route path="/" element={<Login />} />
        {/* <Route path="/login-lawyer" element={<LoginLawyer />} /> */}
        {/* <Route path="/login-employee" element={<LoginEmployee />} />  تمت الإضافة */}
        {/* <Route path="/login" element={<ClientLogin setIsLoggedIn={setIsLoggedIn} />} /> */}

        {/* --- مسارات لوحة تحكم المدير --- */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<AdminDashboardHome />} />
          <Route path="/lawyers" element={<LawyersManagement />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
          <Route path="/add-lawyer" element={<AddLawyer />} />
          <Route path="/add-employee" element={<AddEmployee />} />
          <Route path="/laws-management" element={<LawsManagement />} />
          <Route path="/specializations" element={<SpecializationsManagement />} /> {/* تمت الإضافة */}
        </Route>

        {/* --- مسارات المحامي ---
        <Route element={<LawyerLayout />}>
          <Route path="/lawyer" element={<LawyerLawsPage />} />
          <Route path="/lawyer-change-password" element={<PasswordChangeLawyer />} />
          <Route path="/lawyer-appointments" element={<LawyerAppointmentsTable />} />
          <Route path="/lawyer-consultations" element={<ConsultationDetails />} />
          <Route path="/laws-viewer" element={<LawsViewer />} />
        </Route> */}

        {/* --- مسارات الموظف (داخل إطار الموظف) --- */}
        {/* <Route element={<EmployeeLayout />}> */}
          {/* <Route path="/employee-appointments" element={<EmployeeAppointmentsPage />} /> */}
          {/* ملاحظة: مربعات الحوار هذه قد لا تعمل كصفحات مستقلة، لكننا نبقيها حسب الهيكل الحالي */}
          {/* <Route path="/employee-appointments/edit" element={<EditAppointmentDialog />} /> */}
          {/* <Route path="/employee-appointments/delete" element={<DeleteAppointmentDialog />} /> */}
        {/* </Route> */}

        {/* --- مسارات واجهة العميل --- */}
        {/* <Route element={<ClientLayout isLoggedIn={isLoggedIn} />}> */}
          {/* <Route path="/client-management" element={<ClientManagement />} />
          <Route path="/about-office" element={<AboutOffice />} />
          <Route path="/why-us" element={<WhyUs />} />
          <Route path="/services" element={<Services />} />
          <Route path="/fields" element={<Fields />} />
          <Route path="/team" element={<Team />} />
          <Route path="/careers" element={<Careers />} /> */}
        {/* </Route> */}
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;