import { BookOpen, Columns2, Search, Sparkles } from "lucide-react";
import { Button, Card, Badge, GoldDivider } from "@mrb/ui-kit";
import { AppLogo } from "../components/AppLogo";
import { useAppStore } from "../store/appStore";

export function Dashboard() {
  const { setActiveModule, setCompareMode, setLocation, currentBook, currentChapter } = useAppStore();

  const shortcuts = [
    {
      icon: BookOpen,
      title: "Continuar leitura",
      desc: `${currentBook} ${currentChapter}`,
      action: () => setActiveModule("bible"),
      variant: "scripture" as const,
    },
    {
      icon: Columns2,
      title: "Comparar versões",
      desc: "Painel lateral — até 4 colunas",
      action: () => {
        setCompareMode(true);
        setActiveModule("parallel");
      },
      variant: "default" as const,
    },
    {
      icon: Search,
      title: "Buscar",
      desc: "Palavra, Strong, tema ou passagem",
      action: () => setActiveModule("search"),
      variant: "default" as const,
    },
    {
      icon: Sparkles,
      title: "Criar estudo com IA",
      desc: "Assistente de estudo bíblico",
      action: () => setActiveModule("ai"),
      variant: "ai" as const,
    },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-hero">
        <AppLogo variant="dashboard" />
        <p className="dashboard-hero__subtitle">
          Estudo bíblico profundo, assistido por IA, com fontes rastreáveis.
        </p>
        <GoldDivider />
      </header>

      <div className="dashboard-grid">
        {shortcuts.map((item) => (
          <Card
            key={item.title}
            className={`mrb-card--action ${item.variant === "scripture" ? "mrb-card--scripture" : ""} ${item.variant === "ai" ? "mrb-card--ai" : ""}`}
            onClick={item.action}
          >
            <item.icon size={22} strokeWidth={1.75} className="dashboard-card__icon" />
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </Card>
        ))}
      </div>

      <div className="dashboard-status">
        <Card>
          <div className="dashboard-status__row">
            <span>Status IA</span>
            <Badge variant="ai">Pronto</Badge>
          </div>
          <div className="dashboard-status__row">
            <span>Biblioteca RAG</span>
            <Badge variant="rag">Indexação pendente</Badge>
          </div>
          <div className="dashboard-status__row">
            <span>Versão ativa</span>
            <Badge variant="gold">BLIVRE</Badge>
          </div>
        </Card>

        <Card className="mrb-card--scripture">
          <h3 className="bible-reference">João 3:16</h3>
          <p className="scripture-quote" style={{ margin: "12px 0 0", padding: 12 }}>
            Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito...
          </p>
          <Button variant="secondary" style={{ marginTop: 16 }} onClick={() => {
            setLocation("John", 3);
            setActiveModule("bible");
          }}>
            Abrir passagem
          </Button>
        </Card>
      </div>
    </div>
  );
}
