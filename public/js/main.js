'use strict';

document.addEventListener("DOMContentLoaded", () => {
  initCounter();
  initSearch();
  injectErrorStyles();
  initRegisterForm();
  initLoginForm();
  initCreateEventForm();
  initEventDetailsForms();
  initSaveButtons();
  initDashboard();
  initNavbar();
  initRsvp();
  initComments();
  initReviews();
  initBackToTop();
  initShare();
  initImageSkeletons();
});

function initImageSkeletons() {
  document.querySelectorAll(".event-image-wrap.loading").forEach((wrap) => {
    const img = wrap.querySelector("img.event-image");
    if (!img) {
      wrap.classList.remove("loading");
      return;
    }
    const reveal = () => wrap.classList.remove("loading");
    if (img.complete && img.naturalWidth > 0) {
      reveal();
    } else {
      img.addEventListener("load", reveal, { once: true });
      img.addEventListener("error", reveal, { once: true });
    }
  });
}

function initShare() {
  const btn = document.getElementById("shareBtn");
  if (!btn) return;
  const original = btn.textContent;

  const fallbackCopy = (text) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (_) {}
    document.body.removeChild(ta);
    return ok;
  };

  btn.addEventListener("click", async () => {
    const url = window.location.href;
    let copied = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        copied = true;
      } catch (_) {}
    }
    if (!copied) copied = fallbackCopy(url);

    btn.textContent = copied ? "Link Copied!" : "Copy Failed";
    btn.classList.toggle("share-success", copied);
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("share-success");
    }, 1800);
  });
}

function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  const SHOW_AFTER = 300;

  const update = () => {
    if (window.scrollY > SHOW_AFTER) {
      btn.hidden = false;
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
      btn.hidden = true;
    }
  };

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", update, { passive: true });
  update();
}


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
      if (data.status === "added") fireConfetti(btn);
    } catch (err) {
      msg.textContent = err.message;
    } finally {
      btn.disabled = false;
    }
  });
}

function fireConfetti(originEl) {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "confetti-canvas";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let originX = window.innerWidth / 2;
  let originY = window.innerHeight / 3;
  if (originEl) {
    const r = originEl.getBoundingClientRect();
    originX = r.left + r.width / 2;
    originY = r.top + r.height / 2;
  }

  const colors = ["#e03131", "#f59f00", "#2f9e44", "#1c7ed6", "#ae3ec9", "#fab005"];
  const particles = [];
  for (let i = 0; i < 90; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 6 + Math.random() * 7;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 6 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    });
  }

  const gravity = 0.22;
  const drag = 0.99;
  const start = performance.now();

  const tick = (now) => {
    const elapsed = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.vx *= drag;
      p.vy = p.vy * drag + gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life = Math.max(0, 1 - elapsed / 1600);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    });

    if (elapsed < 1600) {
      requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  };
  requestAnimationFrame(tick);
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

  document.querySelectorAll(".admin-flag-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("Flag this event?")) return;
      try {
        const res = await fetch("/admin/events/" + btn.dataset.id + "/flag", { method: "POST" });
        if (!res.ok) throw new Error("flag failed");
        btn.textContent = "Flagged";
        btn.disabled = true;
      } catch (err) {
        alert(err.message);
      }
    });
  });

  document.querySelectorAll(".admin-remove-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("Remove this event permanently?")) return;
      try {
        const res = await fetch("/admin/events/" + btn.dataset.id + "/remove", { method: "POST" });
        if (!res.ok) throw new Error("remove failed");
        window.location.href = "/events";
      } catch (err) {
        alert(err.message);
      }
    });
  });

  document.querySelectorAll(".report-event-btn").forEach(btn => {
    btn.addEventListener("click", () => reportEvent(btn));
  });

  document.querySelectorAll(".report-comment-btn").forEach(btn => {
    btn.addEventListener("click", () => reportComment(btn));
  });
}

