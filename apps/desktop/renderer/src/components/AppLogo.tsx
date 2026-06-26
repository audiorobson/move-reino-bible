const LOGO_SRC = "/move-reino-biblia.png";

type AppLogoVariant = "splash" | "sidebar" | "sidebar-collapsed" | "dashboard" | "inline" | "header";

interface AppLogoProps {
  variant?: AppLogoVariant;
  className?: string;
}

export function AppLogo({ variant = "inline", className = "" }: AppLogoProps) {
  return (
    <img
      src={LOGO_SRC}
      alt="Move Reino Bible"
      className={`app-logo app-logo--${variant} ${className}`.trim()}
      draggable={false}
    />
  );
}
