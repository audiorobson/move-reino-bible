# Fontes tipográficas — grego e hebraico

## Online (padrão do app)

O desktop carrega via Google Fonts:

- **Grego:** Gentium Plus, Noto Serif
- **Hebraico:** Noto Sans Hebrew, Frank Ruhl Libre

## Offline (opcional)

Coloque arquivos `.woff2` aqui para bundle Electron sem internet:

```
data/fonts/
├── GentiumPlus-Regular.woff2
├── NotoSansHebrew-Regular.woff2
└── README.md
```

Depois registre em `apps/desktop/renderer/src/styles/original-scripts.css`.

## Classes CSS

| Classe | Uso |
|--------|-----|
| `.greek` / `.greek-text` | Texto grego |
| `.hebrew` / `.hebrew-text` | Texto hebraico (RTL) |
| `.aramaic` | Aramaico |

Tokens: `--font-greek`, `--font-hebrew` em `packages/ui-kit/src/styles/tokens.css`
