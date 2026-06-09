type SessionId = 'diagnostic' | 'coaching' | 'pack3' | 'premium';

const NOTCHPAY_MAX_XAF = 500_000;

const sessionLabels: Record<SessionId, string> = {
  diagnostic: 'Diagnostic Stratégique',
  coaching: 'Coaching Stratégique',
  pack3: 'Pack 3 séances',
  premium: 'Accompagnement Premium',
};

const pricesEur: Record<SessionId, number> = {
  diagnostic: 490,
  coaching: 250,
  pack3: 650,
  premium: 2400,
};

const pricesXaf: Record<SessionId, number> = {
  diagnostic: 320_000,
  coaching: 150_000,
  pack3: 420_000,
  premium: 1_500_000,
};

const pricesCfa: Record<SessionId, string> = {
  diagnostic: '320 000',
  coaching: '150 000',
  pack3: '420 000',
  premium: '1 500 000',
};

function needsInstallments(sessionId: SessionId): boolean {
  return pricesXaf[sessionId] > NOTCHPAY_MAX_XAF;
}

function formatCfaPrice(sessionId: SessionId): string {
  return `${pricesCfa[sessionId]} FCFA`;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-().]/g, '');
}

/** Numéro Mobile Money : indicatif pays obligatoire (ex. +237 6XX XXX XXX). */
function isValidAfricanPhone(phone: string): boolean {
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

export function initReserverBooking(): void {
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

  const notchpayLimitInfo = document.getElementById('notchpay-limit-info');

  function updatePaymentOptionsForZone(zone: string, sessionId?: SessionId): void {
    const useInstallments = zone === 'afrique' && sessionId && needsInstallments(sessionId);

    document.querySelectorAll<HTMLElement>('[data-payment-zone]').forEach((el) => {
      const allowed = el.dataset.paymentZone;
      const visible = allowed === 'all' || allowed === zone;
      el.classList.toggle('hidden', !visible);
      if (!visible) {
        const radio = el.querySelector<HTMLInputElement>('input[type="radio"]');
        if (radio) radio.checked = false;
      }
    });

    if (notchpayLimitInfo) {
      notchpayLimitInfo.classList.toggle('hidden', !useInstallments);
    }

    if (payBtn instanceof HTMLButtonElement) {
      payBtn.disabled = false;
      payBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    const defaultPayment =
      zone === 'afrique'
        ? document.querySelector<HTMLInputElement>('input[name="payment"][value="mobile"]')
        : document.querySelector<HTMLInputElement>('input[name="payment"][value="card"]');
    defaultPayment?.click();
    if (virementInfo) {
      virementInfo.classList.add('hidden');
    }
  }

  document.querySelectorAll<HTMLInputElement>('input[name="zone"]').forEach((radio) => {
    radio.addEventListener('change', updatePhoneHint);
  });
  updatePhoneHint();

  document.querySelectorAll<HTMLInputElement>('input[name="session"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      toStep2Btn.disabled = false;
      toStep2Btn.classList.remove('opacity-50', 'cursor-not-allowed');
      document.querySelectorAll('.session-option').forEach((o) => o.classList.remove('border-gold'));
      radio.closest('.session-option')?.classList.add('border-gold');
    });
  });

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

    if (!nameInput || !emailInput || !phoneInput || !sessionRadio || !zoneRadio) return;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const zone = zoneRadio.value;
    if (!name || !email || !phone) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }
    if (zone === 'afrique' && !isValidAfricanPhone(phone)) {
      alert(
        'Pour la zone Afrique, renseignez un numéro Mobile Money valide avec l\'indicatif pays (ex. +237 6XX XXX XXX pour le Cameroun, +225 XX XX XX XX pour la Côte d\'Ivoire).'
      );
      return;
    }

    const sel = sessionRadio.value as SessionId;
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
    summaryPrice.textContent =
      zone === 'euro' ? `${pricesEur[sel]} €` : formatCfaPrice(sel);
    summaryName.textContent = name;
    summaryEmail.textContent = email;
    summaryDate.textContent = dateInput?.value || 'À convenir';
    payAmount.textContent =
      zone === 'euro' ? `${pricesEur[sel]} €` : formatCfaPrice(sel);
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

    if (!sessionRadio || !zoneRadio || !nameInput || !emailInput || !phoneInput) {
      alert('Informations incomplètes.');
      return;
    }

    const zone = zoneRadio.value;
    const paymentMethod =
      zone === 'afrique' ? 'mobile' : (paymentRadio?.value ?? 'card');
    const isMobileMoney = paymentMethod === 'mobile';
    const isVirement = paymentMethod === 'virement';

    if (zone === 'afrique' && !isValidAfricanPhone(phoneInput.value.trim())) {
      alert(
        'Renseignez un numéro Mobile Money africain valide avec l\'indicatif pays avant de payer (ex. +237 6XX XXX XXX).'
      );
      return;
    }
    if (zone === 'afrique' && !isMobileMoney) {
      alert('Pour la zone Afrique, choisissez le paiement Mobile Money.');
      return;
    }
    const endpoint = isMobileMoney
      ? '/api/notchpay/checkout'
      : isVirement
        ? '/api/reservation/virement'
        : '/api/stripe/checkout';

    const originalText = payBtn.innerHTML;
    payBtn.disabled = true;
    payBtn.innerHTML = isVirement ? 'Enregistrement…' : 'Redirection vers le paiement…';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionRadio.value,
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          phone: phoneInput.value.trim(),
          company: companyInput?.value.trim() ?? '',
          date: dateInput?.value ?? '',
          message: messageVal.trim(),
        }),
      });
      let data: { url?: string; redirectUrl?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        alert('Réponse serveur invalide. Vérifiez votre connexion ou réessayez.');
        payBtn.disabled = false;
        payBtn.innerHTML = originalText;
        return;
      }
      if (!res.ok) {
        alert(data.error || 'Erreur lors de la création du paiement.');
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

document.addEventListener('DOMContentLoaded', initReserverBooking);
