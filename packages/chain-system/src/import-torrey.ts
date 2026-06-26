import type { ChainNode, PrismaClient } from "@prisma/client";
import { normalizeTopicTitle, parseChainReference, parseTorreyVerse } from "./reference-parser.js";

const TORREY_URL =
  "https://raw.githubusercontent.com/gitrdm/torrey_bible_app/master/assets/data/torrey_topics_complete.json";

export interface TorreyImportResult {
  sourceKey: string;
  totalTopics: number;
  totalTopicVerses: number;
  totalChains: number;
  totalChainNodes: number;
  errors: string[];
}

interface TorreyFile {
  topics: Array<{
    id: number;
    title: string;
    subtopics?: Array<{
      id: number;
      title: string;
      verses?: Array<{
        book: string;
        chapter: number;
        verse: number;
        end_chapter?: number;
        end_verse?: number;
        reference?: string;
      }>;
    }>;
  }>;
}

async function ensureSource(prisma: PrismaClient) {
  return prisma.chainSource.upsert({
    where: { sourceKey: "torrey" },
    create: {
      sourceKey: "torrey",
      title: "Torrey New Topical Textbook",
      repositoryUrl: "https://github.com/gitrdm/torrey_bible_app",
      license: "MIT (repositório) / obra em domínio público",
      notes: "Torrey New Topical Textbook — estrutura temática com subtópicos e referências.",
    },
    update: {
      importedAt: new Date(),
    },
  });
}

export async function importTorreyFromJson(
  prisma: PrismaClient,
  data: TorreyFile
): Promise<TorreyImportResult> {
  await ensureSource(prisma);
  const errors: string[] = [];
  let totalTopics = 0;
  let totalTopicVerses = 0;
  let totalChains = 0;
  let totalChainNodes = 0;

  for (const topic of data.topics) {
    const parent = await prisma.chainTopic.create({
      data: {
        title: topic.title,
        normalizedTitle: normalizeTopicTitle(topic.title),
        sourceKey: "torrey",
        externalId: String(topic.id),
      },
    });
    totalTopics++;

    for (const sub of topic.subtopics ?? []) {
      const child = await prisma.chainTopic.create({
        data: {
          title: sub.title,
          normalizedTitle: normalizeTopicTitle(sub.title),
          parentId: parent.id,
          sourceKey: "torrey",
          externalId: String(sub.id),
        },
      });
      totalTopics++;

      const parsedVerses = (sub.verses ?? [])
        .map((v) => parseTorreyVerse(v))
        .filter((v): v is NonNullable<typeof v> => Boolean(v));

      if (sub.verses?.length && parsedVerses.length < sub.verses.length) {
        errors.push(`Torrey subtópico ${sub.id}: referências inválidas`);
      }

      for (let i = 0; i < parsedVerses.length; i++) {
        const ref = parsedVerses[i]!;
        await prisma.chainTopicVerse.create({
          data: {
            topicId: child.id,
            osisRef: ref.osisRef,
            book: ref.book,
            chapter: ref.chapter,
            verseStart: ref.verseStart,
            verseEnd: ref.verseEnd ?? null,
            chainOrder: i,
            sourceKey: "torrey",
          },
        });
        totalTopicVerses++;
      }

      if (parsedVerses.length > 0) {
        const chain = await prisma.chain.create({
          data: {
            title: sub.title,
            normalizedTitle: normalizeTopicTitle(sub.title),
            description: topic.title,
            sourceKey: "torrey",
            externalId: `torrey-${topic.id}-${sub.id}`,
          },
        });
        totalChains++;

        let prevNodeId: string | null = null;
        for (let i = 0; i < parsedVerses.length; i++) {
          const ref = parsedVerses[i]!;
          const created: ChainNode = await prisma.chainNode.create({
            data: {
              chainId: chain.id,
              osisRef: ref.osisRef,
              book: ref.book,
              chapter: ref.chapter,
              verseStart: ref.verseStart,
              verseEnd: ref.verseEnd ?? null,
              orderIndex: i,
              previousNodeId: prevNodeId,
              sourceKey: "torrey",
            },
          });
          if (prevNodeId) {
            await prisma.chainNode.update({
              where: { id: prevNodeId },
              data: { nextNodeId: created.id },
            });
          }
          prevNodeId = created.id;
          totalChainNodes++;
        }

        await prisma.chainTopic.update({
          where: { id: child.id },
          data: { chainId: chain.id },
        });
      }
    }
  }

  await prisma.chainImportLog.create({
    data: {
      sourceKey: "torrey",
      status: errors.length ? "completed_with_warnings" : "completed",
      totalTopics,
      totalTopicVerses,
      totalChains,
      totalChainNodes,
      errors: errors.length ? errors.slice(0, 50).join("\n") : null,
    },
  });

  return {
    sourceKey: "torrey",
    totalTopics,
    totalTopicVerses,
    totalChains,
    totalChainNodes,
    errors,
  };
}

export async function fetchTorreyJson(): Promise<TorreyFile> {
  const res = await fetch(TORREY_URL);
  if (!res.ok) throw new Error(`Falha ao baixar Torrey: ${res.status}`);
  return res.json() as Promise<TorreyFile>;
}

export async function importTorrey(prisma: PrismaClient): Promise<TorreyImportResult> {
  const data = await fetchTorreyJson();
  return importTorreyFromJson(prisma, data);
}
