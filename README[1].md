# SavoryBook - Restaurant Reservation System

A full-stack MERN (MongoDB, Express, React, Node.js) application for booking restaurant tables.

## Features
- **Browse Restaurants:** View details, menus, and reviews.
- **Table Booking:** Real-time reservation system.
- **Admin Dashboard:** Manage bookings, menu items, and restaurant details.
- **AI Search:** Smart restaurant recommendations powered by Google Gemini.
- **Authentication:** User and Admin login roles.

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, TypeScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **AI:** Google Gemini API

## How to Run Locally

1. **Clone the repository**
   ```bash
   git clone <your-repo-link>
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   Create a `.env` file in the root and add:
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/savorybook
   API_KEY=your_google_gemini_key
   ```

4. **Start the Backend**
   ```bash
   node backend/server.js
   ```

5. **Start the Frontend**
   ```bash
   npm start
   ```
