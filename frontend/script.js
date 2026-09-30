/**
 * Student Tech Hub - Frontend Script
 * Plain vanilla JavaScript to interact with FastAPI backend.
 */

// ---------------------------------------------------------------------------
// Configuration: Backend API URL
// ---------------------------------------------------------------------------
// By default, FastAPI runs on port 8000 locally.
const API_BASE_URL = 'http://127.0.0.1:8000';

// ---------------------------------------------------------------------------
// DOM Elements
// ---------------------------------------------------------------------------
const loadEventsBtn = document.getElementById('load-events-btn');
const eventsContainer = document.getElementById('events-container');
const eventsCountBadge = document.getElementById('events-count-badge');
const registrationForm = document.getElementById('registration-form');
const registrationAlert = document.getElementById('registration-alert');
const eventSelect = document.getElementById('event-select');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const submitBtn = document.getElementById('submit-btn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');

// Global cache of loaded events
let loadedEvents = [];

// ---------------------------------------------------------------------------
// Helper: Update Backend Status Indicator
// ---------------------------------------------------------------------------
function updateBackendStatus(isOnline, message) {
  if (statusIndicator && statusText) {
    statusIndicator.className = 'status-dot ' + (isOnline ? 'online' : 'offline');
    statusText.textContent = `Backend: ${message}`;
  }
}

