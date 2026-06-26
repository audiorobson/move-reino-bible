import { useAppStore } from "../store/appStore";

interface StrongNumberLinkProps {
  number: string;
  className?: string;
}

export function StrongNumberLink({ number, className }: StrongNumberLinkProps) {
  const openStrongLookup = useAppStore((s) => s.openStrongLookup);

  return (
    <button
      type="button"
      className={`strong-number-link ${className ?? ""}`}
      onClick={(e) => {
        e.stopPropagation();
        openStrongLookup(number);
      }}
      title={`Abrir Strong ${number} no painel`}
    >
      ({number})
    </button>
  );
}
