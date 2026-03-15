# Authentication & Route Protection Implementation

This document outlines the comprehensive authentication and route protection system implemented for the UNI CALL application.

## Overview

All pages are now protected except the login page. Users are automatically redirected based on their authentication status and role.

## Key Components

### 1. LayoutWrapper (`app/LayoutWrapper.jsx`)
- **Primary Protection Layer**: Wraps all pages and handles route-level authentication
- **Automatic Redirects**: 
  - Unauthenticated users → `/login`
  - Authenticated users on login page → role-based dashboard
  - Admin users → `/admin/dashboard`
  - Regular users → `/dashboard`
- **Loading States**: Shows loading spinner during authentication checks

### 2. Admin Layout (`app/admin/layout.jsx`)
- **Role-Based Protection**: Ensures only admin users can access admin routes
- **Double Security**: Works with LayoutWrapper for comprehensive protection
- **Auto-Redirect**: Non-admin users are redirected to regular dashboard

### 3. Middleware (`middleware.js`)
- **Server-Side Protection**: Handles route protection at the server level
- **Token Validation**: Checks for authentication tokens in cookies/headers
- **Public Route Exemption**: Allows access to login page without authentication

### 4. Enhanced API (`lib/api.js`)
- **Dual Storage**: Stores tokens in both localStorage and cookies
- **Server-Side Compatibility**: Cookies enable server-side authentication checks
- **Automatic Cleanup**: Removes tokens from both storage locations on logout

## Protected Routes

### Public Routes (No Authentication Required)
- `/login` - Login page

### User Routes (Authentication Required)
- `/dashboard` - User dashboard
- `/clients` - Client management
- `/lead-forms` - Lead forms
- `/user-details` - User profile
- `/add-client` - Add new client

### Admin Routes (Admin Role Required)
- `/admin/dashboard` - Admin dashboard
- `/admin/unicall-users` - User management
- `/admin/add-user` - Add new user
- `/admin/user-details` - User details
- `/admin/clients` - Client management (admin)
- `/admin/lead-forms` - Lead forms (admin)
- `/admin/add-lead-file` - Add lead files

## Security Features

### 1. Multi-Layer Protection
- **Middleware**: Server-side route protection
- **Layout**: Client-side authentication checks
- **Component**: Role-based access control

### 2. Token Management
- **Persistent Storage**: Tokens stored in localStorage and cookies
- **Automatic Cleanup**: Tokens removed on logout
- **Expiration Handling**: 7-day cookie expiration

### 3. User Experience
- **Loading States**: Smooth transitions during auth checks
- **Automatic Redirects**: Users land on appropriate pages
- **No Flash**: Prevents unauthorized content from briefly appearing

## Redirection Logic

### Root Path (`/`)
- Unauthenticated → `/login`
- Admin User → `/admin/dashboard` 
- Regular User → `/dashboard`

### Login Page (`/login`)
- Already Authenticated Admin → `/admin/dashboard`
- Already Authenticated User → `/dashboard`
- Unauthenticated → Stay on login

### Admin Routes (`/admin/*`)
- Unauthenticated → `/login`
- Non-Admin User → `/dashboard`
- Admin User → Allow access

### User Routes (Other Pages)
- Unauthenticated → `/login`
- Authenticated → Allow access

## Implementation Benefits

1. **Security**: Comprehensive protection against unauthorized access
2. **UX**: Seamless user experience with appropriate redirections
3. **Scalability**: Easy to add new protected routes
4. **Maintainability**: Centralized authentication logic
5. **Performance**: Efficient checking with minimal overhead

## Usage

The protection system works automatically. Simply:

1. **Add New Pages**: Create them normally - they're protected by default
2. **Public Pages**: Add to `publicRoutes` array in LayoutWrapper
3. **Admin Pages**: Place under `/admin/` directory for automatic admin protection
4. **Custom Logic**: Extend the protection logic as needed

## Testing

To test the protection system:

1. **Logged Out**: Try accessing any protected route → Should redirect to login
2. **Regular User**: Try accessing admin routes → Should redirect to user dashboard  
3. **Admin User**: Should have access to all routes
4. **Login Page**: When logged in, should redirect to appropriate dashboard

The system ensures robust security while maintaining excellent user experience.
