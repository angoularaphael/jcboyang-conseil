type SessionCatalogItem = {
  id: string;
  title: string;
  duration: string;
  priceEur: number;
  priceCfa: string;
  isTest?: boolean;
};

function buildSessionMaps(catalog: SessionCatalogItem[]) {
  const sessionLabels: Record<string, string> = {};
  const pricesEur: Record<string, number> = {};
  const pricesXaf: Record<string, number> = {};
  const pricesCfa: Record<string, string> = {};
  for (const s of catalog) {
    sessionLabels[s.id] = s.title;
    pricesEur[s.id] = s.priceEur;
    pricesCfa[s.id] = s.priceCfa;
    pricesXaf[s.id] = Number(String(s.priceCfa).replace(/\s/g, "")) || 0;
  }
  return { sessionLabels, pricesEur, pricesXaf, pricesCfa };
}

function formatCfaPrice(sessionId: string, pricesCfa: Record<string, string>): string {
  return `${pricesCfa[sessionId] ?? "0"} FCFA`;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-().]/g, '');
}

/** Numéro avec indicatif pays (ex. +237 6XX XXX XXX). */
function isValidPhoneWithCountryCode(phone: string): boolean {
  const cleaned = normalizePhone(phone);
  return /^\+?[1-9]\d{8,14}$/.test(cleaned);
}

function getInput(id: string): HTMLInputElement | null {
  const el = document.getElementById(id);
  return el instanceof HTMLInputElement ? el : null;
}

function getCheckedRadio(name: string): HTMLInputElement | null {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el instanceof HTMLInputElement ? el : null;
}

