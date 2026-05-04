document.addEventListener('DOMContentLoaded', () => {
  initCharacterCounter();
  initSearchDropdowns();
});

function initSearchDropdowns() {
  const searchPanel = document.querySelector('.search-panel');
  if (!searchPanel) return;

  const dropdowns = searchPanel.querySelectorAll('.dropdown');

  dropdowns.forEach(dropdown => {
    const labelSpan = dropdown.querySelector('.dropdown-btn span:first-child');
    const items = dropdown.querySelectorAll('.dropdown-menu div:not(.date-picker-row)');

    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        labelSpan.textContent = item.textContent.trim();
        dropdown.dataset.value = item.textContent.trim();
      });
    });

    const manualDate = dropdown.querySelector('#manual-date');
    if (manualDate) {
      manualDate.addEventListener('change', () => {
        labelSpan.textContent = manualDate.value;
        dropdown.dataset.value = manualDate.value;
      });
    }
  });

  const searchBtn = searchPanel.querySelector('.search-btn');
  if (!searchBtn) return;

  searchBtn.addEventListener('click', () => {
    const [boroughEl, dateEl, timeEl] = dropdowns;
    const params = new URLSearchParams();

    const borough = boroughEl?.dataset.value;
    const date = dateEl?.dataset.value;
    const time = timeEl?.dataset.value;

    if (borough) params.set('borough', borough);
    if (date) params.set('date', date);
    if (time) params.set('time', time);

    window.location.href = '/search?' + params.toString();
  });
}

function initCharacterCounter() {
  const textarea = document.getElementById('description');
  const counter = document.getElementById('descriptionCount');
  if (!textarea || !counter) return;

  textarea.addEventListener('input', () => {
    counter.textContent = textarea.value.length;
  });
}
