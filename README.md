# CodeAlpha Social Media Platform

A modern full-stack social media application developed as part of the **CodeAlpha Full Stack Development Internship**.

## Overview

CodeAlpha Social is a responsive social media platform that allows users to create accounts, publish posts, interact through comments and likes, follow other users, and manage their profiles.

The application includes a modern React frontend, a secure Node.js and Express backend, PostgreSQL for data storage, and JWT authentication.

## Features

### Authentication

- User registration
- User login
- JWT authentication
- Protected routes
- Persistent sessions with localStorage
- Logout

### User Profiles

- View personal profile
- Edit name, bio, and profile image
- View public user profiles
- Followers and following lists
- Follow and unfollow users

### Posts

- Create posts
- Add an optional image
- View all posts
- View post details
- Edit personal posts
- Delete personal posts

### Comments

- Add comments
- View post comments
- Edit personal comments
- Delete personal comments

### Likes

- Like posts
- Unlike posts
- View total likes
- View users who liked a post

### User Interface

- Modern responsive design
- Light and dark mode
- Desktop sidebar navigation
- Mobile top and bottom navigation
- Skeleton loading states
- Image previews
- Animated interactions
- Responsive layouts for desktop, tablet, and mobile

## Technologies

### Frontend

- React
- Vite
- React Router
- Axios
- CSS
- Context API

### Backend

- Node.js
- Express.js
- JWT
- bcrypt
- Multer
- CORS

### Database

- PostgreSQL

### Development Tools

- Git
- GitHub
- Postman
- pgAdmin
- VS Code

## Project Structure

```text
CodeAlpha_SocialMediaPlatform/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   └── schema.sql
│
├── .gitignore
└── README.md