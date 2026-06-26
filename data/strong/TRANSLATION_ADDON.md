# Add-on de tradução EN → PT (`@mrb/md-translator`)

Pacote para traduzir textos Markdown do inglês para o português, usado no pipeline Strong's KJV.

## Uso

```bash
# Traduzir ambos os arquivos KJV Strong's
pnpm translate:strongs-kjv --all

# Traduzir um arquivo específico
pnpm translate:strongs-kjv --file data/strong/KJV-Strongs-Greek-Concordance.md

# Importar ao banco (após tradução)
pnpm import:strongs --all
```

## API

```typescript
import { translateEnToPt, translateEnToPtBatch, translateMarkdownEnToPt } from "@mrb/md-translator";

const pt = await translateEnToPt("father, in a literal sense");
const batch = await translateEnToPtBatch(["word one", "word two"], { batchSize: 20 });
```

## Cache

Traduções ficam em `data/strong/index/translation-cache-en-pt.json` para evitar retrabalho.

## Fontes KJV

| Original | Traduzido |
|----------|-----------|
| `KJV-Strongs-Hebrew-Concordance (1).md` | `sources/kjv-strongs-hebrew-pt.md` |
| `KJV-Strongs-Greek-Concordance.md` | `sources/kjv-strongs-greek-pt.md` |
