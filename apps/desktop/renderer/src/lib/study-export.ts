import type { StudyBlockRecord, StudySessionRecord } from "./api";
import { getStudyBlockDef } from "./study-block-themes";
import { blockTypeLabel } from "./study-utils";

function blockSection(block: StudyBlockRecord): { heading: string; body: string; type: string } {
  if (block.type === "bible_text") {
    const ref = String(block.content.reference ?? "");
    const version = block.content.version ? ` (${String(block.content.version)})` : "";
    const text = String(block.content.text ?? "");
    return {
      type: block.type,
      heading: `${ref}${version}`,
      body: text,
    };
  }

  if (block.type === "theological_citation") {
    return {
      type: block.type,
      heading: String(block.content.title ?? ""),
      body: String(block.content.excerpt ?? ""),
    };
  }

  return {
    type: block.type,
    heading: blockTypeLabel(block.type),
    body: String(block.content.text ?? JSON.stringify(block.content)),
  };
}

function blockPrintHtml(block: StudyBlockRecord): string {
  const def = getStudyBlockDef(block.type);
  const { heading, body } = blockSection(block);
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  if (block.type === "bible_text") {
    return `<section class="study-print-block study-print-block--${def.cssClass}" style="--accent:${def.accent};--bg:${def.bg};--border:${def.border}">
      <div class="study-print-block__label">${blockTypeLabel(block.type)}</div>
      <div class="study-print-block__ref">${heading}</div>
      <blockquote class="study-print-block__verse">"${escaped}"</blockquote>
    </section>`;
  }

  return `<section class="study-print-block study-print-block--${def.cssClass}" style="--accent:${def.accent};--bg:${def.bg};--border:${def.border}">
    <div class="study-print-block__label">${blockTypeLabel(block.type)}</div>
    <div class="study-print-block__body">${escaped || "<em>(sem conteúdo)</em>"}</div>
  </section>`;
}

const PRINT_STYLES = `
  body { font-family: Georgia, "Times New Roman", serif; margin: 1.8cm; color: #1a1a1a; line-height: 1.65; background: #fff; }
  h1 { font-size: 1.5rem; color: #003A66; border-bottom: 3px solid #D1A058; padding-bottom: 0.4rem; margin: 0 0 0.5rem; }
  .meta { color: #555; font-size: 0.92rem; margin-bottom: 1.5rem; }
  .study-print-block { margin-bottom: 1rem; padding: 12px 14px; border-left: 4px solid var(--accent); background: var(--bg); border-radius: 0 8px 8px 0; page-break-inside: avoid; }
  .study-print-block__label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--accent); margin-bottom: 6px; }
  .study-print-block__ref { font-weight: 700; font-size: 1rem; margin-bottom: 4px; }
  .study-print-block__verse { margin: 0; font-style: italic; font-size: 1.05rem; color: #222; }
  .study-print-block__body { margin: 0; white-space: pre-wrap; }
  footer { margin-top: 2rem; font-size: 0.78rem; color: #888; border-top: 1px solid #ddd; padding-top: 0.5rem; }
`;

export function exportStudyToPlainText(study: StudySessionRecord): string {
  const lines: string[] = [];
  const rule = "=".repeat(80);
  const sub = "-".repeat(72);

  lines.push(rule);
  lines.push("MOVE REINO BIBLE — ESTUDO BÍBLICO");
  lines.push(rule);
  lines.push(`Título: ${study.title}`);
  if (study.passageRange) lines.push(`Passagem: ${study.passageRange}`);
  if (study.description) lines.push(`Descrição: ${study.description}`);
  lines.push(`Exportado: ${new Date().toLocaleString("pt-BR")}`);
  lines.push(rule);
  lines.push("");

  const sorted = [...study.blocks].sort((a, b) => a.order - b.order);
  for (const block of sorted) {
    const { heading, body } = blockSection(block);
    lines.push(`[${blockTypeLabel(block.type).toUpperCase()}] ${heading}`);
    lines.push(sub);
    lines.push(body);
    lines.push("");
  }

  lines.push(rule);
  lines.push("Gerado por Move Reino Bible");
  lines.push(rule);

  return lines.join("\n");
}

export function exportStudyToPrintHtml(study: StudySessionRecord): string {
  const sorted = [...study.blocks].sort((a, b) => a.order - b.order);
  const blocksHtml = sorted.map(blockPrintHtml).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${study.title}</title>
  <style>${PRINT_STYLES}</style>
</head>
<body>
  <h1>${study.title}</h1>
  <div class="meta">
    ${study.passageRange ? `<div><strong>Passagem:</strong> ${study.passageRange}</div>` : ""}
    <div><strong>Exportado:</strong> ${new Date().toLocaleString("pt-BR")}</div>
  </div>
  ${blocksHtml}
  <footer>Move Reino Bible — Estudo bíblico</footer>
</body>
</html>`;
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function openPrintWindow(html: string) {
  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!win) {
    alert("Permita pop-ups para imprimir o estudo.");
    return null;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  return win;
}

export { openPrintWindow };

export function printStudy(study: StudySessionRecord) {
  return printFormattedStudy(study);
}

export function printFormattedStudy(study: StudySessionRecord) {
  return import("./study-print").then((m) => m.printFormattedStudy(study));
}
