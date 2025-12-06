# Store Ratings Platform

> **Roxiler Systems Internship Assignment**

Store Ratings is an online platform that enables users to browse stores and provide ratings. The system includes comprehensive features for admins to manage users and stores, while store owners can monitor and respond to customer feedback.

## 📋 Overview

The Store Ratings platform is designed to create a transparent and interactive ecosystem where:

- **Users** can browse stores and give them ratings (1-5 stars)
- **Admins** can add users, add stores, and view the workflow of the entire system
- **Store Owners** can see the ratings given by users to their stores and manage their store profiles

## ✨ Features

### For Users
- 🔍 Browse all registered stores
- ⭐ Rate stores with a 5-star rating system
- 👤 User authentication and profile management
- 📝 View store details and ratings

### For Admins
- 👥 User management (add, view, update, delete users)
- 🏪 Store management (add, view, update, delete stores)
- 📊 System workflow monitoring
- 📈 Dashboard with comprehensive analytics
- 🔐 Secure admin authentication

### For Store Owners
- ⭐ View ratings given by users
- 📊 Dashboard with average ratings and recent feedback
- 🏪 Store profile management
- 📈 Rating analytics and trends

## 🛠️ Tech Stack

### Frontend
- **React** (v19.2.0) - UI library
- **Vite** - Build tool and development server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** with **Express** (v5.2.1) - Server framework
- **MySQL** (mysql2) - Relational database
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

## 📁 Project Structure

```
Roxiler_Systems_Internship_Assignment/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin dashboard and management pages
│   │   │   ├── user/        # User pages (stores, ratings)
│   │   │   └── owner/       # Store owner dashboard
│   │   ├── components/      # Reusable components
│   │   ├── services/        # API service layer
│   │   └── App.jsx          # Main application component
│   ├── package.json
│   └── vite.config.js
│
└── backend/                  # Node.js backend application
    ├── src/
    │   ├── controllers/     # Request handlers
    │   ├── routes/          # API route definitions
    │   ├── middleware/      # Authentication, validation
    │   ├── config/          # Database and app configuration
    │   └── server.js        # Entry point
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MySQL** database server

### Installation

1. **Clone the repository**
   ```bash
   cd Roxiler_Systems_Internship_Assignment
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=store_ratings
   JWT_SECRET=your_secret_key_here
   ```

   Run the backend server:
   ```bash
   npm run dev
   ```

3. **Set up the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

   Run the frontend development server:
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## 🗄️ Database Setup

Create the MySQL database and tables:

```sql
CREATE DATABASE store_ratings;
USE store_ratings;

-- Create users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'owner') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stores table
CREATE TABLE stores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Create ratings table
CREATE TABLE ratings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 📖 API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Stores
- `GET /api/stores` - Get all stores
- `GET /api/stores/:id` - Get store by ID
- `POST /api/stores` - Create a new store (Admin only)
- `PUT /api/stores/:id` - Update store (Admin/Owner only)
- `DELETE /api/stores/:id` - Delete store (Admin only)

### Ratings
- `GET /api/ratings/store/:storeId` - Get ratings for a store
- `POST /api/ratings` - Submit a rating (User only)
- `PUT /api/ratings/:id` - Update rating
- `DELETE /api/ratings/:id` - Delete rating

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create a new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/workflow` - View system workflow

## 🔐 User Roles

1. **Admin**
   - Full system access
   - Manage users and stores
   - View analytics and workflow

2. **Store Owner**
   - Manage their own store
   - View ratings and feedback
   - Update store information

3. **User**
   - Browse stores
   - Submit ratings
   - View store details

## 🧪 Testing

### Frontend
```bash
cd frontend
npm run lint
npm run build    # Test production build
```

### Backend
```bash
cd backend
npm run start    # Test production mode
```

## 📝 Development

### Frontend Development
- Run `npm run dev` for hot-reload development server
- Run `npm run build` to create production build
- Run `npm run preview` to preview production build

### Backend Development
- Run `npm run dev` for auto-restart with nodemon
- Run `npm start` for production mode

## 🤝 Contributing

This is an internship assignment project. For any issues or suggestions, please contact the project maintainer.

## 📄 License

This project is part of the Roxiler Systems Internship Assignment.

## 👨‍💻 Author

**Athar**  
Roxiler Systems Internship Assignment

---

**Note**: Make sure to configure your database connection and JWT secret before running the application.
