# ☕ Café Lumière — Full-Stack Cafe Website

A complete MERN stack cafe website with authentication, menu management, table booking, order system, and an admin panel.

## Tech Stack

| Layer     | Stack                                      |
|-----------|--------------------------------------------|
| Frontend  | React + Vite + Tailwind CSS                |
| Backend   | Express.js + MongoDB (Mongoose)            |
| Auth      | JWT (jsonwebtoken) + bcryptjs              |
| Fonts     | Playfair Display + DM Sans (Google Fonts)  |

---

## Project Structure

```
cafe-website/
├── backend/
│   ├── models/          # User, Food, Order, Booking schemas
│   ├── routes/          # auth, food, order, booking endpoints
│   ├── middleware/       # protect + adminOnly guards
│   ├── server.js        # Express entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/  # Navbar, Footer, FoodCard
    │   ├── pages/       # Home, Menu, Booking, Login, AdminPanel
    │   ├── context/     # AuthContext (JWT + user state)
    │   ├── App.jsx      # Routes + layout
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js   # /api proxy → localhost:5000
    └── package.json
```

---

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api` → `http://localhost:5000`.

---

## API Routes

### Auth
| Method | Endpoint          | Access  |
|--------|-------------------|---------|
| POST   | /api/auth/register | Public |
| POST   | /api/auth/login    | Public |
| GET    | /api/auth/me       | Private |

### Food
| Method | Endpoint        | Access |
|--------|-----------------|--------|
| GET    | /api/food       | Public |
| GET    | /api/food/:id   | Public |
| POST   | /api/food       | Admin  |
| PUT    | /api/food/:id   | Admin  |
| DELETE | /api/food/:id   | Admin  |

### Orders
| Method | Endpoint              | Access  |
|--------|-----------------------|---------|
| POST   | /api/orders           | Private |
| GET    | /api/orders/my        | Private |
| GET    | /api/orders           | Admin   |
| PUT    | /api/orders/:id/status| Admin   |

### Bookings
| Method | Endpoint          | Access |
|--------|-------------------|--------|
| POST   | /api/bookings     | Public |
| GET    | /api/bookings     | Admin  |
| PUT    | /api/bookings/:id | Admin  |
| DELETE | /api/bookings/:id | Admin  |

---

## Creating an Admin User

After registering normally, update the user role in MongoDB Atlas:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

---

## .env Reference

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cafe-db
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
