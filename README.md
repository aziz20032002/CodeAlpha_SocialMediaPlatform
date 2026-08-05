# 📱 CodeAlpha Social Media Platform

A modern full-stack social media platform developed as part of the **CodeAlpha Full Stack Development Internship**.

The application enables users to register, authenticate securely, publish posts, interact with the community through comments and likes, follow other users, and manage their personal profiles.

---

# 📸 Preview

> *(Add screenshots here after deployment)*

| Home Feed | Profile | Post Details |
|-----------|----------|--------------|
| Screenshot | Screenshot | Screenshot |

---

# ✨ Features

## 🔐 Authentication

- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Persistent Login using Local Storage
- Logout

---

## 👤 User Profiles

- View personal profile
- View public profiles
- Edit profile
- Update bio
- Upload profile picture
- Follow users
- Unfollow users
- Followers list
- Following list

---

## 📝 Posts

- Create post
- Upload image
- Edit own post
- Delete own post
- View all posts
- View single post
- Responsive feed

---

## 💬 Comments

- Add comments
- Edit own comments
- Delete own comments
- Display comments under each post

---

## ❤️ Likes

- Like posts
- Unlike posts
- Like counter
- Display users who liked a post

---

## 🎨 User Interface

- Modern responsive layout
- Desktop, Tablet & Mobile support
- Sidebar Navigation
- Sticky Right Sidebar
- Smooth Animations
- Skeleton Loading
- Image Preview
- Dark-ready Architecture
- Professional UI inspired by modern social platforms

---

# 🏗️ Project Architecture

```
CodeAlpha_SocialMediaPlatform
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── routes
│   ├── uploads
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   ├── services
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── database
│   └── schema.sql
│
├── README.md
└── .gitignore
```

---

# 🛠️ Technologies Used

## Frontend

- React
- Vite
- React Router DOM
- Axios
- CSS3
- Context API

---

## Backend

- Node.js
- Express.js
- JWT Authentication
- bcrypt
- Multer
- CORS

---

## Database

- PostgreSQL

---

## Development Tools

- Git
- GitHub
- VS Code
- Postman
- pgAdmin

---

# 🚀 Installation

## 1. Clone the repository

```bash
git clone https://github.com/aziz20032002/CodeAlpha_SocialMediaPlatform.git

cd CodeAlpha_SocialMediaPlatform
```

---

## 2. Create PostgreSQL Database

Create a database named

```
codealpha_socialmedia
```

Execute

```
database/schema.sql
```

using pgAdmin or PostgreSQL CLI.

---

## 3. Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file from `.env.example`

```env
PORT=3000

DB_USER=postgres
DB_HOST=127.0.0.1
DB_NAME=codealpha_socialmedia
DB_PASSWORD=your_database_password
DB_PORT=5432

JWT_SECRET=your_jwt_secret

FRONTEND_URL=http://localhost:5173
```

Start the backend

```bash
npm run dev
```

Backend URL

```
http://localhost:3000
```

---

## 4. Frontend Setup

```bash
cd frontend

npm install
```

Create

```
.env
```

from

```
.env.example
```

```env
VITE_API_URL=http://localhost:3000/api
```

Run

```bash
npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

# 📡 REST API

## Authentication

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

---

## Users

```
GET     /api/users/me
PUT     /api/users/me

GET     /api/users/:id

POST    /api/users/:id/follow
DELETE  /api/users/:id/follow

GET     /api/users/:id/followers
GET     /api/users/:id/following
```

---

## Posts

```
POST    /api/posts
GET     /api/posts
GET     /api/posts/:id
PUT     /api/posts/:id
DELETE  /api/posts/:id
```

---

## Comments

```
POST    /api/posts/:postId/comments
GET     /api/posts/:postId/comments

PUT     /api/comments/:id
DELETE  /api/comments/:id
```

---

## Likes

```
POST    /api/posts/:id/like
DELETE  /api/posts/:id/like
GET     /api/posts/:id/likes
```

---

# 🗄️ Database

The application uses five main tables.

- users
- posts
- comments
- likes
- followers

The complete schema is available in

```
database/schema.sql
```

---

# 🔒 Security

- JWT Authentication
- Password Hashing using bcrypt
- Protected API Routes
- Authorization Checks
- SQL Parameterized Queries
- Environment Variables
- Secure File Upload Validation

---

# 📱 Responsive Design

The application is optimized for

- Desktop
- Laptop
- Tablet
- Mobile Devices

---

# 📈 Future Improvements

- Stories
- Notifications
- Real-time Chat
- Direct Messaging
- Search Users
- Explore Page
- Infinite Scrolling
- Email Verification
- Password Reset
- Admin Dashboard
- Dark Mode
- WebSocket Support
- Push Notifications

---

## 👨‍💻 Author

**Mohamed Aziz Guesmi**

Engineering Student in Computer Science

Master's Program in Intelligent Systems

Full Stack Developer | AI Enthusiast

# 📜 Internship

This project was developed during the **CodeAlpha Full Stack Development Internship (2026)**.

---

# ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub.

---

