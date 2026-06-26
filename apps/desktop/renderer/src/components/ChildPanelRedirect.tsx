import { ExternalLink } from "lucide-react";
import { Button, Card } from "@mrb/ui-kit";

interface ChildPanelRedirectProps {
  title: string;
  description: string;
  onOpen: () => void;
}

export function ChildPanelRedirect({ title, description, onOpen }: ChildPanelRedirectProps) {
  return (
    <Card className="child-panel-redirect">
      <h3>{title}</h3>
      <p>{description}</p>
      <Button variant="primary" onClick={onOpen}>
        <ExternalLink size={16} />
        Abrir janela
      </Button>
    </Card>
  );
}
