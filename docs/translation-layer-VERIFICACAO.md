# Verificação — Camada de Tradução EN / FR / ES → PT-BR

**Referência:** [Move_Reino_Bible_DEV_TRANSLATION_LAYER.md](../Move_Reino_Bible_DEV_TRANSLATION_LAYER.md) (§36–42)  
**Data:** 18/06/2026  
**Status:** Plano verificado — pronto para implementação incremental

---

## Resumo executivo

O plano em `Move_Reino_Bible_DEV_TRANSLATION_LAYER.md` está **alinhado e viável**. O projeto já traduz **inglês → português** em scripts CLI, mas **ainda não tem** a camada unificada do app (`translation-gateway`, UI, API, DeepL, FR/ES).

A expansão para **francês** e **espanhol** deve usar os mesmos tipos (`SupportedSourceLanguage`) já previstos no documento, com DeepL/Google na UI e generalização do pacote `@mrb/md-translator` nos pipelines.

---

## Inventário atual

### Já funciona (EN → PT, CLI)

| Artefato | Caminho |
|----------|---------|
| Pacote tradutor | `packages/md-translator` |
| Suma Teológica | `scripts/translate-theology-md.ts` |
| Strong KJV | `scripts/translate-strongs-kjv.ts` |
| Cache Strong | `data/strong/index/translation-cache-en-pt.json` |
| Cache Suma | `data/rag/index/translation-cache-summa-en-pt.json` |
| Biblioteca PT | `data/library/manifest.json` → `translatedFile` |

### Ainda não existe (previsto no DEV spec)

- `packages/translation-gateway`
- Rotas `POST /api/translation/translate`
- UI: Configurações > Tradução, Traduzir parágrafo, lado a lado
- DeepL com chave do usuário
- Glossários FR/ES → PT-BR
- Suporte CLI explícito a `--source fr` e `--source es`

### Independente (não confundir)

- **Interlinear PT** (`packages/shared-types/src/gloss-pt.ts`) — glosses STEP, não tradução de livros.

---

## Arquitetura alvo

```mermaid
flowchart TB
  subgraph UI["Desktop / Biblioteca / RAG"]
    TB[Traduzir parágrafo]
    BV[Lado a lado EN|FR|ES / PT-BR]
  end

  subgraph GW["packages/translation-gateway"]
    TS[TranslationService]
    CACHE[(translation_cache)]
    GLOSS[Glossários en|fr|es → ptbr]
    DEEPL[DeepL Provider]
    STUBS[Google / Azure / AWS / LLM stubs]
    MD[Adapter md-translator]
  end

  subgraph CLI["Scripts em lote"]
    THEO[translate-theology]
    STR[translate-strongs-kjv]
  end

  TB --> TS
  BV --> TS
  TS --> DEEPL
  TS --> MD
  TS --> CACHE
  TS --> GLOSS
  THEO --> MD
  STR --> MD
```

---

## Idiomas fonte

| Código | Uso no Move Reino | Provider API | CLI local |
|--------|-------------------|--------------|-----------|
| `en` | Suma, Strong, CCEL, RAG | DeepL, Google… | `md-translator` hoje |
| `fr` | Fontes clássicas futuras | DeepL, Google… | A generalizar |
| `es` | STEP espanhol, teologia ES | DeepL, Google… | A generalizar |
| `pt-BR` | Destino fixo | — | — |

---

## Fases de implementação

1. **Fase 0** — Generalizar `md-translator` + cache unificado `data/translation/cache/`
2. **Fase 1** — Criar `translation-gateway` + DeepL (EN/FR/ES → PT-BR)
3. **Fase 2** — UI no Library Reader e RAG
4. **Fase 3** — Glossários teológicos por idioma
5. **Fase 4** — Argos local (só EN) e demais providers

---

## O que não fazer (conforme spec)

- Traduzir Bíblia licenciada em massa
- Reindexar RAG automaticamente com traduções
- Embutir API keys da Move Reino
- Substituir ou refatorar STEP / Bible Reader / interlinear

---

## Próximo passo

Iniciar **Fase 0 + Sprint 1** do spec: generalizar `@mrb/md-translator` e criar o esqueleto `packages/translation-gateway` com DeepL funcional para os três idiomas fonte.
