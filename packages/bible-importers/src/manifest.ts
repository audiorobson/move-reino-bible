import { readFile } from "fs/promises";
import { join } from "path";
import type { LicenseStatus } from "@mrb/shared-types";
import type { BibleVersionMeta } from "./types.js";
import type { HelloaoSourceConfig } from "./helloao.js";

export interface ManifestHelloaoSource extends HelloaoSourceConfig {
  type: "helloao";
  autoImport: boolean;
  storageTier: "primary" | "copyleft_isolated";
  enabled: boolean;
}

export interface ManifestLocalSource {
  type: "local";
  file: string;
  enabled: boolean;
  description?: string;
  version?: Partial<BibleVersionMeta>;
}

export type ManifestSource = ManifestHelloaoSource | ManifestLocalSource;

export interface BibleManifest {
  version: string;
  description: string;
  helloaoBaseUrl: string;
  localDirectory: string;
  sources: ManifestSource[];
}

export function getDefaultManifestPath(): string {
  return join(process.cwd(), "data/bibles/manifest.json");
}

export function getRepoRoot(): string {
  return process.cwd();
}

export async function loadManifest(path?: string): Promise<BibleManifest> {
  const manifestPath = path ?? getDefaultManifestPath();
  const raw = await readFile(manifestPath, "utf-8");
  return JSON.parse(raw) as BibleManifest;
}

export function getEnabledHelloaoSources(manifest: BibleManifest): ManifestHelloaoSource[] {
  return manifest.sources.filter(
    (s): s is ManifestHelloaoSource => s.type === "helloao" && s.enabled && s.autoImport
  );
}

export function getEnabledLocalSources(manifest: BibleManifest): ManifestLocalSource[] {
  return manifest.sources.filter(
    (s): s is ManifestLocalSource => s.type === "local" && s.enabled
  );
}

export function resolveLocalPath(manifest: BibleManifest, file: string, repoRoot?: string): string {
  const root = repoRoot ?? getRepoRoot();
  return join(root, manifest.localDirectory, file);
}

export type { LicenseStatus };
