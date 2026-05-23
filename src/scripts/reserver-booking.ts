type SessionId = 'diagnostic' | 'coaching' | 'pack3' | 'premium';

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
    if (!name || !email || !phone) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }

    const sel = sessionRadio.value as SessionId;
    const zone = zoneRadio.value;
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
    summaryPrice.textContent = zone === 'euro' ? `${pricesEur[sel]} €` : '—  FCFA';
    summaryName.textContent = name;
    summaryEmail.textContent = email;
    summaryDate.textContent = dateInput?.value || 'À convenir';
    payAmount.textContent = zone === 'euro' ? `${pricesEur[sel]} €` : '';
    showStep(3);
  });

  backStep2Btn.addEventListener('click', () => showStep(2));

  payBtn.addEventListener('click', () => {
    const consent = getInput('bk-consent');
    if (!consent?.checked) {
      alert('Veuillez accepter les conditions.');
      return;
    }
    alert('Redirection vers le paiement sécurisé... (Intégration Stripe à connecter)');
  });
}

document.addEventListener('DOMContentLoaded', initReserverBooking);
