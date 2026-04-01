<<<<<<< HEAD
# goodship
=======
# MERN Order Tracking System

Simple full-stack order tracking app built with MongoDB, Express, React, and Node.js.

## Features

- Create order with:
  - Order ID
  - Date
  - Price
  - Product name
  - Customer name
  - Shipping address
  - Billing address
- Auto-generated transaction ID per order
- View all orders in an order list
- Track order by Order ID
- Progress flow:
  - Confirmed
  - Processing
  - Shipped
  - Out for Delivery
  - Delivered
- Admin login with JWT verification and seeded admin users
- Auto-assigned delivery partners when orders go out for delivery
- Customer feedback submission and admin feedback summary
- Admin dashboard with order status updates
- Admin can delete orders from order list
- Search orders from the order list
- Admin insights dashboard (cards + charts)
- CSV export for filtered orders
- Pagination for large order lists
- Tracking timeline with status timestamps

## Pages

- `/` - Landing page
- `/client` - Client tracking page
- `/admin` - Admin dashboard (create/list/update orders)

## Project Structure

```
order/
  client/   # React + Vite
  server/   # Express + MongoDB API
```

## Setup

1. Install dependencies:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

2. Configure environment:

- Copy `server/.env.example` to `server/.env`
- Set your MongoDB connection string in `MONGO_URI`
- Set `JWT_SECRET` in `server/.env`
- Optionally copy `client/.env.example` to `client/.env` if you want to override the API base URL

3. Seed admin users (from the `server` directory):

```bash
node seeds/adminSeed.js
```

Seed delivery partners:

```bash
node seeds/deliveryPartnerSeed.js
```

Seeded admins:

- `ujjwal` / `ujjwal`
- `akash` / `akash`
- `ryan` / `ryan`

4. Run app (from root):

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`

## API Endpoints

- `POST /api/auth/login` - Admin login and JWT issue
- `GET /api/auth/verify` - Verify stored admin JWT
- `POST /api/orders` - Create order
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Track order by Order ID
- `GET /api/orders/:id/delivery` - Public delivery partner details when out for delivery
- `POST /api/orders/:id/feedback` - Public feedback submission for delivered orders
- `GET /api/orders/:id/feedback` - Admin-only feedback fetch for one order
- `PATCH /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Delete order by Order ID
- `GET /api/feedback/summary` - Admin-only feedback summary
>>>>>>> 59f6c36 (initial commit)
