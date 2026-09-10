const filters = document.querySelectorAll('.timeline-filter');
const timelineItems = document.querySelectorAll('.timeline-item');
const timelineStatus = document.querySelector('#timeline-status');

filters.forEach((filter) => {
  filter.addEventListener('click', () => {
    const selectedStage = filter.dataset.stage;

    filters.forEach((button) => {
      const isSelected = button === filter;
      button.classList.toggle('is-active', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
    });

    timelineItems.forEach((item) => {
      const shouldShow = selectedStage === 'all' || item.dataset.stage === selectedStage;
      item.classList.toggle('is-hidden', !shouldShow);
    });

    if (timelineStatus) {
      const selectedLabel = filter.textContent.trim();
      const visibleCount = [...timelineItems].filter((item) => !item.classList.contains('is-hidden')).length;
      timelineStatus.textContent = `Mostrando: ${selectedLabel} (${visibleCount} ${visibleCount === 1 ? 'etapa' : 'etapas'}).`;
    }
  });
});
