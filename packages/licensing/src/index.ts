import type { LicenseStatus } from "@mrb/shared-types";

export interface LicenseRecord {
  workName: string;
  author?: string;
  origin: string;
  sourceUrl?: string;
  licenseType: LicenseStatus;
  commercialAllowed: boolean;
  redistributionAllowed: boolean;
  localStorageAllowed: boolean;
  attributionRequired: boolean;
  notes?: string;
}

const APPROVED_STATUSES: LicenseStatus[] = [
  "LICENSE_OK_PUBLIC_DOMAIN",
  "LICENSE_OK_CC_BY",
  "LICENSE_OK_CC_BY_SA",
  "LICENSE_OK_COMMERCIAL_CONTRACT",
];

export function isLicenseApproved(status: LicenseStatus): boolean {
  return APPROVED_STATUSES.includes(status);
}

export function validateLicenseForImport(record: LicenseRecord): {
  approved: boolean;
  status: LicenseStatus;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (!record.workName) reasons.push("Nome da obra obrigatório");
  if (!record.origin) reasons.push("Origem obrigatória");
  if (!record.licenseType) reasons.push("Tipo de licença obrigatório");

  if (record.licenseType === "LICENSE_UNKNOWN") {
    reasons.push("Licença desconhecida — requer verificação editorial");
  }
  if (record.licenseType === "LICENSE_REJECTED") {
    reasons.push("Licença rejeitada — conteúdo não pode ser importado");
  }
  if (!record.localStorageAllowed) {
    reasons.push("Armazenamento local não permitido pela licença");
  }

  const approved = reasons.length === 0 && isLicenseApproved(record.licenseType);

  return { approved, status: record.licenseType, reasons };
}

export const EDITORIAL_WORKFLOW = [
  "cadastro_preliminar",
  "verificacao_licenca",
  "revisao_editorial",
  "importacao_teste",
  "validacao_tecnica",
  "aprovacao",
  "indexacao_textual",
  "geracao_embeddings",
  "publicacao",
] as const;
