# Unicall Project - Complete Setup

This project includes a Next.js frontend and Express.js backend with MongoDB integration.

## Prerequisites

- Node.js (v16+)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start MongoDB (if using local installation)
# mongod --config /path/to/your/mongod.conf

# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
# or
node server.js
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Sample Login Credentials

### Admin User
- **Email:** admin@unicall.com
- **Password:** admin123

### Regular Users
- **Email:** user1@unicall.com (or user2, user3, user4)
- **Password:** user123

## Project Structure

### Backend (`/backend`)
- Express.js server with MongoDB
- JWT authentication
- Role-based access control
- RESTful API endpoints
- File upload support for lead forms

### Frontend (`/app`)
- Next.js 15 with App Router
- Tailwind CSS for styling
- Context-based authentication
- Protected routes
- Responsive design

## Features Implemented

### Authentication & Authorization
✅ JWT-based authentication  
✅ Role-based access (admin/user)  
✅ Protected routes  
✅ Login/logout functionality  

### User Management (Admin Only)
✅ View all users  
✅ Add new users  
✅ Edit user details  
✅ Deactivate users  

### Client Management
✅ Users can create/edit/delete their own clients  
✅ Admins can view all clients  
✅ Client filtering by bank and status  
✅ Client statistics dashboard  

### Lead Forms Management (Admin Only)
✅ Create lead forms with file uploads  
✅ Edit/delete lead forms  
✅ All users can view lead forms  
✅ Integration settings (Slack, Email)  

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (first user or admin only)
- `GET /api/auth/me` - Get current user

#### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

#### Clients
- `GET /api/clients` - Get clients (filtered by user role)
- `POST /api/clients` - Create client (user only)
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

#### Lead Forms
- `GET /api/lead-forms` - Get all lead forms
- `POST /api/lead-forms` - Create lead form (admin only)
- `PUT /api/lead-forms/:id` - Update lead form (admin only)
- `DELETE /api/lead-forms/:id` - Delete lead form (admin only)

## Business Rules Implemented

1. **Users can only create clients** - Admins cannot create clients
2. **Admins can create lead forms** - Users cannot create lead forms
3. **Users see only their own clients** - Admins see all clients
4. **All users can view lead forms** - But only admins can manage them
5. **Role-based navigation** - Different sidebar items based on role

## Environment Configuration

### Backend (`.env`)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/unicall
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Common Issues

1. **Backend won't start**
   - Ensure MongoDB is running
   - Check port 5000 is available
   - Verify environment variables

2. **Frontend login issues**
   - Ensure backend is running on port 5000
   - Check API URL in `.env.local`
   - Verify CORS settings

3. **Database connection issues**
   - Check MongoDB connection string
   - Ensure MongoDB service is running
   - Verify database permissions

## Development Tips

- Backend runs on port 5000, frontend on port 3000
- Use the seeded data for testing
- Check browser console for frontend errors
- Check terminal logs for backend errors
- API responses follow a consistent format

## Next Steps

To extend this project, consider:
- Email notifications for lead forms
- Real-time updates with WebSocket
- File preview in lead forms
- Advanced client search and filtering
- Dashboard analytics and charts
- Export functionality for clients/leads
