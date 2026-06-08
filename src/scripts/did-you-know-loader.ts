const STORAGE_KEY = "jcbo-dyk-seen";
const MIN_DISPLAY_MS = 2800;
const MAX_WAIT_MS = 12000;
const FACT_INTERVAL_MS = 3500;

export function initDidYouKnowLoader(imageUrls: string[], facts: string[]): void {
  const loader = document.getElementById("dyk-loader");
  if (!loader || facts.length === 0) return;

  if (sessionStorage.getItem(STORAGE_KEY)) {
    loader.remove();
    return;
  }

  const factEl = document.getElementById("dyk-fact");
  const progressBar = document.getElementById("dyk-progress-bar");
  const progressText = document.getElementById("dyk-progress-text");
  let factIndex = 0;
  let loaded = 0;
  const total = imageUrls.length;
  const startTime = Date.now();
  let imagesDone = total === 0;
  let dismissed = false;

  document.body.style.overflow = "hidden";

  const factInterval = window.setInterval(() => {
    if (dismissed || !factEl) return;
    factIndex = (factIndex + 1) % facts.length;
    factEl.classList.add("dyk-fact-exit");
    window.setTimeout(() => {
      if (!factEl || dismissed) return;
      factEl.textContent = facts[factIndex];
      factEl.classList.remove("dyk-fact-exit");
      factEl.classList.add("dyk-fact-enter");
      window.setTimeout(() => factEl.classList.remove("dyk-fact-enter"), 400);
    }, 300);
  }, FACT_INTERVAL_MS);

  function updateProgress(): void {
    const pct = total > 0 ? Math.round((loaded / total) * 100) : 100;
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressText) progressText.textContent = total > 0 ? `${pct} %` : "";
  }

  function dismiss(): void {
    if (dismissed) return;
    dismissed = true;
    window.clearInterval(factInterval);
    sessionStorage.setItem(STORAGE_KEY, "1");
    loader.classList.add("dyk-fade-out");
    document.body.style.overflow = "";
    window.setTimeout(() => loader.remove(), 650);
  }

  function tryDismiss(): void {
    if (!imagesDone || dismissed) return;
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
    window.setTimeout(dismiss, remaining);
  }

  updateProgress();

  imageUrls.forEach((url) => {
    const img = new Image();
    const done = () => {
      loaded += 1;
      updateProgress();
      if (loaded >= total) {
        imagesDone = true;
        tryDismiss();
      }
    };
    img.onload = done;
    img.onerror = done;
    img.src = url;
  });

  window.setTimeout(() => {
    imagesDone = true;
    tryDismiss();
  }, MAX_WAIT_MS);
}
