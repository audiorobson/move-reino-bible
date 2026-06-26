import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "@mrb/ui-kit/styles.css";
import "./styles/app.css";
import "./styles/scrollbars.css";
import "./styles/original-scripts.css";
import "./styles/library.css";

document.documentElement.setAttribute("data-theme", "reino-dark");

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
