import type { LicenseStatus } from "@mrb/shared-types";

export interface BibleVersionMeta {
  name: string;
  abbreviation: string;
  language: string;
  licenseType: LicenseStatus;
  licenseUrl?: string;
  sourceUrl?: string;
  copyrightStatus?: string;
  isPublicDomain?: boolean;
  isCommercialAllowed?: boolean;
  attributionRequired?: boolean;
  notes?: string;
}

export interface BibleVerseRecord {
  bookOsisId: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface StandardBibleImport {
  version: BibleVersionMeta;
  verses: BibleVerseRecord[];
}

export interface ImportValidationResult {
  versionAbbreviation: string;
  versesImported: number;
  versesSkipped: number;
  errors: string[];
}

export interface PersistBibleResult {
  versionId: string;
  abbreviation: string;
  versesCreated: number;
  versesUpdated: number;
  versesSkipped: number;
}
