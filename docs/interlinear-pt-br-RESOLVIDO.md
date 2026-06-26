# Interlinear EN + PT-BR — Resolvido

**Status:** ✅ Plenamente resolvido  
**Data de conclusão:** 18/06/2026  
**Módulo:** Leitor bíblico · Idiomas originais (STEP)  
**Escopo:** Gloss inglês (STEP) + tradução portuguesa interativa por palavra

---

## Resumo

A exibição interlinear passou a mostrar, para cada token grego/hebraico:

1. **Texto original** (grego/hebraico) — clicável  
2. **Gloss EN** (STEP) — um chip por palavra, clicável  
3. **Gloss PT-BR** — um chip por palavra, clicável, derivado ou enriquecido  
4. **Painel de detalhe** — superfície, transliteração, EN, PT e Strong sincronizados  
5. **Botões EN / PT** — alternam visibilidade das linhas de gloss

Todas as camadas reagem ao mesmo clique: original, inglês ou português destacam a mesma palavra.

---

## Problemas que existiam

| # | Sintoma | Causa raiz |
|---|---------|------------|
| 1 | Linha PT mostrava códigos (`#01`, `#03»04:G3076`) | Parser TAGNT lia coluna errada (`cols[10]` = marcador interno STEP, não tradução) |
| 2 | PT não aparecia no hebraico (TAHOT) | Fonte STEP só traz `glossEn`; `glossPt` vinha vazio no banco |
| 3 | EN/PT não mudavam ao clicar nas palavras | Linhas eram texto fixo do versículo; só o Strong no detalhe atualizava |
| 4 | Só a “primeira palavra” parecia ativa | Modo `compact` ocultava PT (`showPtGloss={!compact}`) e linhas estáticas não sincronizavam seleção |
| 5 | Rótulos EN/PT destacados mas “sem função” | Eram `<span>` decorativos; não havia toggle nem chips interativos |

---

## Solução implementada

### 1. Dados — gloss PT-BR

**Pacote:** `packages/shared-types/src/gloss-pt.ts`

- `isStoredGlossPtValid()` — rejeita metadados STEP importados por engano (`#01`, `»`, refs Strong isoladas).
- `deriveGlossPtFromEn()` — traduz gloss EN para PT-BR (mapa lexical + frases compostas).
- `resolveTokenGlossPt()` — usa `glossPt` do banco se válido; senão deriva do inglês e, na API, do léxico Strong PT.
- `primaryLexiconGloss()` — extrai termo principal do léxico KJV Strong em português.

**API:** `packages/content-importers/src/original-language.ts`

- Enriquece tokens em `getVerseOriginalTokens` / `getChapterOriginalTokens` com `glossPt` via léxico Strong quando ausente.

**Parser grego:** `packages/content-importers/src/tagnt-parser.ts`

- Removida leitura incorreta de `glossPt` na coluna 10 (conjoin `#01`, `#02`…).

### 2. UI — interação palavra a palavra

**Componente principal:** `apps/desktop/renderer/src/components/VerseInterlinearStrip.tsx`

- Linha de tokens originais (grego/hebraico).
- Linha **EN**: um botão (`interlinear-gloss-token`) por token com `tokenGlossEn()`.
- Linha **PT**: um botão por token com `tokenGlossPt()`.
- Seleção única (`activeId`) sincroniza destaque nas três linhas.
- Toggles globais `showInterlinearEn` / `showInterlinearPt` no `appStore`.

**Detalhe do token:** `apps/desktop/renderer/src/components/InterlinearTokenDetail.tsx`

```
πάντας (pantas)
EN  all
PT  todos
(G3956)
```

- PT sempre visível quando disponível (inclusive no modo compacto do leitor).
- `key={activeToken.id}` força atualização ao trocar de palavra.

**Estilos:** `apps/desktop/renderer/src/styles/app.css`

- `.interlinear-gloss-token` / `.interlinear-gloss-token--active`
- `.verse-interlinear__lang-toggles` — botões EN/PT
- `.interlinear-token-detail__gloss-row` — EN e PT no painel

### 3. Estado global

**Store:** `apps/desktop/renderer/src/store/appStore.ts`

```ts
showInterlinearLayer   // liga/desliga faixa interlinear no leitor
showInterlinearEn      // linha EN (default: true)
showInterlinearPt      // linha PT (default: true)
```

