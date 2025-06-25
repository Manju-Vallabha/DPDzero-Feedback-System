# 🌐 Frontend Documentation – Lightweight Feedback System

### 🌟 Overview

This is a **React-based web app** styled using **Tailwind CSS**, designed to manage employee feedback through intuitive interfaces for both managers and employees.

It features:

* 🔐 Login page with role selection
* 📊 Manager dashboard to view and provide feedback
* 👷‍♂️ Employee dashboard to track received feedback
* 📄 PDF export functionality
* ✨ Animated UI with Framer Motion

**Live Demo** (deployed on Vercel): *\[insert-your-vercel-url-here]*

---

### 🛠️ Tech Stack

* **React** – Component-based UI development
* **Tailwind CSS** – Utility-first responsive styling
* **React Router** – Client-side routing for pages
* **React Toastify** – In-app notifications
* **jsPDF** – PDF generation for reports
* **Framer Motion** – Smooth page and card animations

---

### 📁 Key Files & Roles

* `LoginPage.jsx` – Login form with role selection and backend check
* `ManagerPage.jsx` – Dashboard to manage team feedback, respond to requests, and export reports
* `EmployeePage.jsx` – Timeline of feedback with comments and request options
* `App.jsx` – Routing configuration with page transitions
* `main.jsx` – Entry point with ToastContainer setup
* `index.css` – Tailwind CSS imports and global styles

---

### 🧩 Feature Breakdown

### 🔐 Login Page

* Username, password, and role input form
* Verifies backend availability on page load
* Shows toast notifications for login success/failure
* Redirects users to `/manager` or `/employee` based on role

**APIs used**:

* `POST /login`
* `GET /` (for backend health check, optional)

---

### 👩‍💼 Manager Dashboard

* View overall team stats (feedback count, requests)
* Filter/search employees by name or email
* Add or edit feedback via modal interface
* Export team report as PDF using jsPDF
* Handle and respond to employee feedback requests

**APIs used**:

* `POST /manager_data`
* `PUT /feedback`
* `PUT /update_feedback`

---

### 👷‍♂️ Employee Dashboard

* View feedback in a chronological timeline with sentiment emojis (😊 😐 😞)
* See personal stats: total feedback, positive feedback, etc.
* Add/edit comments for each feedback and acknowledge them
* Request feedback from the manager via a button
* Export personal feedback report as a PDF

**APIs used**:

* `POST /employee_data`
* `PUT /comment`
* `PUT /acknowledge_feedback`
* `POST /request_feedback`

---

### ⚛️ App Setup Files

* **App.jsx** – Manages routes with Framer Motion animations
* **main.jsx** – Renders the app and configures global toast notifications

---

### 🧰 Setup Instructions

1. Open a terminal and navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with the following content:

   ```
   VITE_BACKEND_URL=http://localhost:8000
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

Visit [http://localhost:5173](http://localhost:5173) to access the app.

---

### ♿ Accessibility Features

* ARIA labels are used for forms, buttons, and modals
* Full keyboard navigation with Tab/Enter
* WCAG 2.1 AA-compliant color contrast
* Fully responsive layout using Tailwind CSS
* Visible focus rings (`focus:ring-2`) for keyboard users

---

### 🎨 UI Design

* **Colors**: Indigo-purple gradients (`#5A4CF3` → `#4334E9`)
* **Typography**: Clean sans-serif fonts with bold section headings
* **Component Style**: Rounded buttons, hoverable cards, blur-style modals
* **Animations**: Page transitions and hover effects via Framer Motion
* **Sentiment UI**: Feedback cards colored green/yellow/red with matching emojis

---

### 🧠 Challenges & Solutions

* **Modal State Handling**: Used `useRef` to detect outside clicks for closing modals
* **Tag Handling**: Used comma-separated strings and dropdown UI for tag inputs
* **UI Sync Issues**: Resolved with optimistic updates and data refetching post-update

---

### 🚀 Future Improvements

* Add animations to feedback cards for a smoother UX
* Integrate charts (e.g., with Chart.js) to visualize feedback sentiment trends
* Support markdown rendering in comments using `react-markdown`

---

## 🎨 Design Decisions

### 1. **Component Structure**

* Split into role-based pages (`LoginPage`, `ManagerPage`, `EmployeePage`) for clarity and scalability.
* Kept components lightweight and focused on single responsibility (e.g., feedback form, comment section).
* Common UI logic like modals and toast handling centralized to reduce duplication.

### 2. **Routing & Navigation**

* Used **React Router** for clean client-side routing.
* Role-based redirects after login ensure users land on the correct dashboard.
* URLs are semantically structured (`/manager`, `/employee`), enabling future expansion (e.g., `/admin`).

### 3. **Styling & Responsiveness**

* Tailwind CSS was chosen for fast iteration, mobile-first design, and accessible utility classes.
* Layouts adapt across devices (mobile, tablet, desktop) using responsive grid/flex utilities.
* Sentiment-based cards are color-coded for instant recognition.

### 4. **Feedback UX**

* Feedback entries are displayed as cards with large emojis to visually convey sentiment (😊 😐 😞).
* Feedback requests are highlighted prominently for manager attention.
* Employee comments are acknowledged only upon submission to prevent accidental drafts.

### 5. **Notifications & Interactions**

* Used **React Toastify** to display real-time feedback (success/error) on user actions.
* Added loading state handling to inputs where needed (e.g., form submission).
* Used optimistic UI updates and refetching for smoother user experience.

### 6. **Animations**

* Integrated **Framer Motion** to animate page transitions and card interactions.
* Animation enhances perception of speed and feedback acknowledgement.

### 7. **PDF Export**

* Integrated **jsPDF** and `jspdf-autotable` to export reports in a user-friendly way.
* Export options are available on both dashboards to promote transparency and offline sharing.

### 8. **Accessibility**

* All interactive elements include ARIA labels.
* Focus rings and keyboard navigation were enforced using Tailwind’s `focus-visible` and `ring` utilities.
* Text and background colors were selected to maintain strong contrast (WCAG 2.1 AA compliance).

---
