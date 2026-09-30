"""
Student Tech Hub - Backend API
Built with Python and FastAPI.

This file defines the backend server, CORS configuration,
and endpoints to serve event data and handle student registrations.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Initialize FastAPI application
app = FastAPI(
    title="Student Tech Hub API",
    description="A beginner-friendly API providing tech events and registration for students",
    version="1.0.0"
)

# ---------------------------------------------------------------------------
# CORS (Cross-Origin Resource Sharing) Configuration
# ---------------------------------------------------------------------------
# In a web browser, security rules prevent a webpage on one origin (e.g., http://localhost:5500)
# from making API requests to a server on another origin (e.g., http://127.0.0.1:8000).
# CORS middleware tells the browser that requests from other ports/domains are allowed.
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:5500",
    "http://localhost:8000",
    "http://localhost:8080",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5500",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:8080",
    "*"  # Allows all origins for local beginner development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all HTTP headers
)

# ---------------------------------------------------------------------------
# Sample Data & Data Models
# ---------------------------------------------------------------------------

# Sample list of upcoming technical events
sample_events = [
    {
        "id": 1,
        "title": "Full-Stack Web Development Crash Course",
        "category": "Web Development",
        "date": "October 15, 2026",
        "time": "5:00 PM - 7:00 PM",
        "location": "Lab 3 & Online (Zoom)",
        "description": "Learn how modern frontend and backend frameworks work together to create dynamic web apps."
    },
    {
        "id": 2,
        "title": "Introduction to AI & Machine Learning",
        "category": "Artificial Intelligence",
        "date": "October 22, 2026",
        "time": "4:00 PM - 6:00 PM",
        "location": "Auditorium A",
        "description": "Discover neural networks, computer vision, and prompt engineering with hands-on Python demos."
    },
    {
        "id": 3,
        "title": "Beginner Cybersecurity & CTF Challenge",
        "category": "Cybersecurity",
        "date": "November 05, 2026",
        "time": "3:00 PM - 6:30 PM",
        "location": "Innovation Lab",
        "description": "Understand basic network security, ethical hacking fundamentals, and participate in fun capture-the-flag puzzles."
    },
    {
        "id": 4,
        "title": "Cloud Computing & DevOps 101",
        "category": "Cloud & DevOps",
        "date": "November 18, 2026",
        "time": "5:30 PM - 7:00 PM",
        "location": "Online (Google Meet)",
        "description": "A beginner guide to deploying applications, cloud services, Docker containers, and CI/CD pipelines."
    },
    {
        "id": 5,
        "title": "Open Source Hack Night",
        "category": "Open Source",
        "date": "December 02, 2026",
        "time": "6:00 PM - 9:00 PM",
        "location": "Student Commons Room",
        "description": "Collaborate on real-world open-source repositories, submit your first GitHub pull request, and win swag!"
    }
]

# In-memory storage for registrations (simple and requires no database setup)
registered_students = []

# Define the expected JSON body for the registration endpoint
class RegistrationRequest(BaseModel):
    name: str
    email: str
    event_id: Optional[int] = None
    event_name: Optional[str] = None

# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
def read_root():
    """
    Root endpoint: Provides a friendly welcome message and helpful links.
    """
    return {
        "message": "Welcome to the Student Tech Hub API!",
        "endpoints": {
            "GET /api/events": "Fetch the list of upcoming technical events",
            "POST /api/register": "Register a student with name and email",
            "GET /docs": "Interactive Swagger API documentation"
        }
    }


@app.get("/api/events")
def get_events():
    """
    GET endpoint: Returns the list of sample technical events as JSON.
    """
    return {
        "status": "success",
        "count": len(sample_events),
        "events": sample_events
    }


@app.post("/api/register")
def register_student(registration: RegistrationRequest):
    """
    POST endpoint: Accepts a student's name and email, validates them,
    and returns a success confirmation.
    """
    # Basic input validation
    clean_name = registration.name.strip()
    clean_email = registration.email.strip()

    if not clean_name:
        raise HTTPException(status_code=400, detail="Student name cannot be empty.")

    if not clean_email or "@" not in clean_email or "." not in clean_email:
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")

    # Record the registration in memory
    record = {
        "id": len(registered_students) + 1,
        "name": clean_name,
        "email": clean_email,
        "event_id": registration.event_id,
        "event_name": registration.event_name or "General Technical Events",
    }
    registered_students.append(record)

    return {
        "status": "success",
        "message": f"Successfully registered {clean_name}!",
        "registration": record
    }


# Optional endpoint to check registrations (helpful for testing)
@app.get("/api/registrations")
def get_registrations():
    """
    Helper GET endpoint: View all current registrations stored in memory.
    """
    return {
        "status": "success",
        "total": len(registered_students),
        "registrations": registered_students
    }
