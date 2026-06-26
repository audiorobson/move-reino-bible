export interface ChainTopicDto {
  id: string;
  title: string;
  normalizedTitle: string;
  parentId: string | null;
  description: string | null;
  sourceKey: string;
  externalId: string | null;
  verseCount: number;
  childCount: number;
}

export interface ChainTopicVerseDto {
  id: string;
  topicId: string;
  osisRef: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number | null;
  chainOrder: number;
  sourceKey: string;
  note: string | null;
  text?: string;
  bookNamePt?: string;
}

export interface ChainNodeDto {
  id: string;
  chainId: string;
  osisRef: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number | null;
  orderIndex: number;
  note: string | null;
  previousNodeId: string | null;
  nextNodeId: string | null;
  sourceKey: string;
  text?: string;
  bookNamePt?: string;
  reference?: string;
}

export interface ChainDetailDto {
  id: string;
  title: string;
  description: string | null;
  sourceKey: string;
  nodes: ChainNodeDto[];
}

export interface TopicDetailDto extends ChainTopicDto {
  children: ChainTopicDto[];
  verses: ChainTopicVerseDto[];
  chain: ChainDetailDto | null;
  aliases: Array<{ id: string; alias: string }>;
  relatedTopics: ChainTopicDto[];
}

export interface ChainSearchResult {
  query: string;
  topics: ChainTopicDto[];
  count: number;
}

export interface ChainStatsDto {
  sources: Array<{
    sourceKey: string;
    title: string;
    topicCount: number;
    verseCount: number;
    chainCount: number;
  }>;
  totalTopics: number;
  totalVerses: number;
  totalChains: number;
  indexed: boolean;
}

export interface CreateUserChainInput {
  userId: string;
  title: string;
  description?: string;
  verses: Array<{
    bookOsisId: string;
    chapter: number;
    verse: number;
    text?: string;
    reference?: string;
  }>;
}
