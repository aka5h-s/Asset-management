# Asset Management System - Frontend

A complete React frontend for the Asset Management System that consumes a Spring Boot backend API.

## Features

### Authentication
- User login and registration
- JWT token-based authentication
- Role-based access control (Employee/Admin)

### Employee Features
- **Dashboard**: Overview of assigned assets, service requests, and audits
- **My Assets**: View assigned assets with category filtering
- **Request Asset**: Submit borrowing requests for available assets
- **Service Requests**: Create and manage service requests for asset issues
- **Audits**: View audit records

### Admin Features
- **Dashboard**: System overview with statistics
- **Employee Management**: CRUD operations for employees
- **Category Management**: Manage asset categories
- **Asset Management**: CRUD operations for assets
- **Borrowing Requests**: Approve/reject borrowing requests
- **Service Requests**: Manage and update service request status
- **Audits**: Manage audit records and decisions

## Technology Stack

- **React 19** with Vite
- **React Router DOM 7** for routing
- **Bootstrap 5.3** for UI components
- **Axios** for API communication
- **JavaScript** (no TypeScript)

## Project Structure

```
simplyfly-frontend/
├── component/
│   ├── Authentication/
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── Employee/
│   │   ├── EmployeeDashboard.jsx
│   │   ├── MyAssets.jsx
│   │   ├── RequestAsset.jsx
│   │   ├── ServiceRequest.jsx
│   │   ├── MyServiceRequests.jsx
│   │   └── MyAudits.jsx
│   ├── Admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── ManageEmployees.jsx
│   │   ├── ManageCategories.jsx
│   │   ├── ManageAssets.jsx
│   │   ├── BorrowingRequests.jsx
│   │   ├── ServiceRequests.jsx
│   │   └── Audits.jsx
│   └── Shared/
│       ├── Navbar.jsx
│       └── ProtectedRoute.jsx
├── Service/
│   ├── Services.js
│   └── AmsService.js
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── App.css
│   └── index.css
├── public/
├── package.json
├── vite.config.js
└── README.md
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The application will be available at `http://localhost:3000`

## Backend API

The frontend expects a Spring Boot backend running at `http://localhost:8092/api/v1` with the following endpoints:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/authenticate` - User login

### Employees
- `GET /employees/getAllEmployee` - Get all employees
- `GET /employees/getEmployeeById/{employeeId}` - Get employee by ID
- `POST /employees/register` - Register new employee
- `PUT /employees/updateEmployee/{employeeId}` - Update employee
- `DELETE /employees/delete/{employeeId}` - Delete employee

### Asset Categories
- `GET /asset-categories/getall` - Get all categories
- `GET /asset-categories/getbyid/{categoryId}` - Get category by ID
- `GET /asset-categories/getbyname/{categoryName}` - Get category by name
- `POST /asset-categories/add` - Add new category
- `PUT /asset-categories/update/{categoryId}` - Update category
- `DELETE /asset-categories/delete/{categoryId}` - Delete category

### Assets
- `GET /assets/getall` - Get all assets
- `GET /assets/getbyid/{assetId}` - Get asset by ID
- `GET /assets/category/{categoryName}` - Get assets by category
- `GET /assets/assigned/{employeeId}` - Get assets assigned to employee
- `POST /assets/add` - Add new asset
- `PUT /assets/update/{assetId}` - Update asset
- `DELETE /assets/delete/{assetId}` - Delete asset

### Borrowings
- `GET /borrowings/getbyeid/{employeeId}` - Get borrowings by employee
- `GET /borrowings/active` - Get active borrowings
- `POST /borrowings/request` - Request asset borrowing
- `PUT /borrowings/{id}/action` - Approve/reject borrowing
- `PUT /borrowings/{id}/return` - Mark asset as returned

### Service Requests
- `GET /service-requests/allServiceRequests` - Get all service requests
- `GET /service-requests/getServiceRequestById/{serviceRequestId}` - Get service request by ID
- `GET /service-requests/serviceRequestByEmployee/{employeeId}` - Get service requests by employee
- `GET /service-requests/findByStatus/{status}` - Get service requests by status
- `POST /service-requests/createServiceRequest` - Create service request
- `PUT /service-requests/updateServiceRequest/{serviceRequestId}/{status}` - Update service request status

### Audits
- `GET /audits/getall` - Get all audits
- `GET /audits/getbyeid/{employeeId}` - Get audits by employee
- `GET /audits/getbyid/{auditId}` - Get audit by ID
- `POST /audits/send/{employeeId}/{assetId}` - Send audit
- `PUT /audits/{auditId}/decision` - Update audit decision

## Usage

1. **Login**: Use the login page to authenticate with your credentials
2. **Registration**: New users can register through the signup page
3. **Employee Dashboard**: View assigned assets, create service requests, and request new assets
4. **Admin Dashboard**: Manage employees, assets, categories, and review requests

## Authentication

The application uses JWT tokens stored in localStorage. The token is automatically included in API requests via axios interceptors.

## Styling

The application uses Bootstrap 5.3 for UI components with custom CSS for additional styling. The design follows a clean, modern approach with:
- Card-based layouts
- Responsive design
- Bootstrap utility classes
- Custom hover effects and transitions

## Development

- **Port**: 3000 (configurable in vite.config.js)
- **Hot Reload**: Enabled for development
- **Linting**: ESLint configured for React

## Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Preview

To preview the production build:

```bash
npm run preview
```
