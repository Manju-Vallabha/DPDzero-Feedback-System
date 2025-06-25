
# ⚙️ Backend Documentation – Lightweight Feedback System

### 🌟 Overview

The backend is built with **FastAPI**, leveraging **Supabase** for authentication and data storage via **PostgreSQL**. It exposes RESTful endpoints to manage feedback, comments, and user data. The backend is containerized using **Docker** for easy deployment and portability.

---

### 🛠️ Tech Stack

* **FastAPI** – Async Python web framework
* **Supabase** – PostgreSQL + built-in auth
* **Pydantic** – Data validation and modeling
* **python-dotenv** – Environment configuration
* **Uvicorn** – ASGI server for FastAPI
* **Docker** – Backend containerization

---

### 📁 File Structure

* `main.py` – API route definitions
* `utils/auth.py` – User authentication logic
* `utils/comment.py` – Comment addition and acknowledgment
* `utils/feedback.py` – Add, update, and acknowledge feedback
* `utils/get_data.py` – Fetch data for employee/manager views
* `utils/models.py` – Pydantic data models for requests/responses
* `database/supabase_client.py` – Supabase connection setup
* `requirements.txt` – Python dependencies
* `Dockerfile` – Docker configuration

---

### 📋 Setup Instructions

### 🐳 Docker Setup (Recommended)

1. Navigate to `backend/` directory

2. Build the Docker image:

   ```bash
   docker build -t feedback-system-backend .
   ```

3. Run the container:

   ```bash
   docker run -p 8000:8000 --env-file .env feedback-system-backend
   ```

Access the backend at: [http://localhost:8000](http://localhost:8000)

---



### 🔧 Manual Setup (Optional)

1. Navigate to backend:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file:

   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   FRONTEND_URL=http://localhost:5173
   ```

5. Run the development server:

   ```bash
   uvicorn main:app --reload
   ```
---

### 🗄️ Database Schema

### `empTable` (Employee Data)

* `emp_id` – *string*, primary key
* `mang_id` – *string* (manager reference)
* `name` – *string*
* `email` – *string*
* `manager_name` – *string*
* `feedbacks` – *jsonb* (array of feedback objects)
* `tasks` – *jsonb*
* `role` – *string* (`employee` or `manager`)
* `requestFeedback` – *boolean*

### `mangerTable` (Manager Credentials)

* `manager_username` – *text*
* `pass` – *text* (stored as plain or hashed)
* `mang_id` – *uuid*
* `manager_name` – *text*

---

### 🧠 Design Decisions

* **FastAPI** chosen for async support and built-in docs at `/docs` and `/redoc`
* **Supabase** used for simple auth and managed PostgreSQL hosting
* **Feedback stored in `jsonb`** format inside the employee record for faster updates and grouping
* **CORS** is restricted to frontend origin (`http://localhost:5173`) for security

---

### 🛑 Challenges & Solutions

* **Feedback Updates**: Since feedback is stored in an array inside `jsonb`, updating by index required parsing, modifying, and re-saving the whole array
* **Atomic Updates**: Used single-row operations to reduce conflict risk
  
---

### 🌐 API Documentation

### 🔐 Authentication

**POST `/login`**

* Request:

  ```json
  {
    "username": "manager1",
    "password": "securepassword",
    "role": "manager"
  }
  ```
* Response:

  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "123",
      "email": "manager1@example.com",
      "role": "manager"
    },
    "status": "success"
  }
  ```

---

### 👀 Data Retrieval

**POST `/manager_data`**

* Request:

  ```json
  { "id": "manager123" }
  ```
* Response:

  ```json
  {
    "employees": [{ "emp_id": "456", "name": "John Doe", "feedbacks": [...] }],
    "status": "success"
  }
  ```

**POST `/employee_data`**

* Request:

  ```json
  { "id": "employee456" }
  ```
* Response:

  ```json
  {
    "employee": { "emp_id": "456", "name": "John Doe", "feedbacks": [...] },
    "status": "success"
  }
  ```

---

### 📝 Feedback Management

**PUT `/feedback`**

* Request:

  ```json
  {
    "mangId": "manager123",
    "empId": "employee456",
    "feedback": {
      "date": "2025-06-25",
      "strengths": "Great work!",
      "improvement": "Improve punctuality",
      "sentiment": "Positive",
      "tags": "teamwork,communication"
    },
    "requestFeedback": false
  }
  ```
* Response:

  ```json
  {
    "message": "Feedback added successfully",
    "status": "success"
  }
  ```

**PUT `/update_feedback`**

* Request:

  ```json
  {
    "mangId": "manager123",
    "empId": "employee456",
    "index": 0,
    "updatedFeedback": {
      "strengths": "Updated strengths",
      "improvement": "Updated improvement",
      "sentiment": "Neutral",
      "tags": "updated"
    }
  }
  ```
* Response:

  ```json
  {
    "message": "Feedback updated successfully",
    "status": "success"
  }
  ```

**PUT `/acknowledge_feedback`**

* Request:

  ```json
  {
    "empId": "employee456",
    "date": "2025-06-25",
    "acknowledged": true
  }
  ```
* Response:

  ```json
  {
    "message": "Feedback acknowledged",
    "status": "success"
  }
  ```

**POST `/request_feedback`**

* Request:

  ```json
  { "id": "employee456" }
  ```
* Response:

  ```json
  {
    "message": "Feedback request submitted",
    "status": "success"
  }
  ```

---

### 💬 Comments

**PUT `/comment`**

* Request:

  ```json
  {
    "empId": "employee456",
    "date": "2025-06-25",
    "comment": "Thanks for the feedback!",
    "acknowledged": true
  }
  ```
* Response:

  ```json
  {
    "message": "Comment added successfully",
    "status": "success"
  }
  ```

---


### Feedback Object Structure:

```json
{
  "date": "YYYY-MM-DD",
  "strengths": "text",
  "improvement": "text",
  "sentiment": "Positive | Neutral | Negative",
  "tags": "comma,separated,tags",
  "acknowledged": false,
  "comment": "",
  "updatedDate": "YYYY-MM-DD"
}
```

* **Tag Input**: Converted input tags into comma-separated strings with basic validation

---


