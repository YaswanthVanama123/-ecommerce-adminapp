# Admin WebApp - E-Commerce Management Panel

A comprehensive admin panel for managing your e-commerce platform built with React, Vite, and Tailwind CSS.

## Features

### Dashboard
- Real-time analytics and statistics
- Total orders, revenue, pending orders, and completed orders
- Revenue and orders charts (last 7 days)
- Recent orders overview

### Product Management
- List all products with search functionality
- Add new products with full details (name, description, category, price, images, sizes, colors, stock)
- Edit existing products
- Delete products
- Image URL support
- Stock management

### Order Management
- List all orders with filtering by status and payment status
- View detailed order information
- Update order status (pending, processing, shipped, delivered, cancelled)
- View customer information and shipping address
- Track payment status

### Category Management
- View all categories
- Add new categories
- Edit existing categories
- Delete categories
- Track product count per category

## Tech Stack

- **React** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Toastify** - Notifications
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling

## Installation

1. Navigate to the project directory:
   ```bash
   cd /Users/yaswanthgandhi/Documents/validatesharing/admin-webapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - The `.env` file is already configured with `VITE_API_URL=http://localhost:5000/api`

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The application will be available at `http://localhost:5174`

## Project Structure

```
admin-webapp/
├── src/
│   ├── api/
│   │   ├── axiosConfig.js       # Axios instance with interceptors
│   │   └── index.js             # API endpoints
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx       # Admin header with logout
│   │   │   └── Sidebar.jsx      # Navigation sidebar
│   │   ├── orders/
│   │   │   └── StatusUpdateModal.jsx  # Order status update modal
│   │   └── products/
│   │       └── ProductForm.jsx   # Reusable product form
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication context
│   ├── pages/
│   │   ├── Categories/
│   │   │   └── CategoryManagement.jsx
│   │   ├── Orders/
│   │   │   ├── OrderDetail.jsx
│   │   │   └── OrderList.jsx
│   │   ├── Products/
│   │   │   ├── AddProduct.jsx
│   │   │   ├── EditProduct.jsx
│   │   │   └── ProductList.jsx
│   │   ├── Dashboard.jsx
│   │   └── Login.jsx
│   ├── routes/
│   │   └── PrivateRoute.jsx     # Protected route wrapper
│   ├── App.jsx                  # Main app component with routing
│   ├── index.css                # Global styles with Tailwind
│   └── main.jsx                 # Entry point
├── .env                         # Environment variables
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json                # Dependencies
```

## Usage

### Login
1. Navigate to `/login`
2. Enter admin credentials (email and password)
3. Only users with 'admin' or 'superadmin' roles can access the panel

### Managing Products
1. Go to Products section
2. Click "Add New Product" to create a product
3. Fill in all required fields:
   - Name, description, category, price, stock
   - Optional: brand, sizes (comma-separated), colors (comma-separated), images (comma-separated URLs)
4. Use the search bar to find specific products
5. Edit or delete products from the list

### Managing Orders
1. Go to Orders section
2. Filter orders by status or payment status
3. Click "View" to see full order details
4. Click "Update" to change order status
5. View customer information, shipping address, and order items

### Managing Categories
1. Go to Categories section
2. Click "Add New Category" to create a category
3. Edit or delete existing categories
4. Categories show the number of products they contain

## API Integration

The admin panel connects to the backend API at `http://localhost:5000/api`. Make sure your backend is running before using the admin panel.

### Required Backend Endpoints

- **Auth**: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/profile`
- **Products**: `GET /api/products`, `GET /api/products/:id`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`
- **Orders**: `GET /api/orders`, `GET /api/orders/:id`, `PUT /api/orders/:id/status`
- **Categories**: `GET /api/categories`, `GET /api/categories/:id`, `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id`

## Authentication

The application uses JWT token-based authentication:
- Tokens are stored in `localStorage` as `adminToken`
- User data is stored in `localStorage` as `adminUser`
- Axios interceptors automatically add the token to requests
- Unauthorized requests (401) automatically redirect to login

## Build for Production

```bash
npm run build
```

The build files will be in the `dist/` directory.

## Development

```bash
npm run dev
```

The development server runs on port 5174 with hot module replacement (HMR).

## License

Private - E-Commerce Admin Panel
