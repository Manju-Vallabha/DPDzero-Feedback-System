# DPDzero - Employee Feedback System

## 🌟 Project Overview
This is a **Lightweight Feedback System** built for an internship assignment. It helps managers and employees share structured feedback with a secure, user-friendly, and accessible interface. The app uses a modern UI with Tailwind CSS 🌈 and is live on Vercel for easy access.

### Features

### Core Features
- `Authentication and Roles 🔒`: Supports Manager and Employee roles with JWT-based authentication via Supabase. Managers access only their team’s data.
- `Feedback Submission 📝`: Managers can submit feedback including Strengths, Areas for Improvement, and Sentiment (Positive 😊, Neutral 😐, or Negative 😞). Feedback history is stored and accessible to both roles.
- `Feedback Visibility 👀`: Employees view only their own feedback. Managers can edit previous feedback. Employees can acknowledge feedback to confirm receipt.
- `Dashboards 📊`: Managers have a team overview with feedback counts and task statuses. Employees see a timeline of their feedback with sentiment indicators.

---

### 📊 System Architecture

This diagram illustrates the flow between the frontend, backend, and database layers.

![System Architecture](./Assets/diagram-arech.png)

---

### Additional Features
- `Feedback Requests 🙋‍♂️`: Employees can request feedback from their manager.
- `Tagging 🏷️`: Managers can categorize feedback with tags such as “communication” or “leadership”.
- `PDF Export 📄`: Managers can export team reports, and employees can export personal feedback as PDF files.
- `Comments 💬`: Employees can add comments to feedback, automatically marking it as acknowledged.
- `Task Management 📋`: Managers can monitor team task completion status.
  
### ⚙️ Tech Stack

| Layer      | Technology                      |
| ---------- | ------------------------------- |
| Frontend   | React, Vite, TailwindCSS, jsPDF |
| Backend    | FastAPI, Supabase               |
| Database   | Postgres (via Supabase)         |
| Auth       | Supabase Table Matching         |
| Styling    | TailwindCSS                     |
| Animations | Framer Motion                   |


### 🔐 Dummy Login Credentials

| Role     | Username  | Password |
| -------- | --------- | -------- |
| Manager  | alex  | alex@12345  |
| Manager  | olivia  | olivia@12345  |
| Employee | davidsmith | david@12345  |
| Employee | avadavis | avadavis@12345  |
| Employee | sophialee | sophialee@12345  |
| Employee | emilycarter | emily@12345 |
| Employee | jameswilson | jameswilson@12345  |

---

## Design Decisions
- `Frontend 🌐`: Tailwind CSS enables rapid, responsive styling. React Router ensures seamless navigation. jsPDF provides lightweight PDF generation.
- `Backend ⚙️`: FastAPI delivers high-performance, asynchronous APIs. Supabase simplifies authentication and uses JSONB for flexible feedback storage. Docker ensures consistent deployment.
- `Accessibility ♿`: ARIA labels and keyboard navigation promote inclusivity.
- `Security 🔒`: Role-based access is enforced in APIs and the UI. CORS restricts access to the frontend URL.

## ⚙️ Installation Guide

### 🛠️ Prerequisites

* **Node.js** (version 16 or higher) and **npm** – for the frontend
* **Docker** – for backend containerization
* **Supabase** – account for authentication and database
* **Git** – latest version
* **Modern browser** – e.g., Chrome or Firefox

> ✅ **Optional**:
>
> * **Python** (3.8 or higher) and **pip** – for manual backend setup instead of Docker

---

### 📥 Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/feedback-system.git
cd feedback-system
```

---

### 🐳 2. Backend Setup (Docker Recommended)

```bash
cd backend
```

* Ensure `.env` exists in the backend directory with:

  ```
  SUPABASE_URL=your_supabase_url
  SUPABASE_KEY=your_supabase_key
  FRONTEND_URL=http://localhost:5173
  ```

* Build the Docker image:

  ```bash
  docker build -t feedback-system-backend .
  ```

* Run the container:

  ```bash
  docker run -d -p 8000:8000 --env-file .env feedback-system-backend
  ```

> 🎯 The FastAPI backend will be available at: [http://localhost:8000](http://localhost:8000)

---

### 🧪 Optional: Backend Setup Without Docker

```bash
cd backend
python -m venv venv
# Activate:
# macOS/Linux: source venv/bin/activate
# Windows: venv\Scripts\activate

