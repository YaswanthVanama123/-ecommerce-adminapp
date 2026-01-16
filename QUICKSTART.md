# Admin WebApp - Quick Start Guide

## Getting Started

### 1. Start the Backend API
Make sure your backend API is running on `http://localhost:5000`

### 2. Start the Admin WebApp
```bash
cd /Users/yaswanthgandhi/Documents/validatesharing/admin-webapp
npm run dev
```

The application will be available at: **http://localhost:5174**

### 3. Login
- Navigate to `http://localhost:5174/login`
- Use your admin credentials (email and password)
- Only users with `admin` or `superadmin` roles can access

## Main Features

### Dashboard (http://localhost:5174/dashboard)
- View analytics: total orders, revenue, pending/completed orders
- See revenue and orders charts for the last 7 days
- Check recent orders

### Products (http://localhost:5174/products)
- **List Products**: View all products with search
- **Add Product**: Click "Add New Product" button
- **Edit Product**: Click "Edit" on any product
- **Delete Product**: Click "Delete" on any product

### Orders (http://localhost:5174/orders)
- **List Orders**: View all orders
- **Filter**: By status (pending, processing, shipped, delivered, cancelled)
- **Filter**: By payment status (pending, paid, failed)
- **View Details**: Click "View" to see full order information
- **Update Status**: Click "Update" to change order status

### Categories (http://localhost:5174/categories)
- **List Categories**: View all categories with product count
- **Add Category**: Click "Add New Category"
- **Edit Category**: Click "Edit" on any category
- **Delete Category**: Click "Delete" on any category

## File Structure Overview

```
/Users/yaswanthgandhi/Documents/validatesharing/admin-webapp/
├── .env                          # Environment config (API URL)
├── src/
│   ├── api/                      # API configuration and endpoints
│   ├── components/               # Reusable components
│   ├── context/                  # React context (Auth)
│   ├── pages/                    # Page components
│   ├── routes/                   # Route protection
│   └── App.jsx                   # Main application
└── README.md                     # Full documentation
```

## Important Notes

1. **Port**: The admin panel runs on port **5174** (configured in vite.config.js)
2. **Backend**: Connects to `http://localhost:5000/api`
3. **Authentication**: JWT tokens stored in localStorage
4. **Auto-logout**: Automatically logs out on 401 (Unauthorized) responses

## Common Tasks

### Adding a New Product
1. Go to Products section
2. Click "Add New Product"
3. Fill in the form:
   - **Required**: Name, Description, Category, Price, Stock
   - **Optional**: Brand, Sizes (e.g., "S, M, L, XL"), Colors (e.g., "Red, Blue, Green"), Images (URLs separated by commas)
4. Click "Create Product"

### Updating Order Status
1. Go to Orders section
2. Find the order you want to update
3. Click "Update" button
4. Select new status from the modal
5. Click "Update Status"

### Managing Categories
1. Go to Categories section
2. Click "Add New Category"
3. Enter category name and description
4. Click "Create Category"

## Troubleshooting

### Can't login?
- Ensure backend API is running
- Check that your user has `admin` or `superadmin` role
- Verify credentials are correct

### API errors?
- Check backend is running on `http://localhost:5000`
- Check browser console for error messages
- Verify token is valid in localStorage

### Build errors?
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (v18+ recommended)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Support

For issues or questions, check:
1. Browser console for JavaScript errors
2. Network tab for API call failures
3. Backend logs for server errors
