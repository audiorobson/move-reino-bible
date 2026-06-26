import type { ChainNode, PrismaClient } from "@prisma/client";
import type {
  ChainDetailDto,
  ChainNodeDto,
  ChainSearchResult,
  ChainStatsDto,
  ChainTopicDto,
  ChainTopicVerseDto,
  CreateUserChainInput,
  TopicDetailDto,
} from "./types.js";
import { normalizeTopicTitle } from "./reference-parser.js";

function mapTopic(
  t: {
    id: string;
    title: string;
    normalizedTitle: string;
    parentId: string | null;
    description: string | null;
    sourceKey: string;
    externalId: string | null;
    _count?: { verses: number; children: number };
  }
): ChainTopicDto {
  return {
    id: t.id,
    title: t.title,
    normalizedTitle: t.normalizedTitle,
    parentId: t.parentId,
    description: t.description,
    sourceKey: t.sourceKey,
    externalId: t.externalId,
    verseCount: t._count?.verses ?? 0,
    childCount: t._count?.children ?? 0,
  };
}

async function attachVerseText<T extends {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number | null;
  osisRef: string;
}>(
  prisma: PrismaClient,
  verses: T[],
  versionAbbr = "BLIVRE"
): Promise<Array<T & { text?: string; bookNamePt?: string; reference?: string }>> {
  const books = await prisma.bibleBook.findMany();
  const bookMap = new Map(books.map((b) => [b.osisId, b]));

  const version = await prisma.bibleVersion.findFirst({ where: { abbreviation: versionAbbr } });
  if (!version) return verses;

  const enriched: Array<T & { text?: string; bookNamePt?: string; reference?: string }> = [];
  for (const v of verses) {
    const bookRow = bookMap.get(v.book);
    const dbBookId = bookRow?.id;
    let text: string | undefined;
    if (dbBookId) {
      const row = await prisma.bibleVerse.findFirst({
        where: {
          versionId: version.id,
          bookId: dbBookId,
          chapter: v.chapter,
          verse: v.verseStart,
        },
      });
      text = row?.text;
    }
    enriched.push({
      ...v,
      text,
      bookNamePt: bookRow?.namePt,
      reference: bookRow ? `${bookRow.namePt} ${v.chapter}:${v.verseStart}` : v.osisRef,
    });
  }
  return enriched;
}

export async function searchTopics(
  prisma: PrismaClient,
  query: string,
  options?: { sourceKey?: string; limit?: number }
): Promise<ChainSearchResult> {
  const q = query.trim();
  const limit = options?.limit ?? 40;
  if (!q) return { query: q, topics: [], count: 0 };

  const normalized = normalizeTopicTitle(q);
  const where = {
    ...(options?.sourceKey ? { sourceKey: options.sourceKey } : {}),
    OR: [
      { normalizedTitle: { contains: normalized } },
      { title: { contains: q, mode: "insensitive" as const } },
      { aliases: { some: { normalizedAlias: { contains: normalized } } } },
    ],
  };

  const rows = await prisma.chainTopic.findMany({
    where,
    take: limit,
    orderBy: [{ parentId: "asc" }, { title: "asc" }],
    include: { _count: { select: { verses: true, children: true } } },
  });

  return {
    query: q,
    count: rows.length,
    topics: rows.map(mapTopic),
  };
}

export async function getTopicById(
  prisma: PrismaClient,
  topicId: string
): Promise<TopicDetailDto | null> {
  const topic = await prisma.chainTopic.findUnique({
    where: { id: topicId },
    include: {
      aliases: true,
      verses: { orderBy: { chainOrder: "asc" } },
      children: { include: { _count: { select: { verses: true, children: true } } } },
      chain: { include: { nodes: { orderBy: { orderIndex: "asc" } } } },
    },
  });
  if (!topic) return null;

  const versesEnriched = await attachVerseText(prisma, topic.verses);
  const nodesEnriched = topic.chain
    ? await attachVerseText(prisma, topic.chain.nodes)
    : [];

  let relatedTopics: ChainTopicDto[] = [];
  if (topic.parentId) {
    const siblings = await prisma.chainTopic.findMany({
      where: { parentId: topic.parentId, id: { not: topic.id } },
      take: 8,
      include: { _count: { select: { verses: true, children: true } } },
    });
    relatedTopics = siblings.map(mapTopic);
  } else {
    relatedTopics = topic.children.slice(0, 8).map((c: (typeof topic.children)[number]) =>
      mapTopic({
        id: c.id,
        title: c.title,
        normalizedTitle: c.normalizedTitle,
        parentId: c.parentId,
        description: c.description,
        sourceKey: c.sourceKey,
        externalId: c.externalId,
        _count: c._count,
      })
    );
  }

  const chain: ChainDetailDto | null = topic.chain
    ? {
        id: topic.chain.id,
        title: topic.chain.title,
        description: topic.chain.description,
        sourceKey: topic.chain.sourceKey,
        nodes: nodesEnriched,
      }
    : null;

  return {
    ...mapTopic({ ...topic, _count: { verses: topic.verses.length, children: topic.children.length } }),
    aliases: topic.aliases.map((a: { id: string; alias: string }) => ({ id: a.id, alias: a.alias })),
    children: topic.children.map((c: (typeof topic.children)[number]) =>
      mapTopic({
        id: c.id,
        title: c.title,
        normalizedTitle: c.normalizedTitle,
        parentId: c.parentId,
        description: c.description,
        sourceKey: c.sourceKey,
        externalId: c.externalId,
        _count: c._count,
      })
    ),
    verses: versesEnriched,
    chain,
    relatedTopics,
  };
}

