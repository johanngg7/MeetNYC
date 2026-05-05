document.addEventListener("DOMContentLoaded", () => {
  initCounter();
  initDropdowns();
  initSearch();
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

function initDropdowns() {
  const btns = document.querySelectorAll(".dropdown-btn");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const menu = btn.nextElementSibling;
      document.querySelectorAll(".dropdown-menu").forEach((m) => {
        if (m !== menu) m.classList.remove("open");
      });
      menu.classList.toggle("open");
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) {
      document.querySelectorAll(".dropdown-menu").forEach((m) => {
        m.classList.remove("open");
      });
    }
  });

  const panel = document.querySelector(".search-panel");
  if (!panel) return;

  const dds = panel.querySelectorAll(".dropdown");
  dds.forEach((dd) => {
    const lbl = dd.querySelector(".dropdown-btn span:first-child");
    const items = dd.querySelectorAll(".dropdown-menu div:not(.date-picker-row)");
    items.forEach((it) => {
      it.addEventListener("click", () => {
        items.forEach((i) => i.classList.remove("selected"));
        it.classList.add("selected");
        lbl.textContent = it.textContent.trim();
        dd.dataset.value = it.textContent.trim();
      });
    });
    const md = dd.querySelector("#manual-date");
    if (md) {
      md.addEventListener("change", () => {
        lbl.textContent = md.value;
        dd.dataset.value = md.value;
      });
    }
  });
}

function initSearch() {
  const panel = document.querySelector(".search-panel");
  if (!panel) return;
  const btn = panel.querySelector(".search-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const dds = panel.querySelectorAll(".dropdown");
    const params = new URLSearchParams();
    const bor = dds[0]?.dataset.value;
    const dt = dds[1]?.dataset.value;
    const tm = dds[2]?.dataset.value;
    if (bor) params.set("borough", bor);
    if (dt) params.set("date", dt);
    if (tm) params.set("time", tm);
    window.location.href = "/events/search?" + params.toString();
  });
}
