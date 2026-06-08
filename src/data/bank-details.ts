/** Coordonnées bancaires JCBO Conseil (Qonto) — virements clients */
export const bankDetails = {
  holder: "Jean-Christophe BOYANG-TSANG",
  address: "25, Chemin du Séminaire – Appt 86 – 31200 Toulouse",
  bankCode: "16958",
  branchCode: "00001",
  accountNumber: "07974715369",
  key: "90",
  iban: "FR76 1695 8000 0107 9747 1536 990",
  bic: "QNTOFRP1XXX",
  bankName: "Qonto (Olinda SAS)",
  bankAddress: "20 bis rue La Fayette, 75009 Paris, France",
  swiftNote: "La banque émettrice pourrait demander le BIC de la banque partenaire : BNPAFRPP",
} as const;

export function formatIbanDisplay(iban: string): string {
  return iban.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
}
