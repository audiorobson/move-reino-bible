import { useEffect } from "react";
import { GoldDivider } from "@mrb/ui-kit";
import { AppLogo } from "./AppLogo";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const t = setTimeout(onComplete, 1800);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="mrb-splash">
      <AppLogo variant="splash" />
      <GoldDivider style={{ width: 200, margin: "24px 0" }} />
      <p className="mrb-splash__tagline">
        Estudo bíblico profundo com inteligência e reverência.
      </p>
      <div className="mrb-shimmer" style={{ marginTop: 32 }} />
    </div>
  );
}