export function initReserverBooking(
  catalog: SessionCatalogItem[] = [],
  options: { stripeEurOnly?: boolean; devBypass?: boolean } = {}
): void {
  const stripeEurOnly = options.stripeEurOnly === true;
  const devActive = options.devBypass === true || !!document.getElementById('dev-mode-banner');

  const TEST_ITEM: SessionCatalogItem = {
    id: 'test1e',
    title: 'Test paiement live 1 €',
    duration: 'Test',
    priceEur: 1,
    priceCfa: '655',
    isTest: true,
  };

  let mergedCatalog = catalog;
  if (devActive && !catalog.some((s) => s.id === 'test1e')) {
    mergedCatalog = [TEST_ITEM, ...catalog];
    injectDevTestOption(TEST_ITEM, stripeEurOnly);
  }

  const { sessionLabels, pricesEur, pricesCfa } = buildSessionMaps(mergedCatalog);
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const toStep2Btn = document.getElementById('toStep2');
  const toStep3Btn = document.getElementById('toStep3');
  const backStep1Btn = document.getElementById('backStep1');
  const backStep2Btn = document.getElementById('backStep2');
  const payBtn = document.getElementById('payBtn');

  if (
    !step1 ||
    !step2 ||
    !step3 ||
    !(toStep2Btn instanceof HTMLButtonElement) ||
    !(toStep3Btn instanceof HTMLButtonElement) ||
    !(backStep1Btn instanceof HTMLButtonElement) ||
    !(backStep2Btn instanceof HTMLButtonElement) ||
    !(payBtn instanceof HTMLButtonElement)
  ) {
    return;
  }

  const steps = [step1, step2, step3];

  const phoneHintAfrique = document.getElementById('phone-hint-afrique');
  const phoneInput = getInput('bk-phone');
  const virementInfo = document.getElementById('virement-info');

  function getSelectedZone(): string {
    if (stripeEurOnly) return 'euro';
    return getCheckedRadio('zone')?.value ?? 'euro';
  }

  function updatePhoneHint(): void {
    const zone = getSelectedZone();
    if (phoneHintAfrique) {
      phoneHintAfrique.classList.toggle('hidden', zone !== 'afrique');
    }
    if (phoneInput) {
      phoneInput.placeholder =
        zone === 'afrique'
          ? '+237 6XX XXX XXX (indicatif pays obligatoire)'
          : '+33 6 XX XX XX XX';
    }
  }

  function updatePaymentOptionsForZone(zone: string, _sessionId?: string): void {
    document.querySelectorAll<HTMLElement>('[data-payment-zone]').forEach((el) => {
      const allowed = el.dataset.paymentZone;
      const visible = allowed === 'all' || allowed === zone;
      el.classList.toggle('hidden', !visible);
      if (!visible) {
        const radio = el.querySelector<HTMLInputElement>('input[type="radio"]');
        if (radio) radio.checked = false;
      }
    });

    if (payBtn instanceof HTMLButtonElement) {
      payBtn.disabled = false;
      payBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    document.querySelector<HTMLInputElement>('input[name="payment"][value="card"]')?.click();
    if (virementInfo) {
      const virementSelected =
        document.querySelector<HTMLInputElement>('input[name="payment"][value="virement"]:checked') !=
        null;
      virementInfo.classList.toggle('hidden', !virementSelected);
    }
  }

  document.querySelectorAll<HTMLInputElement>('input[name="zone"]').forEach((radio) => {
    radio.addEventListener('change', updatePhoneHint);
  });
  updatePhoneHint();

  function onSessionChange(this: HTMLInputElement): void {
    toStep2Btn.disabled = false;
    toStep2Btn.classList.remove('opacity-50', 'cursor-not-allowed');
    document.querySelectorAll('.session-option').forEach((o) => o.classList.remove('border-gold'));
    this.closest('.session-option')?.classList.add('border-gold');
  }

  function bindSessionRadios(): void {
    document.querySelectorAll<HTMLInputElement>('input[name="session"]').forEach((radio) => {
      if (radio.dataset.listenerBound === '1') return;
      radio.dataset.listenerBound = '1';
      radio.addEventListener('change', onSessionChange);
    });
  }

  bindSessionRadios();

  function showStep(n: number): void {
    steps.forEach((s) => s.classList.add('hidden'));
    steps[n - 1]?.classList.remove('hidden');

    for (let i = 1; i <= 3; i++) {
      const ind = document.getElementById(`step-ind-${i}`);
      const circle = ind?.querySelector('span:first-child');
      if (!(circle instanceof HTMLElement)) continue;
      circle.className =
        i <= n
          ? 'w-8 h-8 bg-gold text-navy font-bold text-sm rounded-full flex items-center justify-center'
          : 'w-8 h-8 bg-gray-200 text-gray-500 font-bold text-sm rounded-full flex items-center justify-center';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toStep2Btn.addEventListener('click', () => showStep(2));
  backStep1Btn.addEventListener('click', () => showStep(1));

  toStep3Btn.addEventListener('click', () => {
    const nameInput = getInput('bk-name');
    const emailInput = getInput('bk-email');
    const phoneInput = getInput('bk-phone');
    const dateInput = getInput('bk-date');
    const sessionRadio = getCheckedRadio('session');
    const zoneRadio = getCheckedRadio('zone');

    if (!nameInput || !emailInput || !phoneInput || !sessionRadio || (!stripeEurOnly && !zoneRadio)) return;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const zone = getSelectedZone();
    if (!name || !email || !phone) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }
    if (zone === 'afrique' && !stripeEurOnly && !isValidPhoneWithCountryCode(phone)) {
      alert(
        'Pour la zone Afrique, renseignez un numéro valide avec l\'indicatif pays (ex. +237 6XX XXX XXX pour le Cameroun, +225 XX XX XX XX pour la Côte d\'Ivoire).'
      );
      return;
    }

    const sel = sessionRadio.value;
    const summarySession = document.getElementById('summary-session');
    const summaryPrice = document.getElementById('summary-price');
    const summaryName = document.getElementById('summary-name');
    const summaryEmail = document.getElementById('summary-email');
    const summaryDate = document.getElementById('summary-date');
    const payAmount = document.getElementById('pay-amount');

    if (
      !summarySession ||
      !summaryPrice ||
      !summaryName ||
      !summaryEmail ||
      !summaryDate ||
      !payAmount
    ) {
      return;
    }

    summarySession.textContent = sessionLabels[sel] ?? sel;
    summaryPrice.textContent = `${pricesEur[sel] ?? 0} €`;
    summaryName.textContent = name;
    summaryEmail.textContent = email;
    summaryDate.textContent = dateInput?.value || 'À convenir';
    payAmount.textContent = `${pricesEur[sel] ?? 0} €`;
    updatePaymentOptionsForZone(zone, sel);
    showStep(3);
  });

  backStep2Btn.addEventListener('click', () => showStep(2));

  document.querySelectorAll<HTMLInputElement>('input[name="payment"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (!virementInfo) return;
      virementInfo.classList.toggle('hidden', radio.value !== 'virement' || !radio.checked);
    });
  });

  payBtn.addEventListener('click', async () => {
    const consent = getInput('bk-consent');
    if (!consent?.checked) {
      alert('Veuillez accepter les conditions.');
      return;
    }

    const sessionRadio = getCheckedRadio('session');
    const zoneRadio = getCheckedRadio('zone');
    const paymentRadio = getCheckedRadio('payment');
    const nameInput = getInput('bk-name');
    const emailInput = getInput('bk-email');
    const phoneInput = getInput('bk-phone');
    const companyInput = getInput('bk-company');
    const dateInput = getInput('bk-date');
    const messageInput = document.getElementById('bk-message');
    const messageVal =
      messageInput instanceof HTMLTextAreaElement ? messageInput.value : '';

    if (!sessionRadio || (!stripeEurOnly && !zoneRadio) || !nameInput || !emailInput || !phoneInput) {
      alert('Informations incomplètes.');
      return;
    }

    const zone = stripeEurOnly ? 'euro' : zoneRadio.value;
    const paymentMethod = paymentRadio?.value ?? 'card';
    const isVirement = !stripeEurOnly && paymentMethod === 'virement';

    if (!stripeEurOnly && zone === 'afrique' && !isValidPhoneWithCountryCode(phoneInput.value.trim())) {
      alert(
        'Renseignez un numéro valide avec l\'indicatif pays avant de payer (ex. +237 6XX XXX XXX).'
      );
      return;
    }
    const endpoint = isVirement ? '/api/reservation/virement' : '/api/stripe/checkout';

    const originalText = payBtn.innerHTML;
    payBtn.disabled = true;
    payBtn.innerHTML = isVirement ? 'Enregistrement…' : 'Redirection vers le paiement…';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionRadio.value,
          zone: stripeEurOnly ? 'euro' : zone,
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          phone: phoneInput.value.trim(),
          company: companyInput?.value.trim() ?? '',
          date: dateInput?.value ?? '',
          message: messageVal.trim(),
        }),
      });
      let data: { url?: string; redirectUrl?: string; error?: string; detail?: string } = {};
      try {
        data = await res.json();
      } catch {
        alert('Réponse serveur invalide. Vérifiez votre connexion ou réessayez.');
        payBtn.disabled = false;
        payBtn.innerHTML = originalText;
        return;
      }
      if (!res.ok) {
        const detail =
          data && typeof data === 'object' && 'detail' in data && typeof data.detail === 'string'
            ? data.detail
            : '';
        alert(
          detail
            ? `${data.error || 'Erreur lors de la création du paiement.'}\n\nDétail : ${detail}`
            : data.error || 'Erreur lors de la création du paiement.'
        );
        payBtn.disabled = false;
        payBtn.innerHTML = originalText;
        return;
      }
      const target = isVirement ? data.redirectUrl : data.url;
      if (!target) {
        alert(data.error || 'Erreur lors de la création du paiement.');
        payBtn.disabled = false;
        payBtn.innerHTML = originalText;
        return;
      }
      window.location.href = target;
    } catch (err) {
      console.error('[reserver] paiement échoué :', err);
      alert('Connexion impossible au serveur de paiement. Vérifiez votre réseau et réessayez.');
      payBtn.disabled = false;
      payBtn.innerHTML = originalText;
    }
  });
}

function injectDevTestOption(item: SessionCatalogItem, hideCfa: boolean): void {
  const container = document.querySelector('#step1 .space-y-4');
  if (!container || container.querySelector('[data-session-id="test1e"]')) return;

  const label = document.createElement('label');
  label.className =
    'session-option flex items-center justify-between bg-amber-50/50 rounded-xl px-5 py-4 cursor-pointer border-2 border-amber-300 hover:border-gold/30 transition-all';
  label.dataset.sessionId = 'test1e';
  label.innerHTML = `
    <div class="flex items-center gap-4">
      <input type="radio" name="session" value="test1e" class="w-5 h-5 accent-[#d4a762]" />
      <div>
        <p class="font-semibold text-navy">${item.title}</p>
        <p class="text-gray-400 text-sm">${item.duration} — remboursable après test</p>
      </div>
    </div>
    <div class="text-right">
      <p class="font-heading font-bold text-navy">${item.priceEur} €</p>
      ${hideCfa ? '' : `<p class="text-gray-400 text-xs">${item.priceCfa} FCFA</p>`}
    </div>
  `;
  container.prepend(label);
}

// Fallback si le script est importé sans catalogue (tests unitaires, etc.)
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('step1')) return;
});
