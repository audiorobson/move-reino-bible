import { useEffect, useState } from "react";
import type { ThemeId } from "@mrb/shared-types";
import { Button, Card, Badge } from "@mrb/ui-kit";
import { useAppStore } from "../store/appStore";

const THEMES: Array<{ id: ThemeId; label: string }> = [
  { id: "reino-dark", label: "Reino Dark" },
  { id: "scroll-light", label: "Pergaminho Light" },
  { id: "deep-night", label: "Noite Profunda" },
];

const LLM_PROVIDERS = [
  { id: "openai", label: "OpenAI", placeholder: "sk-...", supported: true },
  { id: "anthropic", label: "Anthropic", placeholder: "sk-ant-...", supported: false },
  { id: "gemini", label: "Gemini", placeholder: "AIza...", supported: false },
  { id: "groq", label: "Groq", placeholder: "gsk_...", supported: false },
  { id: "openrouter", label: "OpenRouter", placeholder: "sk-or-...", supported: false },
  { id: "ollama", label: "Ollama (local)", placeholder: "ollama", supported: false },
] as const;

const ATIV_SITE = "https://www.ativpro.com";

async function openAtivSite() {
  if (window.mrb?.openExternal) {
    await window.mrb.openExternal(ATIV_SITE);
    return;
  }
  window.open(ATIV_SITE, "_blank", "noopener,noreferrer");
}

export function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState(false);
  const { preferences, setPreferences } = useAppStore();
  const provider = preferences.llmProvider;

  const providerMeta = LLM_PROVIDERS.find((p) => p.id === provider) ?? LLM_PROVIDERS[0];

  useEffect(() => {
    const loadStatus = async () => {
      if (!window.mrb?.getApiKeyStatus) return;
      const status = await window.mrb.getApiKeyStatus(provider);
      setConfigured(status.configured);
    };
    loadStatus();
  }, [provider]);

  const handleSaveKey = async () => {
    setError(null);
    if (!window.mrb?.storeApiKey) {
      setError("Salvar chave só funciona no app Electron.");
      return;
    }
    if (!apiKey.trim() || apiKey.trim().length < 8) {
      setError("Informe uma chave válida (mínimo 8 caracteres).");
      return;
    }
    if (!providerMeta.supported) {
      setError(`${providerMeta.label} ainda não está disponível. Use OpenAI.`);
      return;
    }

    const result = await window.mrb.storeApiKey(provider, apiKey.trim());
    if (!result.success) {
      setError(result.error ?? "Falha ao salvar a chave.");
      return;
    }

    setConfigured(true);
    setApiKey("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="bible-header">
        <h2>Configurações</h2>
        <p>Preferências, temas, chaves de API e segurança</p>
      </div>

      <div className="settings-section">
        <Card>
          <h3>Chave de API (IA)</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
            A chave fica criptografada no seu computador (Electron safeStorage) e é usada apenas para chamadas locais à API.
          </p>

          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
            Provedor padrão
          </label>
          <select
            className="mrb-input"
            style={{ marginBottom: 12 }}
            value={provider}
            onChange={(e) => {
              setPreferences({ llmProvider: e.target.value });
              setConfigured(false);
              setApiKey("");
            }}
          >
            {LLM_PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}{p.supported ? "" : " (em breve)"}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Status:</span>
            {configured ? (
              <Badge variant="rag">Chave configurada</Badge>
            ) : (
              <Badge variant="gold">Não configurada</Badge>
            )}
          </div>

          {!providerMeta.supported && (
            <p style={{ fontSize: 13, color: "var(--warning)", marginBottom: 12 }}>
              No momento apenas <strong>OpenAI</strong> funciona com chave real no Assistente de Estudo.
            </p>
          )}

          <input
            className="mrb-input"
            type="password"
            placeholder={providerMeta.placeholder}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ marginBottom: 8 }}
            autoComplete="off"
          />
          <Button variant="primary" onClick={handleSaveKey} disabled={!providerMeta.supported}>
            Salvar chave
          </Button>
          {saved && <span style={{ marginLeft: 12, color: "var(--success)" }}>✓ Salva</span>}
          {error && <p style={{ marginTop: 12, fontSize: 13, color: "var(--danger)" }}>{error}</p>}
        </Card>
      </div>

      <div className="settings-section">
        <Card>
          <h3>Tema visual</h3>
          <div className="theme-picker">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={preferences.theme === t.id ? "active" : ""}
                onClick={() => setPreferences({ theme: t.id })}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="settings-section">
        <Card>
          <h3>Leitura bíblica</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Fonte: {preferences.bibleFontSize}px · Linha: {preferences.bibleLineHeight}
          </p>
          <input
            className="mrb-input"
            type="range"
            min={14}
            max={26}
            value={preferences.bibleFontSize}
            onChange={(e) => setPreferences({ bibleFontSize: parseInt(e.target.value, 10) })}
            style={{ marginTop: 12 }}
          />
        </Card>
      </div>

      <div className="settings-section">
        <Card className="settings-ativ-card">
          <h3>Patrocínio</h3>
          <div className="settings-ativ">
            <button
              type="button"
              className="settings-ativ__logo-link"
              onClick={() => void openAtivSite()}
              title="Visitar ATIV Tecnologia"
            >
              <img
                src="/ativ-logo.png"
                alt="ATIV Tecnologia"
                className="settings-ativ__logo"
                draggable={false}
              />
            </button>
            <p className="settings-ativ__message">
              A Move Bible chega até você, patrocinada pela ATIV.
            </p>
            <button type="button" className="settings-ativ__site" onClick={() => void openAtivSite()}>
              www.ativpro.com
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
