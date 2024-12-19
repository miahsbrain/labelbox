# Project Setup Guide

This repository contains two main folders:
- **frontend**: A Next.js application.
- **backend**: A Python FastAPI application.

Follow the instructions below to set up and run both the frontend and backend services.

---

## Prerequisites

Ensure you have the following installed on your system:

1. **Node.js** (v16+)
2. **Python** (v3.10+)
3. **Git**
4. **Virtual Environment Tool** (e.g., `venv` for Python)
5. **Package Managers**:
   - `npm` or `yarn` for the frontend.
   - `pip` for the backend dependencies.
6. **PostgreSQL** (if using a database).

---

## Backend Setup (FastAPI)

### 1. Navigate to the backend folder
```bash
cd backend
```

### 2. Create and activate a virtual environment
```bash
# Linux/MacOS
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the FastAPI server
```bash
uvicorn main:app --reload
```
By default, the server will be available at `http://127.0.0.1:8000`.

---

## Frontend Setup (Next.js) Open new terminal

### 1. Navigate to the frontend folder
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
# Or, if using Yarn
yarn install
```

### 4. Run the Next.js development server
```bash
npm run dev
# Or, if using Yarn
yarn dev
```
By default, the application will be available at `http://localhost:3000`.

---

## Running Both Services Simultaneously
1. Start the backend server as described above.
2. Start the frontend server as described above.

Ensure both are running concurrently.

---

Enjoy running the project! 🎉
