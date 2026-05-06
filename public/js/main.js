'use strict';

document.addEventListener("DOMContentLoaded", () => {
  initCounter();
  initSearch();
  initRsvp();
  injectErrorStyles();
  initRegisterForm();
  initLoginForm();
  initCreateEventForm();
  initEventDetailsForms();
  initSaveButtons();
  initDashboard();
  initNavbar();
});


function initCounter() {
  const tas = document.querySelectorAll("textarea[maxlength]");
  tas.forEach((ta) => {
    const cnt = document.getElementById(ta.id + "Count");
    if (!cnt) return;
    ta.addEventListener("input", () => {
      cnt.textContent = ta.value.length;
    });
  });
}

function initSearch() {
  const form = document.getElementById("home-search-form");
  if (!form) return;

  const err = document.getElementById("search-error");
  const date = document.getElementById("date");
  if (date) date.min = new Date().toISOString().split("T")[0];

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const params = new URLSearchParams();

    for (const [key, val] of data.entries()) {
      const txt = String(val).trim();
      if (txt) params.set(key, txt);
    }

    if ([...params.keys()].length === 0) {
      if (err) err.textContent = "Choose at least one filter.";
      return;
    }

    if (err) err.textContent = "";
    window.location.href = "/events/search?" + params.toString();
  });
}

function initRsvp() {
  const form = document.getElementById("rsvpForm");
  if (!form) return;
  const btn = document.getElementById("rsvpBtn");
  const cnt = document.getElementById("attendeeCount");
  const msg = document.getElementById("rsvpMsg");
  const id = form.dataset.id;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    btn.disabled = true;
    try {
      const res = await fetch("/events/" + id + "/rsvp", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "rsvp failed");
      cnt.textContent = data.count;
      btn.textContent = data.status === "added" ? "Cancel RSVP" : "RSVP";
    } catch (err) {
      msg.textContent = err.message;
    } finally {
      btn.disabled = false;
    }
  });
}



function injectErrorStyles() {
  if (document.getElementById("meetnyc-validation-styles")) return;
  const style = document.createElement("style");
  style.id = "meetnyc-validation-styles";
  style.textContent = `
    .input-error { border: 1.5px solid #e53e3e !important; }
    .field-error  { color: #e53e3e; font-size: 0.8rem; margin: 3px 0 6px; }
  `;
  document.head.appendChild(style);
}

function showError(input, message) {
  clearError(input);
  input.classList.add("input-error");
  const err = document.createElement("p");
  err.className = "field-error";
  err.textContent = message;
  input.insertAdjacentElement("afterend", err);
}

function clearError(input) {
  input.classList.remove("input-error");
  const next = input.nextElementSibling;
  if (next && next.classList.contains("field-error")) next.remove();
}

function showSelectError(select, message) {
  clearSelectError(select);
  select.classList.add("input-error");
  const err = document.createElement("p");
  err.className = "field-error";
  err.textContent = message;
  select.insertAdjacentElement("afterend", err);
}

function clearSelectError(select) {
  select.classList.remove("input-error");
  const next = select.nextElementSibling;
  if (next && next.classList.contains("field-error")) next.remove();
}

