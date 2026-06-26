import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "gold" | "ai" | "ghost";
  children: ReactNode;
}

export function Button({ variant = "default", className = "", children, ...props }: ButtonProps) {
  const variantClass = variant !== "default" ? `mrb-btn--${variant}` : "";
  return (
    <button className={`mrb-btn ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, className = "", style, onClick }: CardProps) {
  return (
    <div className={`mrb-card ${className}`.trim()} style={style} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}>
      {children}
    </div>
  );
}

export function GoldDivider({ style }: { style?: React.CSSProperties }) {
  return <hr className="mrb-gold-divider" style={style} />;
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
}

export function SearchInput({ value, onChange, placeholder = "Buscar...", onSubmit }: SearchInputProps) {
  return (
    <input
      className="mrb-input"
      type="search"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onSubmit?.()}
    />
  );
}

interface BadgeProps {
  variant?: "gold" | "ai" | "rag" | "blue";
  children: ReactNode;
}

export function Badge({ variant = "gold", children }: BadgeProps) {
  return <span className={`mrb-badge mrb-badge--${variant}`}>{children}</span>;
}

interface VerseCardProps {
  verseNumber: number;
  text: string;
  selected?: boolean;
  highlighted?: boolean;
  hasNote?: boolean;
  onClick?: () => void;
  onVerseNumberClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export function VerseCard({ verseNumber, text, selected, highlighted, onClick, onVerseNumberClick }: VerseCardProps) {
  const classes = [
    "mrb-verse",
    selected && "mrb-verse--selected",
    highlighted && "mrb-verse--highlighted",
    onVerseNumberClick && "mrb-verse--has-vocab",
  ].filter(Boolean).join(" ");

  return (
    <p className={classes} onClick={onClick}>
      {onVerseNumberClick ? (
        <button
          type="button"
          className="mrb-verse-number mrb-verse-number--action"
          onClick={(e) => {
            e.stopPropagation();
            onVerseNumberClick(e);
          }}
          title="Palavras originais deste versículo"
        >
          {verseNumber}
        </button>
      ) : (
        <span className="mrb-verse-number">{verseNumber}</span>
      )}
      {text}
    </p>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mrb-empty-state">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}

export function LoadingState({ message = "Carregando..." }: { message?: string }) {
  return <div className="mrb-loading">{message}</div>;
}

export function ErrorState({ message }: { message: string }) {
  return <div className="mrb-error">{message}</div>;
}

interface AiMessageProps {
  text: string;
  model?: string;
  usedRag?: boolean;
  citations?: Array<{ title: string; author?: string; excerpt: string }>;
}

export function AiMessage({ text, model, usedRag, citations }: AiMessageProps) {
  return (
    <Card className="mrb-card--ai">
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {model && <Badge variant="ai">{model}</Badge>}
        {usedRag && <Badge variant="rag">RAG</Badge>}
        {!usedRag && <Badge variant="gold">Sem fontes RAG</Badge>}
      </div>
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{text}</div>
      {citations && citations.length > 0 && (
        <div style={{ marginTop: 16, borderTop: "1px solid var(--mrb-border-subtle)", paddingTop: 12 }}>
          <strong style={{ fontSize: 12, color: "var(--mrb-text-muted)" }}>FONTES</strong>
          {citations.map((c, i) => (
            <div key={i} style={{ marginTop: 8, fontSize: 13, color: "var(--mrb-text-secondary)" }}>
              <strong>{c.title}</strong>{c.author && ` — ${c.author}`}
              <div style={{ fontStyle: "italic", marginTop: 4 }}>{c.excerpt}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

interface RagSourceCardProps {
  title: string;
  author?: string;
  tradition?: string;
  excerpt: string;
  confidence: number;
}

export function RagSourceCard({ title, author, tradition, excerpt, confidence }: RagSourceCardProps) {
  return (
    <Card className="mrb-card--rag">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <strong>{title}</strong>
          {author && <div style={{ fontSize: 13, color: "var(--mrb-text-muted)" }}>{author}</div>}
        </div>
        <Badge variant="rag">{Math.round(confidence * 100)}%</Badge>
      </div>
      {tradition && <Badge variant="gold">{tradition}</Badge>}
      <p style={{ marginTop: 8, fontSize: 14, color: "var(--mrb-text-secondary)" }}>{excerpt}</p>
    </Card>
  );
}

interface TheologyTraditionBadgeProps {
  tradition: string;
  color?: string;
}

export function TheologyTraditionBadge({ tradition, color }: TheologyTraditionBadgeProps) {
  return (
    <span
      className="mrb-badge"
      style={{ background: `${color ?? "#1D4ED8"}22`, color: color ?? "#1D4ED8" }}
    >
      {tradition}
    </span>
  );
}