pip install -r requirements.txt
uvicorn main:app --reload
```

---

### 🌐 3. Frontend Setup

```bash
cd frontend
npm install
```

* Create a `.env` file in the frontend directory:

  ```
  VITE_BACKEND_URL=http://localhost:8000
  ```

* Start the development server:

  ```bash
  npm run dev
  ```

> 🖥️ The frontend runs at [http://localhost:5173](http://localhost:5173)

---

### 🛢️ 4. Supabase Setup

* Create a project on [Supabase](https://supabase.com/)
* In your database, create a table named `empTable` with the following columns:

| Column            | Type        |
| ----------------- | ----------- |
| `emp_id`          | string (PK) |
| `mang_id`         | string      |
| `name`            | string      |
| `email`           | string      |
| `manager_name`    | string      |
| `feedbacks`       | jsonb       |
| `tasks`           | jsonb       |
| `role`            | string      |
| `requestFeedback` | boolean     |

create another table named `mangerTable` with the following columns:

| Column             | Type | Description       |
| ------------------ | ---- | ----------------- |
| `manager_username` | text | Login username    |
| `pass`             | text | Hashed password   |
| `mang_id`          | uuid | Unique manager ID |
| `manager_name`     | text | Full name         |

---

### ✅ 5. Verify Setup

* Open [http://localhost:5173](http://localhost:5173)
* Log in using dummy credentials
* Submit feedback and test the flow

---

### 🗄️ Database Schema

This image shows the structure of the tables used in Supabase (PostgreSQL).

![Database Schema](./Assets/database-schema.png)

---

### 📚 Full Documentation

For complete details about the project structure, setup, APIs, and design decisions, please refer to the following:

* 🔗 [**Frontend Documentation**](./Frontend/README.md) – Setup, components, features, accessibility, UI design, challenges, and future improvements.

* 🔗 [**Backend Documentation**](./Backend/README.md) – API references, database schema, setup instructions, Docker usage, design choices, and future improvements.

---

### 📁 Project Structure

```
feedback-system/
├── backend/
│   ├── main.py                    # FastAPI server and API endpoints
│   ├── utils/
│   │   ├── auth.py                # Authentication logic
│   │   ├── comment.py             # Comment submission handling
│   │   ├── feedback.py            # Feedback management functions
│   │   ├── get_data.py            # Data retrieval for users
│   │   ├── models.py              # Pydantic data models
│   ├── database/
│   │   ├── supabase_client.py     # Supabase client initialization
│   ├── requirements.txt           # Backend dependencies
│   ├── Dockerfile                 # Docker configuration for backend
|   ├── README.md                  # Backend-specific documentation
│
├── frontend/
│   ├── public/
│   │   ├── logo-2.png             # Application logo
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx      # Login interface
│   │   │   ├── ManagerPage.jsx    # Manager dashboard
│   │   │   ├── EmployeePage.jsx   # Employee feedback view
│   │   ├── App.jsx                # Main React component with routing
│   │   ├── main.jsx               # Application entry point
│   ├── package.json               # Frontend dependencies
|   ├── README.md                  # Frontend-specific documentation
│
├── README.md                      # Main project documentation

```
---

### Challenges and Solutions
- `Feedback Storage`: Utilized JSONB in Supabase for scalable feedback arrays.
- `Role-Based Access`: Implemented checks in APIs and UI with Supabase authentication.
- `PDF Generation`: Employed jsPDF with autotable, addressing edge cases for robust exports.

## Key Learnings
- Gained proficiency in Supabase for authentication and data management 🗄️.
- Developed expertise in creating responsive interfaces with React and Tailwind CSS 🌐.
- Learned to containerize applications using Docker 🐳.
- Emphasized empathetic design for effective feedback systems 😊.