function initSaveButtons() {
  document.querySelectorAll(".save-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const eventId = btn.dataset.id;
      if (!eventId) return;

      btn.disabled = true;
      try {
        const res = await fetch("/events/" + eventId + "/save", { method: "POST" });
        if (res.status === 401) return window.location.href = "/login";
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "save failed");
        if (data.status === "saved") {
          btn.textContent = "Unsave Event";
          btn.classList.add("saved");
        } else {
          btn.textContent = "Save Event";
          btn.classList.remove("saved");
        }
      } catch (err) {
        alert(err.message);
      } finally {
        btn.disabled = false;
      }
    });
  });
}


function initDashboard() {
  document.querySelectorAll(".admin-unflag-event").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      try {
        const res = await fetch("/admin/events/" + id + "/unflag", { method: "POST" });
        if (!res.ok) throw new Error("unflag failed");
        btn.closest(".admin-item").remove();
      } catch (err) {
        alert(err.message);
      }
    });
  });

  document.querySelectorAll(".admin-remove-event").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm("Remove this event permanently?")) return;
      try {
        const res = await fetch("/admin/events/" + id + "/remove", { method: "POST" });
        if (!res.ok) throw new Error("remove failed");
        btn.closest(".admin-item").remove();
      } catch (err) {
        alert(err.message);
      }
    });
  });

  document.querySelectorAll(".admin-delete-comment").forEach(btn => {
    btn.addEventListener("click", async () => {
      const eid = btn.dataset.eventId;
      const cid = btn.dataset.commentId;
      if (!confirm("Delete this comment permanently?")) return;
      try {
        const res = await fetch("/admin/events/" + eid + "/comments/" + cid + "/delete", { method: "POST" });
        if (!res.ok) throw new Error("delete failed");
        btn.closest(".admin-item").remove();
      } catch (err) {
        alert(err.message);
      }
    });
  });

  document.querySelectorAll(".admin-unflag-comment").forEach(btn => {
    btn.addEventListener("click", async () => {
      const eid = btn.dataset.eventId;
      const cid = btn.dataset.commentId;
      try {
        const res = await fetch("/admin/events/" + eid + "/comments/" + cid + "/unflag", { method: "POST" });
        if (!res.ok) throw new Error("unflag failed");
        btn.closest(".admin-item").remove();
      } catch (err) {
        alert(err.message);
      }
    });
  });
}

function initNavbar() {
  document.querySelectorAll(".navbar a").forEach(link => {
    if (link.href === window.location.href) link.classList.add("active");
  });
}

async function reportEvent(btn) {
  if (!confirm("Report this event?")) return;
  const eid = btn.dataset.id;
  try {
    const res = await fetch("/events/" + eid + "/report", { method: "POST" });
    if (res.redirected) return window.location.href = res.url;
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "report failed");
    btn.textContent = "Reported";
    btn.disabled = true;
  } catch (err) {
    alert(err.message);
  }
}

async function reportComment(btn) {
  if (!confirm("Report this comment?")) return;
  const eid = btn.dataset.eid;
  const cid = btn.dataset.cid;
  try {
    const res = await fetch("/events/" + eid + "/comments/" + cid + "/report", { method: "POST" });
    if (res.redirected) return window.location.href = res.url;
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "report failed");
    btn.textContent = "Reported";
    btn.disabled = true;
  } catch (err) {
    alert(err.message);
  }
}

function buildCommentNode(c, eid, isAdmin, isLoggedIn) {
  const wrap = document.createElement("div");
  wrap.className = "comment-card";
  wrap.dataset.id = c._id;
  const name = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = c.userName;
  name.appendChild(strong);
  const body = document.createElement("p");
  body.textContent = c.text;
  wrap.appendChild(name);
  wrap.appendChild(body);
  if (isLoggedIn) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "report-btn compact-btn report-comment-btn";
    btn.dataset.cid = c._id;
    btn.dataset.eid = eid;
    btn.textContent = "Report Comment";
    btn.addEventListener("click", () => reportComment(btn));
    wrap.appendChild(btn);
  }
  if (isAdmin) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "danger-btn compact-btn delete-comment-btn";
    btn.dataset.cid = c._id;
    btn.dataset.eid = eid;
    btn.textContent = "Remove Comment";
    btn.addEventListener("click", () => deleteComment(btn));
    wrap.appendChild(btn);
  }
  return wrap;
}

