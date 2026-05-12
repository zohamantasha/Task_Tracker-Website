# Task Tracker Website

A modern full-stack Task Tracker web application developed using Django REST Framework and React.js with real-time chatting support using WebSocket and Django Channels.

---

## Features

- User Authentication (Login & Registration)
- Create, Update and Delete Tasks
- Task Status Management
- Admin Dashboard
- User Dashboard
- Real-Time Chatting System
- Analytics Dashboard
- Responsive UI Design
- REST API Integration
- Secure Backend Architecture

---

## Tech Stack

### Frontend
- React.js
- Axios
- CSS
- React Router DOM

### Backend
- Django
- Django REST Framework
- Django Channels
- WebSocket
- Daphne
- SQLite / MySQL

---

## Real-Time Chat System

This project includes a real-time chatting feature implemented using:

- Django Channels
- WebSocket
- Daphne Server

This enables instant communication without refreshing the page.

---

## Project Structure

```bash
Task_Tracker/
│
├── backend/
│   ├── accounts/
│   ├── analytics/
│   ├── chat/
│   ├── tasks/
│   └── manage.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## Installation Guide

### Backend Setup

```bash
cd backend

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## WebSocket / Daphne Setup

Run Daphne server for real-time communication:

```bash
daphne backend.asgi:application
```

---

## API Features

- Authentication APIs
- Task CRUD APIs
- User Management APIs
- Chat APIs
- Analytics APIs

---

## Author

Zoha Mantasha

---

## GitHub Repository

https://github.com/zohamantasha/Task_Tracker-Website
