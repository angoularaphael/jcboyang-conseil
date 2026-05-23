export function initRessourcesModal(): void {
  const modal = document.getElementById('downloadModal');
  const closeBtn = document.getElementById('closeModal');
  const nameEl = document.getElementById('modal-resource-name');
  const form = document.getElementById('downloadForm');

  if (
    !modal ||
    !(closeBtn instanceof HTMLButtonElement) ||
    !nameEl ||
    !(form instanceof HTMLFormElement)
  ) {
    return;
  }

  function openModal(resourceName: string): void {
    nameEl.textContent = resourceName;
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
  }

  function closeModal(): void {
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
  }

  document.querySelectorAll<HTMLButtonElement>('.download-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      openModal(btn.dataset.resource ?? '—');
    });
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Merci ! Vous allez recevoir le document par email.');
    closeModal();
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', initRessourcesModal);
