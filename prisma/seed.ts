import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BIBLE_BOOKS = [
  // Antigo Testamento
  { osisId: "Gen", namePt: "Gênesis", nameEn: "Genesis", testament: "OT", canonOrder: 1, chapters: 50 },
  { osisId: "Exod", namePt: "Êxodo", nameEn: "Exodus", testament: "OT", canonOrder: 2, chapters: 40 },
  { osisId: "Lev", namePt: "Levítico", nameEn: "Leviticus", testament: "OT", canonOrder: 3, chapters: 27 },
  { osisId: "Num", namePt: "Números", nameEn: "Numbers", testament: "OT", canonOrder: 4, chapters: 36 },
  { osisId: "Deut", namePt: "Deuteronômio", nameEn: "Deuteronomy", testament: "OT", canonOrder: 5, chapters: 34 },
  { osisId: "Josh", namePt: "Josué", nameEn: "Joshua", testament: "OT", canonOrder: 6, chapters: 24 },
  { osisId: "Judg", namePt: "Juízes", nameEn: "Judges", testament: "OT", canonOrder: 7, chapters: 21 },
  { osisId: "Ruth", namePt: "Rute", nameEn: "Ruth", testament: "OT", canonOrder: 8, chapters: 4 },
  { osisId: "1Sam", namePt: "1 Samuel", nameEn: "1 Samuel", testament: "OT", canonOrder: 9, chapters: 31 },
  { osisId: "2Sam", namePt: "2 Samuel", nameEn: "2 Samuel", testament: "OT", canonOrder: 10, chapters: 24 },
  { osisId: "1Kgs", namePt: "1 Reis", nameEn: "1 Kings", testament: "OT", canonOrder: 11, chapters: 22 },
  { osisId: "2Kgs", namePt: "2 Reis", nameEn: "2 Kings", testament: "OT", canonOrder: 12, chapters: 25 },
  { osisId: "1Chr", namePt: "1 Crônicas", nameEn: "1 Chronicles", testament: "OT", canonOrder: 13, chapters: 29 },
  { osisId: "2Chr", namePt: "2 Crônicas", nameEn: "2 Chronicles", testament: "OT", canonOrder: 14, chapters: 36 },
  { osisId: "Ezra", namePt: "Esdras", nameEn: "Ezra", testament: "OT", canonOrder: 15, chapters: 10 },
  { osisId: "Neh", namePt: "Neemias", nameEn: "Nehemiah", testament: "OT", canonOrder: 16, chapters: 13 },
  { osisId: "Esth", namePt: "Ester", nameEn: "Esther", testament: "OT", canonOrder: 17, chapters: 10 },
  { osisId: "Job", namePt: "Jó", nameEn: "Job", testament: "OT", canonOrder: 18, chapters: 42 },
  { osisId: "Ps", namePt: "Salmos", nameEn: "Psalms", testament: "OT", canonOrder: 19, chapters: 150 },
  { osisId: "Prov", namePt: "Provérbios", nameEn: "Proverbs", testament: "OT", canonOrder: 20, chapters: 31 },
  { osisId: "Eccl", namePt: "Eclesiastes", nameEn: "Ecclesiastes", testament: "OT", canonOrder: 21, chapters: 12 },
  { osisId: "Song", namePt: "Cantares", nameEn: "Song of Solomon", testament: "OT", canonOrder: 22, chapters: 8 },
  { osisId: "Isa", namePt: "Isaías", nameEn: "Isaiah", testament: "OT", canonOrder: 23, chapters: 66 },
  { osisId: "Jer", namePt: "Jeremias", nameEn: "Jeremiah", testament: "OT", canonOrder: 24, chapters: 52 },
  { osisId: "Lam", namePt: "Lamentações", nameEn: "Lamentations", testament: "OT", canonOrder: 25, chapters: 5 },
  { osisId: "Ezek", namePt: "Ezequiel", nameEn: "Ezekiel", testament: "OT", canonOrder: 26, chapters: 48 },
  { osisId: "Dan", namePt: "Daniel", nameEn: "Daniel", testament: "OT", canonOrder: 27, chapters: 12 },
  { osisId: "Hos", namePt: "Oséias", nameEn: "Hosea", testament: "OT", canonOrder: 28, chapters: 14 },
  { osisId: "Joel", namePt: "Joel", nameEn: "Joel", testament: "OT", canonOrder: 29, chapters: 3 },
  { osisId: "Amos", namePt: "Amós", nameEn: "Amos", testament: "OT", canonOrder: 30, chapters: 9 },
  { osisId: "Obad", namePt: "Obadias", nameEn: "Obadiah", testament: "OT", canonOrder: 31, chapters: 1 },
  { osisId: "Jonah", namePt: "Jonas", nameEn: "Jonah", testament: "OT", canonOrder: 32, chapters: 4 },
  { osisId: "Mic", namePt: "Miquéias", nameEn: "Micah", testament: "OT", canonOrder: 33, chapters: 7 },
  { osisId: "Nah", namePt: "Naum", nameEn: "Nahum", testament: "OT", canonOrder: 34, chapters: 3 },
  { osisId: "Hab", namePt: "Habacuque", nameEn: "Habakkuk", testament: "OT", canonOrder: 35, chapters: 3 },
  { osisId: "Zeph", namePt: "Sofonias", nameEn: "Zephaniah", testament: "OT", canonOrder: 36, chapters: 3 },
  { osisId: "Hag", namePt: "Ageu", nameEn: "Haggai", testament: "OT", canonOrder: 37, chapters: 2 },
  { osisId: "Zech", namePt: "Zacarias", nameEn: "Zechariah", testament: "OT", canonOrder: 38, chapters: 14 },
  { osisId: "Mal", namePt: "Malaquias", nameEn: "Malachi", testament: "OT", canonOrder: 39, chapters: 4 },
  // Novo Testamento
  { osisId: "Matt", namePt: "Mateus", nameEn: "Matthew", testament: "NT", canonOrder: 40, chapters: 28 },
  { osisId: "Mark", namePt: "Marcos", nameEn: "Mark", testament: "NT", canonOrder: 41, chapters: 16 },
  { osisId: "Luke", namePt: "Lucas", nameEn: "Luke", testament: "NT", canonOrder: 42, chapters: 24 },
  { osisId: "John", namePt: "João", nameEn: "John", testament: "NT", canonOrder: 43, chapters: 21 },
  { osisId: "Acts", namePt: "Atos", nameEn: "Acts", testament: "NT", canonOrder: 44, chapters: 28 },
  { osisId: "Rom", namePt: "Romanos", nameEn: "Romans", testament: "NT", canonOrder: 45, chapters: 16 },
  { osisId: "1Cor", namePt: "1 Coríntios", nameEn: "1 Corinthians", testament: "NT", canonOrder: 46, chapters: 16 },
  { osisId: "2Cor", namePt: "2 Coríntios", nameEn: "2 Corinthians", testament: "NT", canonOrder: 47, chapters: 13 },
  { osisId: "Gal", namePt: "Gálatas", nameEn: "Galatians", testament: "NT", canonOrder: 48, chapters: 6 },
  { osisId: "Eph", namePt: "Efésios", nameEn: "Ephesians", testament: "NT", canonOrder: 49, chapters: 6 },
  { osisId: "Phil", namePt: "Filipenses", nameEn: "Philippians", testament: "NT", canonOrder: 50, chapters: 4 },
  { osisId: "Col", namePt: "Colossenses", nameEn: "Colossians", testament: "NT", canonOrder: 51, chapters: 4 },
  { osisId: "1Thess", namePt: "1 Tessalonicenses", nameEn: "1 Thessalonians", testament: "NT", canonOrder: 52, chapters: 5 },
  { osisId: "2Thess", namePt: "2 Tessalonicenses", nameEn: "2 Thessalonians", testament: "NT", canonOrder: 53, chapters: 3 },
  { osisId: "1Tim", namePt: "1 Timóteo", nameEn: "1 Timothy", testament: "NT", canonOrder: 54, chapters: 6 },
  { osisId: "2Tim", namePt: "2 Timóteo", nameEn: "2 Timothy", testament: "NT", canonOrder: 55, chapters: 4 },
  { osisId: "Titus", namePt: "Tito", nameEn: "Titus", testament: "NT", canonOrder: 56, chapters: 3 },
  { osisId: "Phlm", namePt: "Filemom", nameEn: "Philemon", testament: "NT", canonOrder: 57, chapters: 1 },
  { osisId: "Heb", namePt: "Hebreus", nameEn: "Hebrews", testament: "NT", canonOrder: 58, chapters: 13 },
  { osisId: "Jas", namePt: "Tiago", nameEn: "James", testament: "NT", canonOrder: 59, chapters: 5 },
  { osisId: "1Pet", namePt: "1 Pedro", nameEn: "1 Peter", testament: "NT", canonOrder: 60, chapters: 5 },
  { osisId: "2Pet", namePt: "2 Pedro", nameEn: "2 Peter", testament: "NT", canonOrder: 61, chapters: 3 },
  { osisId: "1John", namePt: "1 João", nameEn: "1 John", testament: "NT", canonOrder: 62, chapters: 5 },
  { osisId: "2John", namePt: "2 João", nameEn: "2 John", testament: "NT", canonOrder: 63, chapters: 1 },
  { osisId: "3John", namePt: "3 João", nameEn: "3 John", testament: "NT", canonOrder: 64, chapters: 1 },
  { osisId: "Jude", namePt: "Judas", nameEn: "Jude", testament: "NT", canonOrder: 65, chapters: 1 },
  { osisId: "Rev", namePt: "Apocalipse", nameEn: "Revelation", testament: "NT", canonOrder: 66, chapters: 22 },
];

