import { PrismaClient } from "@prisma/client";
import { normalizeText } from "@mrb/bible-core";
import type { PersistBibleResult, StandardBibleImport } from "./types.js";

const BATCH_SIZE = 500;

export async function persistBibleImport(
  prisma: PrismaClient,
  data: StandardBibleImport,
  options?: { replaceExisting?: boolean }
): Promise<PersistBibleResult> {
  const replace = options?.replaceExisting ?? true;

  const books = await prisma.bibleBook.findMany();
  const bookByOsis = new Map(books.map((b) => [b.osisId, b.id]));
  const missingBooks = [...new Set(data.verses.map((v) => v.bookOsisId))].filter(
    (id) => !bookByOsis.has(id)
  );
  if (missingBooks.length > 0) {
    throw new Error(`Livros não encontrados no seed: ${missingBooks.join(", ")}`);
  }

  const version = await prisma.bibleVersion.upsert({
    where: { abbreviation: data.version.abbreviation },
    update: {
      name: data.version.name,
      language: data.version.language,
      copyrightStatus: data.version.copyrightStatus ?? data.version.licenseType,
      licenseType: data.version.licenseType,
      licenseUrl: data.version.licenseUrl,
      sourceUrl: data.version.sourceUrl,
      isPublicDomain: data.version.isPublicDomain ?? false,
      isCommercialAllowed: data.version.isCommercialAllowed ?? true,
      attributionRequired: data.version.attributionRequired ?? false,
      notes: data.version.notes,
    },
    create: {
      name: data.version.name,
      abbreviation: data.version.abbreviation,
      language: data.version.language,
      copyrightStatus: data.version.copyrightStatus ?? data.version.licenseType,
      licenseType: data.version.licenseType,
      licenseUrl: data.version.licenseUrl,
      sourceUrl: data.version.sourceUrl,
      isPublicDomain: data.version.isPublicDomain ?? false,
      isCommercialAllowed: data.version.isCommercialAllowed ?? true,
      attributionRequired: data.version.attributionRequired ?? false,
      notes: data.version.notes,
    },
  });

  if (replace) {
    await prisma.bibleVerse.deleteMany({ where: { versionId: version.id } });
  }

  let versesCreated = 0;
  let versesSkipped = 0;

  const rows = data.verses
    .filter((v) => v.text.trim())
    .map((v) => ({
      versionId: version.id,
      bookId: bookByOsis.get(v.bookOsisId)!,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text.trim(),
      normalizedText: normalizeText(v.text),
    }));

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const result = await prisma.bibleVerse.createMany({
      data: batch,
      skipDuplicates: !replace,
    });
    versesCreated += result.count;
  }

  versesSkipped = data.verses.length - rows.length;

  await prisma.contentLicense.upsert({
    where: { id: `license-${version.abbreviation.toLowerCase()}` },
    update: {
      workName: data.version.name,
      origin: data.version.sourceUrl ?? "import",
      sourceUrl: data.version.sourceUrl,
      licenseType: data.version.licenseType,
      commercialAllowed: data.version.isCommercialAllowed ?? true,
      redistributionAllowed: true,
      localStorageAllowed: true,
      attributionRequired: data.version.attributionRequired ?? false,
      status: data.version.licenseType,
    },
    create: {
      id: `license-${version.abbreviation.toLowerCase()}`,
      workName: data.version.name,
      origin: data.version.sourceUrl ?? "import",
      sourceUrl: data.version.sourceUrl,
      licenseType: data.version.licenseType,
      commercialAllowed: data.version.isCommercialAllowed ?? true,
      redistributionAllowed: true,
      localStorageAllowed: true,
      attributionRequired: data.version.attributionRequired ?? false,
      status: data.version.licenseType,
      notes: data.version.notes,
    },
  });

  return {
    versionId: version.id,
    abbreviation: version.abbreviation,
    versesCreated,
    versesUpdated: 0,
    versesSkipped,
  };
}
