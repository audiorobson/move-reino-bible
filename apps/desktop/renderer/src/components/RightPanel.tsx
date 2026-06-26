import type { AppModule } from "@mrb/shared-types";
import { Button, Badge, Card } from "@mrb/ui-kit";
import { useAppStore } from "../store/appStore";

export function RightPanel() {
  const { selectedVerse, currentBook, currentChapter, activeModule, setActiveModule } = useAppStore();

  if (activeModule === "ai") return null;

  return (
    <aside className="right-panel">
      {selectedVerse ? (
        <VerseActions verse={selectedVerse} book={currentBook} chapter={currentChapter} onAskAi={() => setActiveModule("ai")} />
      ) : (
        <PanelPlaceholder module={activeModule} />
      )}
    </aside>
  );
}

function VerseActions({ verse, book, chapter, onAskAi }: { verse: number; book: string; chapter: number; onAskAi: () => void }) {
  return (
    <div>
      <h3 style={{ margin: "0 0 16px", color: "var(--mrb-accent)" }}>
        {book} {chapter}:{verse}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Button onClick={() => navigator.clipboard.writeText(`${book} ${chapter}:${verse}`)}>Copiar referência</Button>
        <Button>Destacar</Button>
        <Button>Adicionar nota</Button>
        <Button>Enviar para estudo</Button>
        <Button variant="ai" onClick={onAskAi}>Perguntar à IA</Button>
        <Button>Ver original</Button>
        <Button>Ver Strong</Button>
      </div>
    </div>
  );
}

function PanelPlaceholder({ module }: { module: AppModule }) {
  const labels: Partial<Record<AppModule, { title: string; desc: string }>> = {
    bible: { title: "Painel de Estudo", desc: "Selecione um versículo para ver ações" },
    search: { title: "Filtros", desc: "Testamento, livro, versão e Strong" },
    originals: { title: "Léxico", desc: "Clique em uma palavra grega/hebraica" },
    "theology-rag": { title: "Fontes RAG", desc: "Fontes recuperadas aparecerão aqui" },
  };

  const info = labels[module] ?? { title: "Painel", desc: "Contexto do módulo ativo" };

  return (
    <Card>
      <Badge variant="gold">{info.title}</Badge>
      <p style={{ marginTop: 12, fontSize: 14, color: "var(--mrb-text-muted)" }}>{info.desc}</p>
    </Card>
  );
}