---

## Fluxo do usuário (aceite)

1. Abrir **Leitor** → capítulo com dados STEP (badge grego/hebraico).
2. Clicar **Interlinear** na barra de ferramentas.
3. Em cada versículo, ver palavras originais + chips EN + chips PT.
4. Clicar em qualquer palavra (original, EN ou PT):
   - destaque dourado na mesma posição nas três linhas;
   - painel inferior atualiza superfície, transliteração, EN, PT e Strong.
5. Clicar botões **EN** / **PT** no topo da faixa → oculta/mostra a linha correspondente.
6. Clicar **(G3956)** → abre painel Strong.

### Exemplo verificado (2 Coríntios 2:5)

| Token | Grego | EN | PT | Strong |
|-------|-------|----|----|--------|
| … | πάντας | all | todos | G3956 |
| … | Εἰ | If | Se | G1487 |
| … | δέ | however | porém | G1161 |

---

## Arquivos alterados

| Arquivo | Papel |
|---------|--------|
| `packages/shared-types/src/gloss-pt.ts` | Motor PT-BR (novo) |
| `packages/shared-types/src/index.ts` | Export público |
| `packages/content-importers/src/original-language.ts` | Enriquecimento API |
| `packages/content-importers/src/tagnt-parser.ts` | Correção import grego |
| `apps/desktop/renderer/src/lib/original-language.ts` | `tokenGlossPt()` no cliente |
| `apps/desktop/renderer/src/components/VerseInterlinearStrip.tsx` | UI interativa |
| `apps/desktop/renderer/src/components/InterlinearTokenDetail.tsx` | Painel EN/PT/Strong |
| `apps/desktop/renderer/src/components/SelectableVerseCard.tsx` | Integração no leitor |
| `apps/desktop/renderer/src/modules/OriginalLanguages.tsx` | Painel idiomas originais |
| `apps/desktop/renderer/src/store/appStore.ts` | Toggles EN/PT |
| `apps/desktop/renderer/src/styles/app.css` | Estilos interlinear |

---

## Como testar

```powershell
# Terminal 1 — API
pnpm dev:api

# Terminal 2 — Desktop
pnpm dev:desktop

# Verificar gloss na API (exemplo)
Invoke-RestMethod "http://localhost:4000/api/v1/original/chapter/2Cor/2/tokens" |
  Select-Object -ExpandProperty verses |
  Select-Object -ExpandProperty 5 |
  Where-Object { $_.strongNumber -eq 'G3956' } |
  Format-List glossEn, glossPt, strongNumber
# Esperado: glossEn=all  glossPt=todos  strongNumber=G3956
```

No app: `Ctrl+R` após reiniciar servidores. Navegar para **2 Coríntios 2**, ativar **Interlinear**, clicar em `πάντας`.

---

## Critérios de conclusão (checklist)

- [x] PT-BR exibido por palavra, não códigos STEP  
- [x] Hebraico (TAHOT) com PT derivado quando `glossPt` vazio no banco  
- [x] Grego (TAGNT) sem importar coluna `#01` como tradução  
- [x] Clique em original / EN / PT seleciona a mesma palavra  
- [x] Painel de detalhe atualiza EN, PT e Strong juntos  
- [x] Botões EN/PT funcionam como toggle de visibilidade  
- [x] Modo compacto do leitor ainda mostra PT no detalhe  
- [x] Léxico Strong PT usado como fallback na API  
- [x] Documentação de resolução registrada neste arquivo  

---

## Limitações conhecidas (fora do escopo desta entrega)

- Tradução PT é **gloss interlinear** (palavra a palavra), não versículo completo em português literário — a tradução da Bíblia em PT continua na coluna principal do leitor.
- Frases inglesas compostas sem entrada no mapa lexical podem permanecer parcialmente em inglês até expansão do dicionário em `gloss-pt.ts`.
- Reimportação TAGNT não é obrigatória: tokens antigos com `glossPt` inválido são ignorados em runtime por `isStoredGlossPtValid()`.

---

## Referência de produto

Alinhado ao espírito do **STEPBible** (TAGNT / TAHOT, CC BY 4.0), com camada adicional **PT-BR** para o público do Move Reino Bible.
