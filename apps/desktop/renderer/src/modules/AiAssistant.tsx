import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, SearchInput, AiMessage, Badge } from "@mrb/ui-kit";
import { api } from "../lib/api";
import { useAppStore } from "../store/appStore";
import { usePanelLayout } from "../lib/panel-context";
import { VerseDropZone } from "../components/VerseDropZone";
import type { VerseContext } from "../lib/verse-context";

const AI_MODES = [
  { id: "simple", label: "Simples" },
  { id: "exegetical", label: "Exegético" },
  { id: "pastoral", label: "Pastoral" },
  { id: "academic", label: "Acadêmico" },
  { id: "devotional", label: "Devocional" },
  { id: "theology_comparison", label: "Comparativo" },
  { id: "sermon_prep", label: "Sermão" },
  { id: "bible_class", label: "Aula Bíblica" },
  { id: "rag_strict", label: "Somente RAG" },
] as const;

type ChatEntry =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; model: string; citations?: Array<{ title: string; author?: string; excerpt: string }> };

type ChatRequest = {
  msg: string;
  mode: string;
  passage?: string;
  priorHistory: ChatEntry[];
};

function toApiHistory(entries: ChatEntry[]): Array<{ role: "user" | "assistant"; content: string }> {
  return entries.map((entry) => ({
    role: entry.role,
    content: entry.text,
  }));
}