const SAMPLE_VERSES_JOHN_1 = [
  { verse: 1, text: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus." },
  { verse: 2, text: "Ele estava no princípio com Deus." },
  { verse: 3, text: "Todas as coisas foram feitas por ele, e sem ele nada do que foi feito se fez." },
  { verse: 4, text: "Nele estava a vida e a vida era a luz dos homens." },
  { verse: 5, text: "E a luz resplandece nas trevas, e as trevas não a compreenderam." },
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  console.log("🌱 Iniciando seed do Move Reino Bible...");

  // Livros bíblicos
  for (const book of BIBLE_BOOKS) {
    const existing = await prisma.bibleBook.findUnique({ where: { osisId: book.osisId } });
    if (!existing) {
      const created = await prisma.bibleBook.create({
        data: {
          osisId: book.osisId,
          namePt: book.namePt,
          nameEn: book.nameEn,
          testament: book.testament,
          canonOrder: book.canonOrder,
        },
      });
      for (let ch = 1; ch <= book.chapters; ch++) {
        await prisma.bibleChapter.create({
          data: { bookId: created.id, number: ch },
        });
      }
    }
  }
  console.log("✅ 66 livros bíblicos criados");

  // Versão de demonstração (domínio público — estrutura apenas)
  const demoVersion = await prisma.bibleVersion.upsert({
    where: { abbreviation: "DEMO" },
    update: {},
    create: {
      name: "Versão Demonstração",
      abbreviation: "DEMO",
      language: "pt-BR",
      copyrightStatus: "public_domain",
      licenseType: "LICENSE_OK_PUBLIC_DOMAIN",
      isPublicDomain: true,
      attributionRequired: false,
      notes: "Versão de demonstração com versículos de exemplo para desenvolvimento.",
    },
  });

  const johnBook = await prisma.bibleBook.findUnique({ where: { osisId: "John" } });
  if (johnBook) {
    for (const v of SAMPLE_VERSES_JOHN_1) {
      await prisma.bibleVerse.upsert({
        where: {
          versionId_bookId_chapter_verse: {
            versionId: demoVersion.id,
            bookId: johnBook.id,
            chapter: 1,
            verse: v.verse,
          },
        },
        update: {},
        create: {
          versionId: demoVersion.id,
          bookId: johnBook.id,
          chapter: 1,
          verse: v.verse,
          text: v.text,
          normalizedText: normalizeText(v.text),
        },
      });
    }
    console.log("✅ Versículos de exemplo (João 1) criados");
  }

  // Usuário demo (id fixo para o Study Builder)
  await prisma.user.upsert({
    where: { email: "demo@move-reino.bible" },
    update: { name: "Usuário Demo" },
    create: {
      id: "demo-user",
      email: "demo@move-reino.bible",
      name: "Usuário Demo",
    },
  });
  console.log("✅ Usuário demo criado");

  // Tradições teológicas (via ContentLicense exemplo)
  await prisma.contentLicense.upsert({
    where: { id: "license-sblgnt" },
    update: {},
    create: {
      id: "license-sblgnt",
      workName: "SBL Greek New Testament",
      author: "Society of Biblical Literature",
      origin: "https://www.sblgnt.com/",
      sourceUrl: "https://www.sblgnt.com/",
      licenseType: "LICENSE_OK_CC_BY",
      commercialAllowed: true,
      redistributionAllowed: true,
      localStorageAllowed: true,
      attributionRequired: true,
      status: "LICENSE_OK_CC_BY",
      notes: "Creative Commons Attribution 4.0 International",
    },
  });
  console.log("✅ Licenças de exemplo criadas");

  console.log("🎉 Seed concluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