function buildReviewNode(r, eid, isAdmin) {
  const wrap = document.createElement("div");
  wrap.className = "review-card";
  wrap.dataset.id = r._id;
  const head = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = r.userName;
  head.appendChild(strong);
  head.appendChild(document.createTextNode(" - " + r.rating + "/5"));
  const body = document.createElement("p");
  body.textContent = r.text;
  wrap.appendChild(head);
  wrap.appendChild(body);
  if (isAdmin) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "danger-btn compact-btn delete-review-btn";
    btn.dataset.rid = r._id;
    btn.dataset.eid = eid;
    btn.textContent = "Remove Review";
    btn.addEventListener("click", () => deleteReview(btn));
    wrap.appendChild(btn);
  }
  return wrap;
}

async function deleteComment(btn) {
  if (!confirm("Remove this comment?")) return;
  const eid = btn.dataset.eid;
  const cid = btn.dataset.cid;
  try {
    const res = await fetch("/events/" + eid + "/comments/" + cid + "/delete", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "delete failed");
    const card = document.querySelector('.comment-card[data-id="' + cid + '"]');
    if (card) card.remove();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteReview(btn) {
  if (!confirm("Remove this review?")) return;
  const eid = btn.dataset.eid;
  const rid = btn.dataset.rid;
  try {
    const res = await fetch("/events/" + eid + "/reviews/" + rid + "/delete", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "delete failed");
    const card = document.querySelector('.review-card[data-id="' + rid + '"]');
    if (card) card.remove();
    const avg = document.getElementById("averageRating");
    if (avg) {
      avg.textContent = data.averageRating ? data.averageRating + " / 5" : "No reviews";
    }
  } catch (err) {
    alert(err.message);
  }
}

function initComments() {
  const form = document.getElementById("commentForm");
  if (!form) return;
  const ta = document.getElementById("comment");
  const list = document.getElementById("commentList");
  const msg = document.getElementById("commentMsg");
  const eid = form.dataset.id;

  document.querySelectorAll(".delete-comment-btn").forEach((b) => {
    b.addEventListener("click", () => deleteComment(b));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.querySelector(".field-error")) return;
    msg.textContent = "";
    try {
      const res = await fetch("/events/" + eid + "/comments", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "comment=" + encodeURIComponent(ta.value),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "comment failed");
      const empty = document.getElementById("commentEmpty");
      if (empty) empty.remove();
      const isAdmin = document.body.dataset.isAdmin === "true";
      const isLoggedIn = document.body.dataset.isLoggedIn === "true";
      const node = buildCommentNode(data.comment, eid, isAdmin, isLoggedIn);
      list.prepend(node);
      ta.value = "";
    } catch (err) {
      msg.textContent = err.message;
    }
  });
}

function initReviews() {
  const form = document.getElementById("reviewForm");
  if (!form) return;
  const rating = document.getElementById("rating");
  const ta = document.getElementById("review");
  const list = document.getElementById("reviewList");
  const msg = document.getElementById("reviewMsg");
  const avg = document.getElementById("averageRating");
  const eid = form.dataset.id;

  document.querySelectorAll(".delete-review-btn").forEach((b) => {
    b.addEventListener("click", () => deleteReview(b));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.querySelector(".field-error")) return;
    msg.textContent = "";
    try {
      const body = "rating=" + encodeURIComponent(rating.value) + "&review=" + encodeURIComponent(ta.value);
      const res = await fetch("/events/" + eid + "/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "review failed");
      const empty = document.getElementById("reviewEmpty");
      if (empty) empty.remove();
      const isAdmin = document.body.dataset.isAdmin === "true";
      const node = buildReviewNode(data.review, eid, isAdmin);
      list.prepend(node);
      rating.value = "";
      ta.value = "";
      if (avg) avg.textContent = data.averageRating + " / 5";
    } catch (err) {
      msg.textContent = err.message;
    }
  });
}
