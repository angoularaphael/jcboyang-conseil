import { apiUrl as API_URL } from "../data/site-config";

function runWhenReady(fn: () => void): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  } else {
    fn();
  }
}

function setBtnLoading(btn: HTMLButtonElement | null, loading: boolean, label = "Envoi…"): void {
  if (!btn) return;
  if (loading) {
    if (!btn.dataset.orig) btn.dataset.orig = btn.textContent ?? "";
    btn.disabled = true;
    btn.textContent = label;
  } else {
    btn.disabled = false;
    if (btn.dataset.orig) btn.textContent = btn.dataset.orig;
  }
}

export function initRessourcesModal(): void {
  const modal = document.getElementById("downloadModal");
  const closeBtn = document.getElementById("closeModal");
  const nameEl = document.getElementById("modal-resource-name");
  const form = document.getElementById("downloadForm");
  const formView = document.getElementById("downloadFormView");
  const successView = document.getElementById("downloadSuccessView");
  const successEmailEl = document.getElementById("downloadSuccessEmail");
  const successCloseBtn = document.getElementById("downloadSuccessClose");
  const errorEl = document.getElementById("downloadError");
  const submitBtn = form?.querySelector<HTMLButtonElement>('button[type="submit"]');

  if (
    !modal ||
    !(closeBtn instanceof HTMLButtonElement) ||
    !nameEl ||
    !(form instanceof HTMLFormElement) ||
    !formView ||
    !successView ||
    !successEmailEl ||
    !(successCloseBtn instanceof HTMLButtonElement)
  ) {
    return;
  }

  let currentResource = "—";
  let currentResourceId = "";

  const resourceIdInput = document.getElementById("dl-resource-id") as HTMLInputElement | null;

  function showFormView(): void {
    formView.classList.remove("hidden");
    successView.classList.add("hidden");
    if (errorEl) {
      errorEl.classList.add("hidden");
      errorEl.textContent = "";
    }
  }

  function showSuccessView(email: string): void {
    formView.classList.add("hidden");
    successView.classList.remove("hidden");
    successEmailEl.textContent = email;
  }

  function openModal(resourceName: string, resourceId?: string): void {
    currentResource = resourceName;
    currentResourceId = resourceId ?? "";
    if (resourceIdInput) resourceIdInput.value = currentResourceId;
    nameEl.textContent = resourceName;
    form.reset();
    showFormView();
    modal.style.opacity = "1";
    modal.style.visibility = "visible";
  }

  function closeModal(): void {
    modal.style.opacity = "0";
    modal.style.visibility = "hidden";
    showFormView();
    form.reset();
  }

  document.querySelectorAll<HTMLButtonElement>(".download-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      openModal(btn.dataset.resource ?? "—", btn.dataset.resourceId);
    });
  });

  closeBtn.addEventListener("click", closeModal);
  successCloseBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const nom = String(fd.get("dl-nom") ?? "").trim();
    const prenom = String(fd.get("dl-prenom") ?? "").trim();
    const email = String(fd.get("dl-email") ?? "").trim();
    const profession = String(fd.get("dl-profession") ?? "").trim();
    const newsletter = fd.get("dl-newsletter") === "on";

    if (errorEl) {
      errorEl.classList.add("hidden");
      errorEl.textContent = "";
    }

    setBtnLoading(submitBtn, true);
    try {
      const res = await fetch(`${API_URL}/api/public/ressources/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          prenom,
          email,
          profession,
          resource: currentResource,
          resourceId: currentResourceId || undefined,
          newsletter,
        }),
      });
      const data = (await res.json()) as { error?: string; sentTo?: string };
      if (!res.ok) {
        if (errorEl) {
          errorEl.textContent = data.error || "Une erreur est survenue. Réessayez.";
          errorEl.classList.remove("hidden");
        }
        return;
      }
      showSuccessView(data.sentTo || email);
    } finally {
      setBtnLoading(submitBtn, false);
    }
  });
}

runWhenReady(initRessourcesModal);
