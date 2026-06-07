const API_URL = import.meta.env.PUBLIC_API_URL ?? "https://adhesion-jcbo.vercel.app";

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
  const submitBtn = form?.querySelector<HTMLButtonElement>('button[type="submit"]');

  if (
    !modal ||
    !(closeBtn instanceof HTMLButtonElement) ||
    !nameEl ||
    !(form instanceof HTMLFormElement)
  ) {
    return;
  }

  let currentResource = "—";
  let currentResourceId = "";

  const resourceIdInput = document.getElementById("dl-resource-id") as HTMLInputElement | null;

  function openModal(resourceName: string, resourceId?: string): void {
    currentResource = resourceName;
    currentResourceId = resourceId ?? "";
    if (resourceIdInput) resourceIdInput.value = currentResourceId;
    nameEl.textContent = resourceName;
    modal.style.opacity = "1";
    modal.style.visibility = "visible";
  }

  function closeModal(): void {
    modal.style.opacity = "0";
    modal.style.visibility = "hidden";
  }

  document.querySelectorAll<HTMLButtonElement>(".download-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      openModal(btn.dataset.resource ?? "—", btn.dataset.resourceId);
    });
  });

  closeBtn.addEventListener("click", closeModal);
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
      const data = (await res.json()) as { error?: string; sentTo?: string; warning?: string };
      if (!res.ok) {
        alert(data.error || "Erreur lors de l'envoi. Réessayez.");
        return;
      }
      const dest = data.sentTo || email;
      if (data.warning) {
        alert(`${data.warning}\n\nUn e-mail a été envoyé à ${dest}. Vérifiez Courrier indésirable et l'onglet Promotions.`);
      } else {
        alert(
          `Merci ! Le document a été envoyé à ${dest}.\n\n` +
            "Vérifiez votre boîte de réception, l'onglet Promotions et les spams (expéditeur : no-reply@jcbo-conseil.com). " +
            "L'arrivée peut prendre quelques minutes."
        );
      }
      closeModal();
      form.reset();
    } finally {
      setBtnLoading(submitBtn, false);
    }
  });
}

runWhenReady(initRessourcesModal);
