// Character counter for textareas with maxlength
document.querySelectorAll("textarea[maxlength]").forEach((textarea) => {
  const countId = textarea.id + "Count";
  const counter = document.getElementById(countId);
  if (!counter) return;

  textarea.addEventListener("input", () => {
    counter.textContent = textarea.value.length;
  });
});

// Dropdown toggle
document.querySelectorAll(".dropdown-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const menu = btn.nextElementSibling;
    document.querySelectorAll(".dropdown-menu").forEach((m) => {
      if (m !== menu) m.classList.remove("open");
    });
    menu.classList.toggle("open");
  });
});

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".dropdown")) {
    document.querySelectorAll(".dropdown-menu").forEach((m) => {
      m.classList.remove("open");
    });
  }
});