export async function getChainById(
  prisma: PrismaClient,
  chainId: string
): Promise<ChainDetailDto | null> {
  const chain = await prisma.chain.findUnique({
    where: { id: chainId },
    include: { nodes: { orderBy: { orderIndex: "asc" } } },
  });
  if (!chain) return null;
  const nodes = await attachVerseText(prisma, chain.nodes);
  return {
    id: chain.id,
    title: chain.title,
    description: chain.description,
    sourceKey: chain.sourceKey,
    nodes: nodes,
  };
}

export async function getNextChainNode(prisma: PrismaClient, nodeId: string) {
  const node = await prisma.chainNode.findUnique({ where: { id: nodeId } });
  if (!node?.nextNodeId) return null;
  const next = await prisma.chainNode.findUnique({ where: { id: node.nextNodeId } });
  if (!next) return null;
  const [enriched] = await attachVerseText(prisma, [next]);
  return enriched ?? null;
}

export async function getPrevChainNode(prisma: PrismaClient, nodeId: string) {
  const node = await prisma.chainNode.findUnique({ where: { id: nodeId } });
  if (!node?.previousNodeId) return null;
  const prev = await prisma.chainNode.findUnique({ where: { id: node.previousNodeId } });
  if (!prev) return null;
  const [enriched] = await attachVerseText(prisma, [prev]);
  return enriched ?? null;
}

export async function getChainStats(prisma: PrismaClient): Promise<ChainStatsDto> {
  const [totalTopics, totalVerses, totalChains, sources] = await Promise.all([
    prisma.chainTopic.count(),
    prisma.chainTopicVerse.count(),
    prisma.chain.count(),
    prisma.chainSource.findMany({ orderBy: { sourceKey: "asc" } }),
  ]);

  const sourceStats = await Promise.all(
    sources.map(async (s: { sourceKey: string; title: string }) => ({
      sourceKey: s.sourceKey,
      title: s.title,
      topicCount: await prisma.chainTopic.count({ where: { sourceKey: s.sourceKey } }),
      verseCount: await prisma.chainTopicVerse.count({ where: { sourceKey: s.sourceKey } }),
      chainCount: await prisma.chain.count({ where: { sourceKey: s.sourceKey } }),
    }))
  );

  return {
    sources: sourceStats,
    totalTopics,
    totalVerses,
    totalChains,
    indexed: totalTopics > 0,
  };
}

export async function createUserChain(prisma: PrismaClient, input: CreateUserChainInput) {
  await prisma.chainSource.upsert({
    where: { sourceKey: "user" },
    create: {
      sourceKey: "user",
      title: "Cadeias do usuário",
      license: "Uso local",
    },
    update: {},
  });

  const chain = await prisma.chain.create({
    data: {
      title: input.title,
      normalizedTitle: normalizeTopicTitle(input.title),
      description: input.description,
      sourceKey: "user",
      externalId: input.userId,
    },
  });

  let prevNodeId: string | null = null;
  for (let i = 0; i < input.verses.length; i++) {
    const v = input.verses[i]!;
    const osisRef = `${v.bookOsisId}.${v.chapter}.${v.verse}`;
    const created: ChainNode = await prisma.chainNode.create({
      data: {
        chainId: chain.id,
        osisRef,
        book: v.bookOsisId,
        chapter: v.chapter,
        verseStart: v.verse,
        orderIndex: i,
        previousNodeId: prevNodeId,
        sourceKey: "user",
        note: v.reference ?? null,
      },
    });
    if (prevNodeId) {
      await prisma.chainNode.update({
        where: { id: prevNodeId },
        data: { nextNodeId: created.id },
      });
    }
    prevNodeId = created.id;
  }

  return getChainById(prisma, chain.id);
}

export function exportChainMarkdown(chain: ChainDetailDto): string {
  const lines = [`# ${chain.title}`, ""];
  if (chain.description) lines.push(chain.description, "");
  for (const node of chain.nodes) {
    lines.push(
      `## ${node.reference ?? node.osisRef}`,
      "",
      node.text ? `> ${node.text}` : "",
      ""
    );
  }
  lines.push("---", "Move Reino Bible — Cadeias Bíblicas");
  return lines.join("\n");
}
