import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  GitBranch,
  BookOpen,
  Download,
  Sparkles,
} from "lucide-react";
import { SearchInput, Button, Badge, Card, LoadingState, EmptyState } from "@mrb/ui-kit";
import { api } from "../lib/api";
import { useAppStore } from "../store/appStore";
import { VerseDropZone } from "../components/VerseDropZone";

const SOURCE_LABELS: Record<string, string> = {
  torrey: "Torrey",
  nave: "Nave",
  user: "Minhas cadeias",
};

const DEMO_USER = "demo-user";

export function ThematicChains() {
  const {
    chainVerses,
    dispatchVerseToModule,
    removeChainVerse,
    clearChainVerses,
    setLocation,
    setActiveModule,
    selectVerse,
  } = useAppStore();

  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const [userChainTitle, setUserChainTitle] = useState("Minha cadeia");

  const { data: stats } = useQuery({
    queryKey: ["chain-stats"],
    queryFn: () => api.getChainStats(),
    staleTime: 60_000,
  });

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["chain-search", submitted, sourceFilter],
    queryFn: () => api.searchChainTopics(submitted, sourceFilter || undefined),
    enabled: submitted.length > 0,
  });

  const { data: topicDetail, isLoading: topicLoading } = useQuery({
    queryKey: ["chain-topic", activeTopicId],
    queryFn: () => api.getChainTopic(activeTopicId!),
    enabled: Boolean(activeTopicId),
  });

  const saveUserChain = useMutation({
    mutationFn: () =>
      api.createUserChain({
        userId: DEMO_USER,
        title: userChainTitle.trim() || "Minha cadeia",
        verses: chainVerses.map((v) => ({
          bookOsisId: v.bookOsisId,
          chapter: v.chapter,
          verse: v.verse,
          text: v.text,
          reference: v.reference,
        })),
      }),
    onSuccess: (chain) => {
      clearChainVerses();
      if (chain) {
        setSubmitted(chain.title);
        setActiveTopicId(null);
      }
    },
  });

  const nodes = topicDetail?.chain?.nodes ?? [];
  const activeNode = nodes[activeNodeIndex];

  const openInBible = (book: string, chapter: number, verse: number, text: string, reference: string) => {
    setLocation(book, chapter);
    selectVerse({
      bookOsisId: book,
      bookName: reference.split(" ")[0] ?? book,
      chapter,
      verse,
      text,
      reference,
      version: "BLIVRE",
    });
    setActiveModule("bible");
  };

  const handleSearch = () => setSubmitted(query.trim());

  const handleExport = async () => {
    if (!topicDetail?.chain) return;
    const { content } = await api.exportChain(topicDetail.chain.id, "markdown");
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topicDetail.chain.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="chains-module">
      <div className="bible-header">
        <h2>Cadeias Bíblicas</h2>
        <p>Estude temas bíblicos por conexões, referências e cadeias de versículos.</p>
        {stats?.indexed && (
          <p className="chains-module__stats">
            {stats.totalTopics.toLocaleString("pt-BR")} tópicos · {stats.totalChains.toLocaleString("pt-BR")} cadeias ·{" "}
            {stats.totalVerses.toLocaleString("pt-BR")} referências
          </p>
        )}
      </div>

      {!stats?.indexed && (
        <Card className="chains-module__hint">
          <p>
            Base temática ainda não importada. Execute: <code>pnpm import:chains --torrey</code>
          </p>
        </Card>
      )}

      <div className="chains-layout">
        <aside className="chains-panel chains-panel--topics">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar tema (ex: amor, fé, oração)..."
            onSubmit={handleSearch}
          />
          <div className="chains-source-filters">
            <button
              type="button"
              className={`chains-source-filter${!sourceFilter ? " chains-source-filter--active" : ""}`}
              onClick={() => setSourceFilter("")}
            >
              Todos
            </button>
            {stats?.sources.map((s) => (
              <button
                key={s.sourceKey}
                type="button"
                className={`chains-source-filter${sourceFilter === s.sourceKey ? " chains-source-filter--active" : ""}`}
                onClick={() => setSourceFilter(s.sourceKey)}
              >
                {SOURCE_LABELS[s.sourceKey] ?? s.sourceKey}
              </button>
            ))}
          </div>

          {searchLoading && <LoadingState message="Buscando temas..." />}
          {submitted && searchData && searchData.count === 0 && (
            <EmptyState title="Nenhum tema" description={`Sem resultados para "${submitted}"`} />
          )}
          <ul className="chains-topic-list">
            {searchData?.topics.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={`chains-topic-item${activeTopicId === t.id ? " chains-topic-item--active" : ""}`}
                  onClick={() => {
                    setActiveTopicId(t.id);
                    setActiveNodeIndex(0);
                  }}
                >
                  <span>{t.title}</span>
                  <Badge variant="blue">{SOURCE_LABELS[t.sourceKey] ?? t.sourceKey}</Badge>
                  {t.verseCount > 0 && <Badge variant="gold">{t.verseCount}</Badge>}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="chains-panel chains-panel--chain">
          {topicLoading && <LoadingState message="Carregando tema..." />}
          {!activeTopicId && !topicLoading && (
            <EmptyState
              title="Selecione um tema"
              description="Busque e escolha um tópico para ver a cadeia de versículos relacionados."
            />
          )}

          {topicDetail && (
            <>
              <header className="chains-chain-header">
                <div>
                  <h3>{topicDetail.title}</h3>
                  {topicDetail.parentId && (
                    <p className="chains-chain-header__meta">
                      Subtema · {SOURCE_LABELS[topicDetail.sourceKey] ?? topicDetail.sourceKey}
                    </p>
                  )}
                </div>
                {topicDetail.chain && (
                  <div className="chains-chain-header__actions">
                    <Button variant="secondary" onClick={() => void handleExport()}>
                      <Download size={14} />
                    </Button>
                    <Button
                      variant="ai"
                      onClick={() => {
                        const first = nodes[0];
                        if (first?.text) {
                          dispatchVerseToModule("ai", {
                            bookOsisId: first.book,
                            bookName: first.bookNamePt ?? first.book,
                            chapter: first.chapter,
                            verse: first.verseStart,
                            text: first.text,
                            reference: first.reference ?? first.osisRef,
                            version: "BLIVRE",
                          });
                        }
                      }}
                    >
                      <Sparkles size={14} /> IA
                    </Button>
                  </div>
                )}
              </header>

              {topicDetail.children.length > 0 && (
                <div className="chains-subtopics">
                  <span className="chains-subtopics__label">Subtemas</span>
                  <div className="chains-subtopics__chips">
                    {topicDetail.children.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="chains-subtopic-chip"
                        onClick={() => {
                          setActiveTopicId(c.id);
                          setActiveNodeIndex(0);
                        }}
                      >
                        {c.title}
                        {c.verseCount > 0 && <Badge variant="gold">{c.verseCount}</Badge>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {nodes.length > 0 && activeNode && (
                <Card className="chains-verse-card chains-verse-card--active">
                  <div className="chains-verse-card__nav">
                    <Button
                      variant="ghost"
                      disabled={activeNodeIndex <= 0}
                      onClick={() => setActiveNodeIndex((i) => Math.max(0, i - 1))}
                    >
                      <ChevronLeft size={18} /> Anterior
                    </Button>
                    <span>
                      {activeNodeIndex + 1} / {nodes.length}
                    </span>
                    <Button
                      variant="ghost"
                      disabled={activeNodeIndex >= nodes.length - 1}
                      onClick={() => setActiveNodeIndex((i) => Math.min(nodes.length - 1, i + 1))}
                    >
                      Próximo <ChevronRight size={18} />
                    </Button>
                  </div>
                  <Badge variant="gold">{activeNode.reference ?? activeNode.osisRef}</Badge>
                  <blockquote className="chains-verse-card__text">
                    "{activeNode.text ?? "Texto não disponível na versão BLIVRE"}"
                  </blockquote>
                  <Button
                    variant="gold"
                    onClick={() =>
                      openInBible(
                        activeNode.book,
                        activeNode.chapter,
                        activeNode.verseStart,
                        activeNode.text ?? "",
                        activeNode.reference ?? activeNode.osisRef
                      )
                    }
                  >
                    <BookOpen size={14} /> Abrir no Leitor
                  </Button>
                </Card>
              )}

              {nodes.length > 0 && (
                <ol className="chains-node-list">
                  {nodes.map((node, i) => (
                    <li key={node.id}>
                      <button
                        type="button"
                        className={`chains-node-item${i === activeNodeIndex ? " chains-node-item--active" : ""}`}
                        onClick={() => setActiveNodeIndex(i)}
                      >
                        <GitBranch size={14} />
                        <span>{node.reference ?? node.osisRef}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              )}

              {!topicDetail.chain && topicDetail.verses.length > 0 && (
                <ul className="chains-verse-list">
                  {topicDetail.verses.map((v) => (
                    <li key={v.id}>
                      <button
                        type="button"
                        className="chains-verse-list__item"
                        onClick={() =>
                          openInBible(
                            v.book,
                            v.chapter,
                            v.verseStart,
                            v.text ?? "",
                            v.bookNamePt ? `${v.bookNamePt} ${v.chapter}:${v.verseStart}` : v.osisRef
                          )
                        }
                      >
                        <strong>{v.bookNamePt ?? v.book} {v.chapter}:{v.verseStart}</strong>
                        <span>{v.text}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>

        <aside className="chains-panel chains-panel--user">
          <h3 className="study-section-title">Minha cadeia</h3>
          <VerseDropZone
            label="Arraste versículos"
            hint="Monte sua cadeia personalizada"
            onDrop={(ctx) => dispatchVerseToModule("chains", ctx)}
            compact
          />
          <input
            className="mrb-input"
            value={userChainTitle}
            onChange={(e) => setUserChainTitle(e.target.value)}
            placeholder="Título da cadeia"
          />
          {chainVerses.length === 0 ? (
            <p className="chains-user-empty">Selecione versículos na Bíblia e arraste aqui.</p>
          ) : (
            <ul className="chains-user-list">
              {chainVerses.map((v, i) => (
                <li key={`${v.reference}-${i}`}>
                  <Badge variant="gold">{v.reference}</Badge>
                  <span className="chains-user-list__text">"{v.text.slice(0, 80)}..."</span>
                  <button type="button" className="chains-user-list__remove" onClick={() => removeChainVerse(i)}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Button
            variant="gold"
            disabled={chainVerses.length === 0 || saveUserChain.isPending}
            onClick={() => saveUserChain.mutate()}
          >
            Salvar cadeia
          </Button>
        </aside>
      </div>
    </div>
  );
}
