const STORAGE_KEY = "jcbo-dyk-dismissed";
const FACT_INTERVAL_MS = 3000;

function preloadImages(urls: string[]): void {
  urls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}

export function initDidYouKnowLoader(imageUrls: string[], facts: string[]): void {
  const banner = document.getElementById("dyk-banner");
  if (!banner || facts.length === 0) return;

  if (localStorage.getItem(STORAGE_KEY)) {
    banner.remove();
    return;
  }

  preloadImages(imageUrls);

  const factEl = document.getElementById("dyk-fact");
  const dismissBtn = document.getElementById("dyk-dismiss");
  const closeBtn = document.getElementById("dyk-close");
  let factIndex = 0;
  let dismissed = false;

  const factInterval = window.setInterval(() => {
    if (dismissed || !factEl) return;
    factIndex = (factIndex + 1) % facts.length;
    factEl.classList.add("dyk-fact-exit");
    window.setTimeout(() => {
      if (!factEl || dismissed) return;
      factEl.textContent = facts[factIndex];
      factEl.classList.remove("dyk-fact-exit");
      factEl.classList.add("dyk-fact-enter");
      window.setTimeout(() => factEl.classList.remove("dyk-fact-enter"), 350);
    }, 250);
  }, FACT_INTERVAL_MS);

  function dismiss(): void {
    if (dismissed) return;
    dismissed = true;
    window.clearInterval(factInterval);
    localStorage.setItem(STORAGE_KEY, "1");
    banner.classList.add("dyk-fade-out");
    window.setTimeout(() => banner.remove(), 400);
  }

  dismissBtn?.addEventListener("click", dismiss);
  closeBtn?.addEventListener("click", dismiss);
}
