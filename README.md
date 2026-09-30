# Student Tech Hub 🎓💻

A beginner-friendly, full-stack web application designed for students to explore upcoming campus technical events and register for workshops, hackathons, and bootcamps.

This project is built from scratch without any complicated frameworks or database requirements. It demonstrates how a pure **HTML/CSS/JavaScript** frontend connects to a **Python (FastAPI)** backend via RESTful API calls.

---

## 📁 Project Structure

```text
student-tech-hub/
├── frontend/
│   ├── index.html       # Clean responsive UI structure
│   ├── style.css        # Modern CSS styling (Flexbox & CSS Grid)
│   └── script.js        # Vanilla JS handling API fetch and form submissions
├── backend/
│   ├── main.py          # FastAPI application, CORS setup, and API routes
│   └── requirements.txt # Python dependencies (FastAPI & Uvicorn)
└── README.md            # Project documentation and setup guide
```

---

## 🚀 Features

- **Responsive Modern UI**: Built with pure HTML5, CSS3, and JavaScript — no React or complex build tools needed.
- **Dynamic Events Display**: View upcoming campus tech events (Web Dev, AI, Cybersecurity, Cloud, Open Source).
- **On-Demand Data Loading**: Load or refresh event data directly from the FastAPI backend with the click of a button.
- **Student Registration**: Simple form for students to register with their name, email, and selected event.
- **Cross-Origin Resource Sharing (CORS)**: Configured in FastAPI so frontend and backend can run on different local ports seamlessly.
- **FastAPI Interactive Docs**: Automatic interactive API testing interface at `/docs`.

---

## 🛠️ Prerequisites

Make sure you have **Python 3.8+** installed on your system.
You can verify your installation by running:

```bash
python --version
```
*(On some systems or macOS/Linux, you might use `python3` instead of `python`)*.

---

## 🔧 Step 1: Install and Run the Backend

### 1. Open your terminal and navigate to the `backend` folder:

```bash
cd backend
```

### 2. (Recommended) Create and activate a virtual environment:

- **On Windows (PowerShell):**
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```
  *(If you encounter a PowerShell script execution error, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first, or activate via Command Prompt `.\venv\Scripts\activate.bat`)*

- **On macOS / Linux:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

### 3. Install the dependencies:

```bash
pip install -r requirements.txt
```

### 4. Start the FastAPI backend server:

```bash
uvicorn main:app --reload
```

- The backend will start at: `http://127.0.0.1:8000`
- You can view the interactive API documentation at: `http://127.0.0.1:8000/docs`

---

## 🌐 Step 2: Run the Frontend Locally

Because the frontend is built with pure HTML, CSS, and JavaScript, you have several simple options to run it:

### Option A: Using Python's built-in HTTP server (Quickest & Easiest)

Open a **new** terminal window (keep the backend server running in the other one) and run:

```bash
cd frontend
python -m http.server 5500
```

Now open your web browser and navigate to:
**`http://127.0.0.1:5500`** (or `http://localhost:5500`)

### Option B: VS Code "Live Server" Extension

1. Open the project folder in VS Code.
2. Right-click on `frontend/index.html`.
3. Select **"Open with Live Server"**.

### Option C: Directly Open the HTML File

Double-click `frontend/index.html` or open it directly in Google Chrome, Edge, or Firefox.

---

## 🔄 How the Frontend Communicates with the Backend

This application uses the browser's native **`fetch()` API** to send HTTP requests across the network from the frontend to the backend:

```text
[ Browser (Frontend: Port 5500) ]
        │
        ├── 1. GET  /api/events    ──► [ FastAPI Backend (Port 8000) ]
        │   ◄── Returns JSON list ───┘
        │
        ├── 2. POST /api/register  ──► [ FastAPI Backend (Port 8000) ]
        │   ◄── Returns Success ─────┘
```

### 1. Fetching Events (`GET /api/events`)
When the page loads or when you click **"Load Events from Backend"**:
- JavaScript sends a `GET` request to `http://127.0.0.1:8000/api/events`.
- FastAPI processes the request and responds with a JSON array of events.
- JavaScript parses the JSON (`response.json()`) and dynamically generates HTML event cards inside the `#events-container` element.

### 2. Registering a Student (`POST /api/register`)
When a student fills out their name and email and submits the form:
- JavaScript intercepts the form submit (`event.preventDefault()`).
- It packages the input values into a JSON object:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@university.edu",
    "event_id": 1,
    "event_name": "Full-Stack Web Development Crash Course"
  }
  ```
- It sends an HTTP `POST` request to `http://127.0.0.1:8000/api/register` with headers: `'Content-Type': 'application/json'`.
- FastAPI receives and validates the data using Pydantic, saves the record in memory, and returns a JSON confirmation.
- JavaScript displays a confirmation alert to the student and resets the form.

### 3. Understanding CORS (Cross-Origin Resource Sharing)
By default, web browsers block web pages on one origin (e.g. `http://127.0.0.1:5500`) from requesting data from another origin (e.g. `http://127.0.0.1:8000`) for security reasons.

In `backend/main.py`, we enabled FastAPI's `CORSMiddleware`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from local frontend ports
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],
)
```
This tells the browser that requests from the frontend are authorized, avoiding `"CORS error: No 'Access-Control-Allow-Origin' header present"` errors in the browser console.

---

## 📡 Backend API Reference

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API status and welcome message | None |
| `GET` | `/api/events` | Returns list of upcoming technical events | None |
| `POST` | `/api/register` | Registers a student for an event | `{"name": "...", "email": "...", "event_id": 1, "event_name": "..."}` |
| `GET` | `/api/registrations` | View list of all registered students | None |
| `GET` | `/docs` | Interactive Swagger documentation | None |

---

## 💡 Beginner Tips & Troubleshooting

- **"Failed to fetch" or Offline indicator in frontend**:
  Make sure your FastAPI server is currently running in your terminal (`uvicorn main:app --reload`).
- **Port already in use**:
  If port 8000 is occupied by another application, you can run uvicorn on another port (e.g. `uvicorn main:app --reload --port 8001`) and update `API_BASE_URL` in `frontend/script.js`.
- **No database required**:
  Registrations are stored safely in an in-memory Python list for this project demonstration. Restarting the backend server will reset the registration list.