function showTextareaError(textarea, message) {
  clearError(textarea);
  textarea.classList.add("input-error");
  const err = document.createElement("p");
  err.className = "field-error";
  err.textContent = message;
  const charCount = textarea.parentElement.querySelector(".char-count");
  (charCount || textarea).insertAdjacentElement("afterend", err);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function initRegisterForm() {
  const form = document.getElementById("signup-form");
  if (!form) return;

  const handle          = document.getElementById("handle");
  const firstName       = document.getElementById("firstName");
  const lastName        = document.getElementById("lastName");
  const email           = document.getElementById("email");
  const password        = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");

  [handle, firstName, lastName, email, password, confirmPassword].forEach(el => {
    el && el.addEventListener("input", () => clearError(el));
  });

  form.addEventListener("submit", e => {
    let valid = true;

    if (!handle.value.trim()) {
      showError(handle, "Handle is required.");
      valid = false;
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(handle.value.trim())) {
      showError(handle, "Handle must be 3-20 characters (letters, numbers, underscores).");
      valid = false;
    }

    if (!firstName.value.trim()) {
      showError(firstName, "First name is required.");
      valid = false;
    } else if (firstName.value.trim().length < 2) {
      showError(firstName, "First name must be at least 2 characters.");
      valid = false;
    }

    if (!lastName.value.trim()) {
      showError(lastName, "Last name is required.");
      valid = false;
    } else if (lastName.value.trim().length < 2) {
      showError(lastName, "Last name must be at least 2 characters.");
      valid = false;
    }

    if (!email.value.trim()) {
      showError(email, "Email is required.");
      valid = false;
    } else if (!isValidEmail(email.value)) {
      showError(email, "Please enter a valid email address.");
      valid = false;
    }

    if (!password.value) {
      showError(password, "Password is required.");
      valid = false;
    } else if (password.value.length < 8) {
      showError(password, "Password must be at least 8 characters.");
      valid = false;
    } else if (!/[A-Z]/.test(password.value)) {
      showError(password, "Password must contain at least one uppercase letter.");
      valid = false;
    } else if (!/[0-9]/.test(password.value)) {
      showError(password, "Password must contain at least one number.");
      valid = false;
    } else if (!/[^a-zA-Z0-9]/.test(password.value)) {
      showError(password, "Password must have a special charater.");
      valid = false;
    } else if (/\s/.test(password.value)) {
      showError(password, "Password cannot have spaces.");
      valid = false;
    }
    

    if (!confirmPassword.value) {
      showError(confirmPassword, "Please confirm your password.");
      valid = false;
    } else if (password.value !== confirmPassword.value) {
      showError(confirmPassword, "Passwords do not match.");
      valid = false;
    }

    if (!valid) e.preventDefault();
  });
}


function initLoginForm() {
  const form = document.getElementById("signin-form");
  if (!form) return;

  const email    = document.getElementById("email");
  const password = document.getElementById("password");

  [email, password].forEach(el => el && el.addEventListener("input", () => clearError(el)));

  form.addEventListener("submit", e => {
    let valid = true;

    if (!email.value.trim()) {
      showError(email, "Email is required.");
      valid = false;
    } else if (!isValidEmail(email.value)) {
      showError(email, "Please enter a valid email address.");
      valid = false;
    }

    if (!password.value) {
      showError(password, "Password is required.");
      valid = false;
    }

    if (!valid) e.preventDefault();
  });
}


function initCreateEventForm() {
  const form = document.querySelector('form[action="/events/create"]');
  if (!form) return;

  const title       = document.getElementById("title");
  const borough     = document.getElementById("borough");
  const location    = document.getElementById("location");
  const category    = document.getElementById("category");
  const description = document.getElementById("description");
  const date        = document.getElementById("date");
  const startTime   = document.getElementById("startTime");
  const endTime     = document.getElementById("endTime");


  if (description) {
    description.addEventListener("input", () => {
      clearError(description);
      const cnt = document.getElementById("descriptionCount");
      if (cnt) cnt.style.color = description.value.length >= 280 ? "#e53e3e" : "";
    });
  }

  if (date) {
    date.min = new Date().toISOString().split("T")[0];
    date.addEventListener("change", () => clearError(date));
  }

  [title, location].forEach(el => el && el.addEventListener("input",  () => clearError(el)));
  [borough, category].forEach(el => el && el.addEventListener("change", () => clearSelectError(el)));
  [startTime, endTime].forEach(el => el && el.addEventListener("change", () => clearError(el)));

  form.addEventListener("submit", e => {
    let valid = true;

    if (!title.value.trim()) {
      showError(title, "Event title is required.");
      valid = false;
    } else if (title.value.trim().length < 3) {
      showError(title, "Title must be at least 3 characters.");
      valid = false;
    }

    if (!borough.value) {
      showSelectError(borough, "Please select a borough.");
      valid = false;
    }

    if (!location.value.trim()) {
      showError(location, "Location is required.");
      valid = false;
    }

    if (!category.value) {
      showSelectError(category, "Please select a category.");
      valid = false;
    }

    if (description && description.value.length > 300) {
      showTextareaError(description, "Description cannot exceed 300 characters.");
      valid = false;
    }

    if (!date.value) {
      showError(date, "Date is required.");
      valid = false;
    } else {
      const chosen = new Date(date.value + "T00:00:00");
      const today  = new Date(); today.setHours(0, 0, 0, 0);
      if (chosen < today) {
        showError(date, "Date cannot be in the past.");
        valid = false;
      }
    }

    if (!startTime.value) {
      showError(startTime, "Start time is required.");
      valid = false;
    }

    if (!endTime.value) {
      showError(endTime, "End time is required.");
      valid = false;
    } else if (startTime.value && endTime.value <= startTime.value) {
      showError(endTime, "End time must be after start time.");
      valid = false;
    }

    if (!valid) e.preventDefault();
  });
}


function initEventDetailsForms() {
  const commentTextarea = document.getElementById("comment");
  if (commentTextarea) {
    const commentForm = commentTextarea.closest("form");
    commentTextarea.addEventListener("input", () => clearError(commentTextarea));
    commentForm.addEventListener("submit", e => {
      if (!commentTextarea.value.trim()) {
        showTextareaError(commentTextarea, "Comment cannot be empty.");
        e.preventDefault();
      } else if (commentTextarea.value.trim().length < 3) {
        showTextareaError(commentTextarea, "Comment must be at least 3 characters.");
        e.preventDefault();
      } else if (commentTextarea.value.length > 500) {
        showTextareaError(commentTextarea, "Comment cannot exceed 500 characters.");
        e.preventDefault();
      }
    });
  }

  const ratingSelect   = document.getElementById("rating");
  const reviewTextarea = document.getElementById("review");
  if (ratingSelect && reviewTextarea) {
    const reviewForm = ratingSelect.closest("form");
    ratingSelect.addEventListener("change",  () => clearSelectError(ratingSelect));
    reviewTextarea.addEventListener("input", () => clearError(reviewTextarea));
    reviewForm.addEventListener("submit", e => {
      let valid = true;
      if (!ratingSelect.value) {
        showSelectError(ratingSelect, "Please select a rating.");
        valid = false;
      }
      if (!reviewTextarea.value.trim()) {
        showTextareaError(reviewTextarea, "Review cannot be empty.");
        valid = false;
      } else if (reviewTextarea.value.trim().length < 10) {
        showTextareaError(reviewTextarea, "Review must be at least 10 characters.");
        valid = false;
      } else if (reviewTextarea.value.length > 500) {
        showTextareaError(reviewTextarea, "Review cannot exceed 500 characters.");
        valid = false;
      }
      if (!valid) e.preventDefault();
    });
  }

  document.querySelectorAll('form[action*="/delete"]').forEach(form => {
    form.addEventListener("submit", e => {
      if (!confirm("Are you sure you want to delete this? This cannot be undone.")) {
        e.preventDefault();
      }
    });
  });

  document.querySelectorAll('form[action*="/flag"]').forEach(form => {
    form.addEventListener("submit", e => {
      if (!confirm("Flag / remove this event? This action will be logged.")) {
        e.preventDefault();
      }
    });
  });
}

function initSaveButtons() {
  document.querySelectorAll(".save-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const eventId = btn.dataset.id;
      if (!eventId) return;

      btn.disabled = true;
      const original = btn.textContent;
      btn.textContent = "Saving...";

      try {
        const res = await fetch(`/events/${eventId}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          btn.textContent = "♥ Saved";
          btn.classList.add("saved");
        } else if (res.status === 401) {
          window.location.href = "/login";
        } else {
          btn.textContent = original;
          btn.disabled = false;
          alert("Could not save event. Please try again.");
        }
      } catch {
        btn.textContent = original;
        btn.disabled = false;
        alert("Network error. Please check your connection.");
      }
    });
  });
}


function initDashboard() {
  document.querySelectorAll(".danger-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const item  = btn.closest(".admin-item");
      const label = item?.querySelector("p")?.textContent.trim() ?? "this item";
      if (!confirm(`Are you sure you want to remove "${label}"?`)) {
        e.preventDefault();
      }
    });
  });
}

function initNavbar() {
  document.querySelectorAll(".navbar a").forEach(link => {
    if (link.href === window.location.href) link.classList.add("active");
  });
}