// ---------------------------------------------------------------------------
// Helper: Display Registration Alert Box
// ---------------------------------------------------------------------------
function showAlert(type, title, message) {
  registrationAlert.className = `alert-box ${type}`;
  registrationAlert.innerHTML = `
    <strong>${title}</strong>
    <span>${message}</span>
  `;
  registrationAlert.style.display = 'flex';
  
  // Smoothly scroll alert into view if needed
  registrationAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearAlert() {
  registrationAlert.style.display = 'none';
  registrationAlert.className = 'alert-box';
  registrationAlert.innerHTML = '';
}

// ---------------------------------------------------------------------------
// 1. Fetch Events from Backend (GET /api/events)
// ---------------------------------------------------------------------------
async function fetchEvents() {
  // Show loading indicator
  eventsContainer.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Fetching upcoming events from FastAPI backend...</p>
    </div>
  `;
  loadEventsBtn.disabled = true;

  try {
    const response = await fetch(`${API_BASE_URL}/api/events`);

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    loadedEvents = data.events || [];

    // Render the event cards into the DOM
    renderEvents(loadedEvents);

    // Populate the dropdown in the registration form
    populateEventDropdown(loadedEvents);

    // Update count badge and status
    eventsCountBadge.textContent = `${loadedEvents.length} Events`;
    eventsCountBadge.style.display = 'inline-block';
    updateBackendStatus(true, 'Online (Port 8000)');

  } catch (error) {
    console.error('Error fetching events:', error);
    updateBackendStatus(false, 'Offline / Unreachable');

    // Friendly error display for beginners
    eventsContainer.innerHTML = `
      <div class="empty-state" style="border-color: var(--error-border);">
        <div class="empty-icon">⚠️</div>
        <h3 style="color: var(--error);">Unable to load events from backend</h3>
        <p style="margin-bottom: 0.75rem;">
          Could not connect to the FastAPI server at <code>${API_BASE_URL}</code>.
        </p>
        <p style="font-size: 0.85rem; color: var(--text-muted);">
          Make sure your Python backend is running:<br>
          <code>cd backend</code><br>
          <code>uvicorn main:app --reload</code>
        </p>
      </div>
    `;
  } finally {
    loadEventsBtn.disabled = false;
  }
}

// ---------------------------------------------------------------------------
// 2. Render Events into DOM
// ---------------------------------------------------------------------------
function renderEvents(events) {
  if (!events || events.length === 0) {
    eventsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📂</div>
        <h3>No upcoming events found</h3>
        <p>Check back later or register to get notified of new workshops.</p>
      </div>
    `;
    return;
  }

  eventsContainer.innerHTML = events.map(event => `
    <article class="event-card" id="event-${event.id}">
      <div>
        <span class="event-category">${escapeHTML(event.category || 'Workshop')}</span>
        <h3 class="event-title">${escapeHTML(event.title)}</h3>
        <p class="event-description">${escapeHTML(event.description)}</p>
      </div>
      
      <div>
        <div class="event-meta">
          <div class="meta-item">
            <span class="meta-icon">📅</span>
            <span><strong>Date:</strong> ${escapeHTML(event.date)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">⏰</span>
            <span><strong>Time:</strong> ${escapeHTML(event.time)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">📍</span>
            <span><strong>Location:</strong> ${escapeHTML(event.location)}</span>
          </div>
        </div>

        <div class="event-action">
          <button 
            type="button" 
            class="btn btn-sm" 
            onclick="selectEventForRegistration(${event.id}, '${escapeHTML(event.title)}')"
          >
            Register for this Event &rarr;
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

// ---------------------------------------------------------------------------
// 3. Populate Event Dropdown in Registration Form
// ---------------------------------------------------------------------------
function populateEventDropdown(events) {
  if (!eventSelect) return;

  // Preserve the default option
  eventSelect.innerHTML = `<option value="">General Registration / All Events</option>`;

  events.forEach(event => {
    const option = document.createElement('option');
    option.value = event.id;
    option.textContent = event.title;
    eventSelect.appendChild(option);
  });
}

// ---------------------------------------------------------------------------
// 4. Quick Event Selection Handler
// ---------------------------------------------------------------------------
window.selectEventForRegistration = function(eventId, eventTitle) {
  if (eventSelect) {
    eventSelect.value = eventId;
  }
  // Scroll smoothly down to the registration form
  const formCard = document.querySelector('.register-section');
  if (formCard) {
    formCard.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('student-name')?.focus();
  }
};

// ---------------------------------------------------------------------------
// 5. Handle Registration Form Submission (POST /api/register)
// ---------------------------------------------------------------------------
async function handleRegistration(e) {
  e.preventDefault();
  clearAlert();

  const nameInput = document.getElementById('student-name');
  const emailInput = document.getElementById('student-email');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const selectedEventId = eventSelect.value ? parseInt(eventSelect.value, 10) : null;
  const selectedEvent = loadedEvents.find(ev => ev.id === selectedEventId);
  const eventName = selectedEvent ? selectedEvent.title : (eventSelect.value ? "Selected Event" : "General Technical Events");

  // Basic client-side validation
  if (!name || !email) {
    showAlert('error', 'Missing Information', 'Please provide both your name and email address.');
    return;
  }

  // Set loading state on button
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline-block';
  submitBtn.disabled = true;

  try {
    const payload = {
      name: name,
      email: email,
      event_id: selectedEventId,
      event_name: eventName
    };

    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || 'Registration failed.');
    }

    // Success! Show confirmation alert
    showAlert(
      'success',
      'Registration Confirmed! 🎉',
      `Welcome ${result.registration.name}! You are registered for: "${result.registration.event_name}". A confirmation note was recorded.`
    );

    // Reset form fields
    registrationForm.reset();

  } catch (error) {
    console.error('Registration error:', error);
    showAlert(
      'error',
      'Registration Error',
      error.message || 'Could not connect to backend server. Make sure FastAPI is running on port 8000.'
    );
  } finally {
    // Reset button state
    btnText.style.display = 'inline-block';
    btnLoader.style.display = 'none';
    submitBtn.disabled = false;
  }
}

// ---------------------------------------------------------------------------
// Utility: Escape HTML to prevent XSS
// ---------------------------------------------------------------------------
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// Initialization on Page Load
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Bind button clicks and form submission
  if (loadEventsBtn) {
    loadEventsBtn.addEventListener('click', fetchEvents);
  }

  if (registrationForm) {
    registrationForm.addEventListener('submit', handleRegistration);
  }

  // Optional: Automatically fetch events on initial load for convenience
  fetchEvents();
});
