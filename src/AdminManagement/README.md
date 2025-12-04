# Admin Management - Clean Code Architecture

## 📁 هيكل المجلدات (Folder Structure)

```
AdminManagement/
├── layouts/              # Layout Components
│   ├── AdminLayout.jsx
│   └── index.js
│
├── pages/                # Page Components
│   ├── AdminDashboardHome.jsx
│   ├── LawyersManagement.jsx
│   ├── EmployeesManagement.jsx
│   ├── LawsManagement.jsx
│   ├── SpecializationsManagement.jsx
│   ├── ProfileEdit.jsx
│   └── index.js
│
├── components/           # Reusable UI Components
│   ├── ui/               # UI Primitive Components
│   │   ├── SearchBar.jsx
│   │   └── index.js
│   ├── feedback/         # Feedback Components
│   │   ├── EmptyState.jsx
│   │   ├── ConfirmationDialog.jsx
│   │   └── index.js
│   ├── forms/            # Form Components
│   │   ├── LawFormDialog.jsx
│   │   ├── SpecializationFormDialog.jsx
│   │   ├── AddLawyerDialog.jsx
│   │   ├── AddEmployeeDialog.jsx
│   │   └── index.js
│   ├── laws/             # Law-specific components
│   │   ├── LawsManagementStyles.js
│   │   └── index.js
│   ├── specializations/  # Specialization-specific components
│   │   ├── SpecializationsManagementStyles.js
│   │   └── index.js
│   ├── users/            # User-specific components
│   │   ├── EditLawyerDialog.jsx
│   │   ├── EditEmployeeDialog.jsx
│   │   ├── UserCard.jsx
│   │   ├── UserDetailsDialog.jsx
│   │   ├── UserManagementStyles.js
│   │   └── index.js
│   ├── LawCard.jsx
│   ├── SpecializationItem.jsx
│   ├── DescriptionDialog.jsx
│   ├── StyledComponents.js
│   └── index.js
│
├── services/             # API Services
│   ├── api.js           # Axios instance & interceptors
│   ├── lawsService.js   # Laws API calls
│   ├── usersService.js  # Users API calls
│   └── index.js
│
├── hooks/                # Custom React Hooks
│   ├── useLaws.js       # Laws data fetching hook
│   ├── useAuth.js       # Authentication hook
│   └── index.js
│
├── constants/            # Constants
│   ├── colors.js        # Color scheme
│   ├── api.js           # API URLs & keys
│   └── index.js
│
├── utils/                # Utilities & Helpers
│   ├── helpers.js       # Helper functions
│   └── index.js
│
├── GoldenSidebar.jsx     # Sidebar Component
├── LoginAdmin.jsx        # Login Page
└── README.md             # This file
```

## 🎯 Clean Code Principles

### 1. Separation of Concerns (فصل الاهتمامات)
- **Layouts**: Layout structure only
- **Pages**: Page-level components with business logic
- **Components**: Organized by type (ui/, feedback/, forms/) and feature (laws/, users/, specializations/)
- **Services**: API communication layer
- **Hooks**: State management and data fetching logic
- **Constants**: All constants separated from utils
- **Utils**: Helper functions only

### 2. Single Responsibility Principle
- Each file has one clear responsibility
- Components are focused and reusable
- Services handle only API calls
- Hooks manage specific state/logic

### 3. DRY (Don't Repeat Yourself)
- Shared components in `components/ui/`, `components/feedback/`, `components/forms/`
- Common styles in styled components
- Reusable hooks for common patterns
- Helper functions for repeated logic

### 4. Maintainability
- Clear folder structure
- Consistent naming conventions
- Well-organized imports
- Easy to locate and modify code

## 📝 Usage Examples

### Using Constants
```javascript
import { colors, API_BASE_URL, TOKEN_KEY } from '../constants';
```

### Using Helpers
```javascript
import { buildImageUrl, getErrorMessage, validatePassword } from '../utils/helpers';
```

### Using Services
```javascript
import { lawsService } from '../services/lawsService';
import { usersService } from '../services/usersService';

// Fetch laws
const laws = await lawsService.getAll();

// Create lawyer
await usersService.createLawyer(lawyerData);
```

### Using Hooks
```javascript
import { useLaws } from '../hooks/useLaws';
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { laws, loading, error, refetch } = useLaws(currentTab, searchQuery);
  const { isAuthenticated, checkAuth } = useAuth();
  // ...
}
```

### Using Components
```javascript
// UI Components
import { SearchBar } from '../components/ui';

// Feedback Components
import { EmptyState, ConfirmationDialog } from '../components/feedback';

// Form Components
import { LawFormDialog, AddLawyerDialog } from '../components/forms';

// Feature-specific
import LawCard from '../components/LawCard';
```

## 🔄 Component Organization

### By Type (Shared Components)
- `components/ui/` - UI primitives (SearchBar, etc.)
- `components/feedback/` - Feedback components (EmptyState, ConfirmationDialog)
- `components/forms/` - Form dialogs (LawFormDialog, AddLawyerDialog, etc.)

### By Feature (Feature-specific)
- `components/laws/` - Law-related styles
- `components/users/` - User-related components
- `components/specializations/` - Specialization-related components

## ✅ Best Practices

1. **Import Organization**
   - React imports first
   - Third-party libraries
   - Internal components (by category)
   - Utils and constants

2. **File Naming**
   - Components: PascalCase (e.g., `UserCard.jsx`)
   - Utilities: camelCase (e.g., `helpers.js`)
   - Constants: camelCase (e.g., `colors.js`)

3. **Component Structure**
   - Imports
   - Styled components (if any)
   - Main component
   - Export

4. **Service Pattern**
   - All API calls in services
   - Consistent error handling
   - Type-safe responses