export function AiAssistant() {
  const { isSidePanel } = usePanelLayout();
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("simple");
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [keyConfigured, setKeyConfigured] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    selectedVerseContext,
    aiAttachedVerse,
    dispatchVerseToModule,
    clearAiAttachedVerse,
    preferences,
    setActiveModule,
  } = useAppStore();
  const provider = preferences.llmProvider;
  const attached = aiAttachedVerse ?? selectedVerseContext;

  useEffect(() => {
    const check = async () => {
      if (!window.mrb?.getApiKeyStatus) return;
      const status = await window.mrb.getApiKeyStatus(provider);
      setKeyConfigured(status.configured);
    };
    check();
  }, [provider]);

  const passage = attached
    ? `${attached.reference} (${attached.version}) — "${attached.text}"`
    : undefined;

  const mutation = useMutation({
    mutationFn: async ({ msg, mode, passage, priorHistory }: ChatRequest) => {
      if (!window.mrb?.getApiKey) {
        throw new Error("Use o app desktop Electron para conectar uma chave de API.");
      }
      const keyResult = await window.mrb.getApiKey(provider);
      if (!keyResult.configured || !keyResult.key) {
        throw new Error("Configure sua chave de API em Configurações → Chave de API (IA).");
      }
      return api.aiChat(msg, mode, passage, {
        provider,
        apiKey: keyResult.key,
        model: provider === "openai" ? "gpt-4o-mini" : undefined,
        useRag: true,
        localFirst: true,
        allowOnline: mode !== "rag_strict",
        history: toApiHistory(priorHistory),
      });
    },
    onMutate: ({ msg }) => {
      setHistory((h) => [...h, { role: "user", text: msg }]);
    },
    onSuccess: (data) => {
      setHistory((h) => [
        ...h,
        { role: "assistant", text: data.text, model: data.model, citations: data.citations },
      ]);
    },
    onSettled: () => {
      /* foco volta ao fluxo natural após cada resposta */
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history, mutation.isPending]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || mutation.isPending) return;
    setMessage("");
    mutation.reset();
    mutation.mutate({
      msg: trimmed,
      mode,
      passage,
      priorHistory: history,
    });
  };

  const handleClearConversation = () => {
    if (mutation.isPending) return;
    mutation.reset();
    setHistory([]);
    setMessage("");
  };

  const handleVerseDrop = (ctx: VerseContext) => {
    dispatchVerseToModule("ai", ctx);
    setMessage(`Explique o significado de ${ctx.reference}: "${ctx.text}"`);
  };

  const turnCount = history.filter((e) => e.role === "user").length;

  return (
    <div className={`ai-chat ${isSidePanel ? "ai-chat--panel" : ""}`}>
      {!isSidePanel && (
        <div className="bible-header">
          <h2>Assistente de Estudo</h2>
          <div className="ai-chat__badges">
            <Badge variant="blue">{provider.toUpperCase()}</Badge>
            {keyConfigured ? (
              <Badge variant="rag">IA conectada</Badge>
            ) : (
              <Badge variant="gold">Chave pendente</Badge>
            )}
            {turnCount > 0 && <Badge variant="blue">{turnCount} pergunta(s)</Badge>}
            {history.length > 0 && (
              <Button variant="ghost" onClick={handleClearConversation} disabled={mutation.isPending}>
                Nova conversa
              </Button>
            )}
          </div>
        </div>
      )}

      {isSidePanel && (
        <div className="ai-chat__panel-status">
          <Badge variant="blue">{provider.toUpperCase()}</Badge>
          {keyConfigured ? (
            <Badge variant="rag">Conectada</Badge>
          ) : (
            <>
              <Badge variant="gold">Sem chave</Badge>
              <Button variant="secondary" onClick={() => setActiveModule("settings")}>
                Configurar
              </Button>
            </>
          )}
          {turnCount > 0 && <Badge variant="blue">{turnCount} pergunta(s)</Badge>}
          {history.length > 0 && (
            <Button variant="ghost" onClick={handleClearConversation} disabled={mutation.isPending}>
              Nova conversa
            </Button>
          )}
        </div>
      )}

      <div className="ai-chat__context">
        <VerseDropZone
          label="Arraste um versículo para a IA"
          hint="Solte aqui ou use os botões da barra de seleção"
          onDrop={handleVerseDrop}
          compact
        >
          {attached ? (
            <div className="verse-chip verse-chip--compact">
              <span className="verse-chip__ref">{attached.reference}</span>
              <p className="verse-chip__text">"{attached.text}"</p>
              <div className="verse-chip__actions">
                <Button variant="ghost" onClick={clearAiAttachedVerse}>
                  Remover
                </Button>
              </div>
            </div>
          ) : (
            <p className="verse-drop-zone__empty">Nenhum versículo anexado</p>
          )}
        </VerseDropZone>
      </div>

      <div className="ai-chat__mode">
        {isSidePanel ? (
          <select
            className="mrb-input ai-chat__mode-select"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            disabled={mutation.isPending}
            aria-label="Modo de resposta"
          >
            {AI_MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        ) : (
          <div className="ai-chat__mode-tabs">
            {AI_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`nav-item ${mode === m.id ? "nav-item--active" : ""}`}
                style={{ width: "auto", padding: "6px 12px" }}
                onClick={() => setMode(m.id)}
                disabled={mutation.isPending}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ai-messages" role="log" aria-live="polite">
        {history.length === 0 && !mutation.isPending && (
          <p className="ai-messages__empty">
            {keyConfigured
              ? "Faça uma pergunta. Você pode enviar várias em sequência — o contexto da conversa é mantido."
              : "Configure sua chave OpenAI em Configurações."}
          </p>
        )}
        {history.map((entry, i) =>
          entry.role === "user" ? (
            <div key={i} className="ai-message ai-message--user">
              <span className="ai-message__label">Você</span>
              <p>{entry.text}</p>
            </div>
          ) : (
            <AiMessage
              key={i}
              text={entry.text}
              model={entry.model}
              usedRag={(entry.citations?.length ?? 0) > 0}
              citations={entry.citations}
            />
          )
        )}
        {mutation.isPending && (
          <div className="ai-message ai-message--pending">
            <Badge variant="ai">Gerando resposta...</Badge>
          </div>
        )}
        {mutation.isError && (
          <p className="ai-message__error" role="alert">
            {mutation.error instanceof Error ? mutation.error.message : "Erro ao consultar IA"}
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-input-area">
        <SearchInput
          value={message}
          onChange={setMessage}
          placeholder={
            mutation.isPending
              ? "Aguarde a resposta..."
              : keyConfigured
                ? "Pergunte sobre o versículo..."
                : "Configure a chave primeiro..."
          }
          onSubmit={handleSend}
        />
        <Button
          variant="ai"
          onClick={handleSend}
          disabled={mutation.isPending || !keyConfigured || !message.trim()}
        >
          {mutation.isPending ? "Aguarde..." : "Enviar"}
        </Button>
      </div>
    </div>
  );
}
