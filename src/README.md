# Lawyer Pro Platform - Frontend Structure

## 📁 Project Structure

```
src/
├── AdminManagement/      # Admin Dashboard
│   ├── layouts/
│   ├── pages/
│   ├── components/
│   ├── services/
│   └── ...
│
├── ClientManagement/     # Client Dashboard
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   └── ClientSidebar.jsx
│
├── LawyerManagement/     # Lawyer Dashboard
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   └── LawyerSidebar.jsx
│
├── EmployeeManagement/   # Employee Dashboard
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── EmployeeSidebar.jsx
│   └── LoginEmployee.jsx
│
├── Guest/                # Guest Pages
│   └── pages/
│       ├── Login.jsx
│       └── Register.jsx
│
└── App.jsx              # Main Router
```

## 🚀 Routes

### Guest Routes
- `/login` - Client Login
- `/register` - Client Registration

### Admin Routes
- `/admin/login` - Admin Login
- `/dashboard` - Admin Dashboard
- `/lawyers` - Lawyers Management
- `/employees` - Employees Management
- `/laws-management` - Laws Management
- `/specializations` - Specializations Management
- `/profile-edit` - Admin Profile

### Client Routes
- `/client/dashboard` - Client Dashboard
- `/client/consultations` - My Consultations
- `/client/appointments` - My Appointments
- `/client/profile` - Client Profile

### Lawyer Routes
- `/lawyer/dashboard` - Lawyer Dashboard
- `/lawyer/consultations` - My Consultations
- `/lawyer/appointments` - My Appointments
- `/lawyer/profile` - Lawyer Profile

### Employee Routes
- `/employee/login` - Employee Login
- `/employee/dashboard` - Employee Dashboard
- `/employee/clients` - Clients Management
- `/employee/consultations` - Consultations Management
- `/employee/availability` - Availability Management
- `/employee/appointments` - Appointments Management
- `/employee/profile` - Employee Profile

## 🎨 Design System

All dashboards use the same design system:
- **Colors**: Gold (#D4AF37), Black (#141414), Light Black (#232323)
- **Typography**: Arial, sans-serif
- **Components**: Material-UI with custom styling
- **Layout**: Sidebar navigation with main content area

## 📝 Notes

- All services use axios with interceptors for authentication
- Token management is handled per user type
- All layouts follow the same structure with sidebar navigation
- Pages use the same styled components for consistency

