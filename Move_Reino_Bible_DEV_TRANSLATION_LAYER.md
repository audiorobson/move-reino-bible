# Move Reino Bible — Plano DEV do Sistema de Tradução

**Documento:** DEV Translation Layer  
**Projeto:** Move Reino Bible  
**Versão:** 1.0  
**Status:** Plano técnico incremental  
**Objetivo:** Integrar tradução ao projeto atual sem quebrar a estrutura existente, deixando as APIs disponíveis e preparando expansão futura sob demanda.

---

## 1. Objetivo do módulo

Criar um sistema de tradução para o **Move Reino Bible** que permita ao usuário traduzir conteúdos teológicos, comentários, léxicos, sistemáticas e documentos RAG estrangeiros para **português brasileiro**, inicialmente de forma pontual e controlada.

O módulo deve seguir duas linhas:

1. **Tradução por chave API do usuário**
   - DeepL inicialmente.
   - Google Cloud Translation preparado para futura integração.
   - Azure Translator preparado para futura integração.
   - Amazon Translate preparado para futura integração.
   - LLM Translation preparado para futura integração com OpenAI, Claude, Gemini ou modelos locais.
   - Nenhuma chave API deve ser embutida no app.

2. **Tradução local gratuita**
   - Suporte inicial apenas para **Inglês → Português Brasileiro**.
   - Preferencialmente usando Argos Translate como motor local.
   - Rodando como módulo local/sidecar, sem enviar texto para a internet.
   - Deve ser opcional, ativável pelo usuário.

O mais importante nesta fase é **deixar a arquitetura de tradução disponível**, sem tentar traduzir todo o acervo de uma vez.

---

## 2. Diretriz obrigatória para o agente DEV

O agente que executar este plano deve obedecer rigorosamente às regras abaixo.

### 2.1 Não reestruturar o projeto atual

O agente **não deve**:

- alterar a arquitetura global já criada;
- trocar framework;
- mover módulos existentes;
- renomear pastas centrais;
- substituir serviços já prontos;
- refatorar telas que não estejam diretamente ligadas à tradução;
- alterar o motor bíblico;
- alterar o motor STEP;
- alterar RAG, IA ou Bible Reader fora dos pontos de integração definidos.

A integração deve ser **pontual, modular e reversível**.

### 2.2 Trabalhar por pequenos incrementos

O agente deve implementar em etapas:

1. Criar tipos e interfaces.
2. Criar gateway abstrato de tradução.
3. Criar provider DeepL.
4. Criar cache local.
5. Criar configurações de tradução.
6. Criar botão “Traduzir parágrafo”.
7. Criar exibição lado a lado.
8. Só depois preparar módulo local.
9. Só depois adicionar provedores extras.

Nenhuma etapa deve depender da implementação completa de todas as outras.

### 2.3 Não criar custos automáticos para a Move Reino

Como o projeto será gratuito:

- o app não deve consumir API paga com chave da Move Reino;
- toda API comercial deve usar chave cadastrada pelo usuário;
- o app deve mostrar aviso de que custos e limites pertencem ao provedor configurado pelo usuário;
- a Move Reino não deve centralizar chamadas pagas em backend próprio no MVP.

### 2.4 APIs devem ficar disponíveis

Mesmo que alguns provedores não sejam implementados agora, a arquitetura deve deixar os providers preparados:

```txt
deepl
google
azure
aws
llm
argos_local
libretranslate_external
```

O agente deve criar stubs seguros para provedores futuros, retornando erro controlado como:

```txt
Provider ainda não implementado nesta versão.
```

---

## 3. Escopo do MVP

### 3.1 Dentro do escopo inicial

Implementar:

- pacote `translation-gateway`;
- tipos TypeScript comuns de tradução;
- serviço central `TranslationService`;
- provider DeepL funcional;
- provider Argos Local inicialmente como stub ou detector de disponibilidade;
- cache de tradução;
- glossário teológico EN → PT-BR;
- tela de configurações de tradução;
- teste de chave API;
- botão “Traduzir parágrafo” em conteúdo teológico/RAG;
- exibição original + tradução;
- badges de status;
- logs técnicos mínimos;
- tratamento de erro;
- aviso jurídico e de qualidade.

### 3.2 Fora do escopo inicial

Não implementar ainda:

- tradução massiva de biblioteca inteira;
- tradução automática de todo RAG;
- marketplace de traduções;
- revisão colaborativa;
- editor de glossários avançado;
- memória de tradução completa;
- suporte local para francês ou espanhol;
- treinamento de modelos;
- publicação de traduções como conteúdo oficial;
- tradução de Bíblias protegidas por copyright.

---

## 4. Arquitetura geral

A arquitetura deve funcionar como uma camada independente:

```txt
UI / Reader / RAG Viewer / Study Builder
        ↓
Translation UI Adapter
        ↓
Translation Gateway
        ↓
Provider selecionado
        ↓
Cache + Glossário + Auditoria
        ↓
Resposta traduzida
```

---

## 5. Estrutura de pastas recomendada

Adicionar sem destruir a estrutura atual:

```txt
packages/
└─ translation-gateway/
   ├─ package.json
   ├─ tsconfig.json
   └─ src/
      ├─ index.ts
      ├─ types/
      │  ├─ translation.types.ts
      │  ├─ provider.types.ts
      │  └─ glossary.types.ts
      │
      ├─ services/
      │  ├─ translation.service.ts
      │  ├─ translation-cache.service.ts
      │  ├─ translation-settings.service.ts
      │  └─ terminology-checker.service.ts
      │
      ├─ providers/
      │  ├─ base.provider.ts
      │  ├─ deepl.provider.ts
      │  ├─ google.provider.ts
      │  ├─ azure.provider.ts
      │  ├─ aws.provider.ts
      │  ├─ llm.provider.ts
      │  ├─ argos-local.provider.ts
      │  └─ libretranslate-external.provider.ts
      │
      ├─ glossary/
      │  ├─ theological-glossary.en-ptbr.ts
      │  ├─ theological-glossary.rules.ts
      │  └─ glossary-version.ts
      │
      ├─ utils/
      │  ├─ hash-text.ts
      │  ├─ normalize-language.ts
      │  ├─ chunk-for-translation.ts
      │  └─ sanitize-translation-input.ts
      │
      └─ errors/
         └─ translation.errors.ts
```

Se o projeto atual já possuir uma estrutura diferente de `packages`, o agente deve adaptar os nomes sem mover o restante do projeto.

---

## 6. Integração com apps existentes

### 6.1 Desktop Electron

Adicionar pontos mínimos:

```txt
apps/desktop/
└─ src/
   ├─ features/
   │  └─ translation/
   │     ├─ components/
   │     │  ├─ TranslateButton.tsx
   │     │  ├─ TranslationPanel.tsx
   │     │  ├─ BilingualView.tsx
   │     │  ├─ TranslationProviderBadge.tsx
   │     │  └─ TranslationSettingsForm.tsx
   │     │
   │     ├─ hooks/
   │     │  ├─ useTranslateText.ts
   │     │  ├─ useTranslationSettings.ts
   │     │  └─ useTranslationCache.ts
   │     │
   │     └─ translation.routes.ts
```

### 6.2 API Node.js

Se existir backend local/API:

```txt
apps/api/
└─ src/
   └─ modules/
      └─ translation/
         ├─ translation.controller.ts
         ├─ translation.service.ts
         ├─ translation.module.ts
         └─ dto/
            ├─ translate-text.dto.ts
            ├─ test-provider.dto.ts
            └─ translation-settings.dto.ts
```

### 6.3 RAG Viewer

Adicionar somente ações contextuais:

```txt
[Traduzir parágrafo]
[Ver original]
[Ver lado a lado]
[Explicar termos]
[Salvar tradução no estudo]
```

Não alterar o pipeline RAG central nesta fase.

### 6.4 Study Builder

Permitir inserir uma tradução no estudo como bloco:

```txt
StudyBlock.type = "translated_quote"
```

Campos sugeridos:

```ts
type TranslatedQuoteBlock = {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: "pt-BR";
  provider: string;
  sourceCitation?: string;
  glossaryVersion?: string;
};
```

---

## 7. Tipos TypeScript obrigatórios

Criar tipos centrais para impedir acoplamento com um provedor específico.

```ts
export type TranslationMode =
  | "user_api"
  | "local"
  | "disabled";

export type TranslationProviderId =
  | "deepl"
  | "google"
  | "azure"
  | "aws"
  | "llm"
  | "argos_local"
  | "libretranslate_external";

export type SupportedSourceLanguage =
  | "auto"
  | "en"
  | "fr"
  | "es";

export type SupportedTargetLanguage =
  | "pt-BR";

export type TranslationRequest = {
  sourceText: string;
  sourceLanguage: SupportedSourceLanguage;
  targetLanguage: SupportedTargetLanguage;
  provider: TranslationProviderId;
  mode: TranslationMode;

  theologicalMode?: boolean;
  applyGlossary?: boolean;
  preserveFormatting?: boolean;
  useCache?: boolean;

  context?: {
    documentId?: string;
    documentTitle?: string;
    author?: string;
    tradition?: string;
    doctrineTags?: string[];
    biblicalReferences?: string[];
    sourceUrl?: string;
    licenseStatus?: string;
  };
};

export type TranslationResponse = {
  translatedText: string;
  provider: TranslationProviderId;
  mode: TranslationMode;

  sourceLanguage: string;
  targetLanguage: SupportedTargetLanguage;

  cached: boolean;
  cacheKey?: string;

  glossaryApplied: boolean;
  glossaryVersion?: string;

  terminologyWarnings: string[];
  qualityWarnings: string[];

  sourceHash: string;
  createdAt: string;
};

export type ProviderTestResult = {
  provider: TranslationProviderId;
  ok: boolean;
  message: string;
  detectedCapabilities?: TranslationProviderCapabilities;
};

export type TranslationProviderCapabilities = {
  supportsApiKey: boolean;
  supportsLocal: boolean;
  supportsGlossary: boolean;
  supportsAutoDetect: boolean;
  supportsBatch: boolean;
  supportedSourceLanguages: SupportedSourceLanguage[];
  supportedTargetLanguages: SupportedTargetLanguage[];
};
```

---

## 8. Interface comum dos providers

Cada provider deve implementar a mesma interface.

```ts
export interface TranslationProvider {
  id: TranslationProviderId;
  label: string;

  getCapabilities(): TranslationProviderCapabilities;

  testConnection(settings: TranslationProviderSettings): Promise<ProviderTestResult>;

  translate(
    request: TranslationRequest,
    settings: TranslationProviderSettings
  ): Promise<TranslationResponse>;
}

export type TranslationProviderSettings = {
  provider: TranslationProviderId;
  apiKey?: string;
  endpointUrl?: string;
  region?: string;
  model?: string;
  enabled: boolean;
  extra?: Record<string, unknown>;
};
```

---

## 9. Provider DeepL — implementação inicial

### 9.1 Responsabilidade

O provider DeepL deve:

- aceitar chave API do usuário;
- traduzir texto selecionado;
- suportar detecção automática quando possível;
- usar glossário futuramente;
- retornar erros claros;
- nunca logar chave API;
- nunca enviar texto sem confirmação de provider selecionado.

### 9.2 Configuração

```env
DEEPL_API_KEY=opcional_apenas_para_dev_local
DEEPL_API_URL=https://api-free.deepl.com/v2/translate
DEEPL_API_PRO_URL=https://api.deepl.com/v2/translate
```

No app de produção, a chave deve vir das configurações do usuário, não do `.env` do projeto.

### 9.3 Campos de UI

```txt
Provedor: DeepL
Chave API
Tipo de conta: Free / Pro / Auto
Botão: Testar chave
Status: válida / inválida / limite atingido / erro de rede
```

### 9.4 Regras de segurança

- A API key deve ser armazenada criptografada.
- Não deve aparecer em logs.
- Não deve ser enviada ao renderer sem necessidade.
- No Electron, o processo principal deve cuidar da chamada API quando possível.
- O renderer deve chamar apenas uma API interna segura.

---

## 10. Provider Google Cloud Translation — stub inicial

Criar o arquivo `google.provider.ts`, mas não é obrigatório implementar chamada real agora.

Deve retornar:

```txt
Google Cloud Translation está preparado na arquitetura, mas ainda não foi ativado nesta versão.
```

No futuro, deve suportar:

- API key ou service account;
- glossários;
- tradução batch;
- detecção automática;
- tradução de documentos licenciados.

---

## 11. Provider Azure Translator — stub inicial

Criar o arquivo `azure.provider.ts`.

No futuro, deve suportar:

- endpoint;
- key;
- region;
- document translation;
- glossário;
- custom translator.

---

## 12. Provider AWS Translate — stub inicial

Criar o arquivo `aws.provider.ts`.

No futuro, deve suportar:

- access key;
- secret key;
- region;
- custom terminology;
- batch translation;
- parallel data.

---

## 13. Provider LLM — stub inicial

Criar `llm.provider.ts`.

Não implementar geração livre inicialmente, mas deixar pronto para usar o gateway de IA existente.

Futura função:

```txt
Traduzir preservando teologia, tom acadêmico, terminologia e notas explicativas.
```

O LLM provider deve ser usado preferencialmente como:

```txt
1. tradutor contextual;
2. revisor terminológico;
3. explicador de termos;
4. comparador de nuances teológicas.
```

Não deve ser o tradutor padrão no MVP.

---

## 14. Provider Argos Local — preparação inicial

### 14.1 Escopo

O provider local deve suportar inicialmente apenas:

```txt
sourceLanguage = "en"
targetLanguage = "pt-BR"
```

Se o usuário tentar francês ou espanhol no modo local:

```txt
O tradutor local gratuito desta versão suporta apenas Inglês → Português Brasileiro.
Configure uma API de tradução para outros idiomas.
```

### 14.2 Arquitetura futura

```txt
Electron Main Process
  ↓
Translation Gateway
  ↓
Argos Local Provider
  ↓
Sidecar Python em 127.0.0.1
  ↓
Argos Translate EN → PT-BR
```

### 14.3 Pasta futura do sidecar

```txt
apps/desktop/resources/translation-local/
├─ move-reino-local-translator.py
├─ requirements.txt
├─ models/
│  └─ en_pt.argosmodel
└─ README.md
```

### 14.4 API local futura

```http
POST http://127.0.0.1:{port}/translate
Content-Type: application/json
```

Payload:

```json
{
  "source": "en",
  "target": "pt_BR",
  "text": "Justification is an act of God's free grace."
}
```

Resposta:

```json
{
  "translatedText": "A justificação é um ato da livre graça de Deus.",
  "engine": "argos",
  "local": true
}
```

### 14.5 Segurança obrigatória do sidecar

- Rodar apenas em `127.0.0.1`.
- Porta dinâmica.
- Token local temporário entre Electron e sidecar.
- Encerrar processo junto com o app.
- Tamanho máximo por requisição.
- Não aceitar tráfego externo.
- Não salvar texto sem consentimento/cache.
- Não baixar modelos automaticamente sem autorização do usuário.

---

## 15. LibreTranslate externo — conector futuro

Criar stub `libretranslate-external.provider.ts`.

Uso futuro:

- permitir ao usuário apontar para uma URL própria do LibreTranslate;
- não embutir LibreTranslate no app inicialmente;
- não distribuir servidor LibreTranslate junto ao app sem auditoria de licença;
- usar apenas como conector externo opcional.

Configurações futuras:

```txt
Endpoint LibreTranslate:
http://127.0.0.1:5000
API Key opcional:
********
```

---

## 16. Cache de tradução

### 16.1 Objetivo

Evitar custo repetido e melhorar velocidade.

### 16.2 Regra

Se o mesmo texto, idioma, provider e versão de glossário já foram traduzidos, retornar do cache.

### 16.3 Hash

Criar hash com:

```txt
normalizedSourceText
sourceLanguage
targetLanguage
provider
glossaryVersion
theologicalMode
```

### 16.4 Modelo SQL sugerido

Para SQLite local ou PostgreSQL:

```sql
CREATE TABLE IF NOT EXISTS translation_cache (
  id TEXT PRIMARY KEY,
  source_hash TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  provider TEXT NOT NULL,
  mode TEXT NOT NULL,
  glossary_version TEXT,
  theological_mode INTEGER DEFAULT 0,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  document_id TEXT,
  document_title TEXT,
  author TEXT,
  source_url TEXT,
  license_status TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_translation_cache_unique
ON translation_cache(
  source_hash,
  target_language,
  provider,
  glossary_version,
  theological_mode
);
```

### 16.5 Política de privacidade

O cache deve ser local por padrão.

O usuário deve poder:

- limpar cache;
- desativar cache;
- ver tamanho do cache;
- limpar cache por documento;
- limpar cache por provider.

---

## 17. Glossário teológico EN → PT-BR

### 17.1 Objetivo

Garantir consistência em termos teológicos.

### 17.2 Arquivo inicial

Criar:

```txt
packages/translation-gateway/src/glossary/theological-glossary.en-ptbr.ts
```

Conteúdo inicial:

```ts
export const THEOLOGICAL_GLOSSARY_EN_PTBR = [
  {
    source: "justification",
    target: "justificação",
    category: "soteriologia",
    confidence: "high",
  },
  {
    source: "sanctification",
    target: "santificação",
    category: "soteriologia",
    confidence: "high",
  },
  {
    source: "regeneration",
    target: "regeneração",
    category: "soteriologia",
    confidence: "high",
  },
  {
    source: "atonement",
    target: "expiação",
    category: "cristologia",
    confidence: "high",
  },
  {
    source: "propitiation",
    target: "propiciação",
    category: "cristologia",
    confidence: "high",
  },
  {
    source: "covenant",
    target: "aliança",
    category: "teologia bíblica",
    confidence: "high",
  },
  {
    source: "righteousness",
    target: "justiça",
    category: "soteriologia",
    confidence: "medium",
    note: "Pode significar justiça, retidão ou status justo conforme contexto.",
  },
  {
    source: "imputation",
    target: "imputação",
    category: "soteriologia",
    confidence: "high",
  },
  {
    source: "election",
    target: "eleição",
    category: "soteriologia",
    confidence: "high",
  },
  {
    source: "predestination",
    target: "predestinação",
    category: "soteriologia",
    confidence: "high",
  },
  {
    source: "prevenient grace",
    target: "graça preveniente",
    category: "soteriologia",
    confidence: "high",
  },
  {
    source: "effectual calling",
    target: "chamado eficaz",
    category: "soteriologia",
    confidence: "high",
  },
  {
    source: "original sin",
    target: "pecado original",
    category: "hamartiologia",
    confidence: "high",
  },
  {
    source: "total depravity",
    target: "depravação total",
    category: "hamartiologia",
    confidence: "high",
  },
  {
    source: "free will",
    target: "livre-arbítrio",
    category: "antropologia",
    confidence: "medium",
  },
  {
    source: "Lord's Supper",
    target: "Ceia do Senhor",
    category: "eclesiologia",
    confidence: "high",
  },
  {
    source: "ordinance",
    target: "ordenança",
    category: "eclesiologia",
    confidence: "medium",
  },
  {
    source: "sacrament",
    target: "sacramento",
    category: "eclesiologia",
    confidence: "medium",
  },
  {
    source: "means of grace",
    target: "meios de graça",
    category: "eclesiologia",
    confidence: "high",
  },
];
```

### 17.3 Regra importante

Não aplicar substituição cega.

O sistema deve:

1. detectar termos no original;
2. verificar se a tradução contém equivalente adequado;
3. marcar divergências;
4. sugerir correção;
5. aplicar automaticamente apenas termos de alta confiança;
6. exibir aviso para termos de média confiança.

---

## 18. UI/UX da tradução

### 18.1 Tela de configurações

Criar área:

```txt
Configurações > Tradução
```

Campos:

```txt
Modo de tradução:
( ) Desativado
( ) Usar minha chave API
( ) Usar tradutor local gratuito EN → PT-BR

Provedor API:
[DeepL] [Google] [Azure] [AWS] [LLM]

Chave API:
[***************]

Botões:
[Testar conexão]
[Salvar]
[Limpar chave]
[Limpar cache de traduções]
```

### 18.2 Painel de tradução

Componente:

```txt
TranslationPanel
```

Deve mostrar:

```txt
Idioma original: Inglês
Destino: Português BR
Provider: DeepL
Modo: API do usuário
Cache: Sim/Não
Glossário: aplicado/não aplicado
```

### 18.3 Leitor bilíngue

Modo:

```txt
Original | Tradução
```

Layout:

```txt
┌──────────────────────────────┬──────────────────────────────┐
│ Original                     │ Português BR                 │
│ texto em inglês              │ tradução                     │
└──────────────────────────────┴──────────────────────────────┘
```

### 18.4 Botões contextuais

Em documentos RAG, teologias e comentários:

```txt
[Traduzir parágrafo]
[Traduzir seção]
[Ver lado a lado]
[Explicar termos]
[Salvar em estudo]
```

No MVP, implementar apenas:

```txt
[Traduzir parágrafo]
[Ver lado a lado]
```

---

## 19. Identidade visual do módulo

Preservar identidade premium do Move Reino Bible:

- azul Reino para ações principais;
- dourado Coroa para glossário teológico;
- roxo para IA;
- verde para local/offline;
- ciano para API externa;
- vermelho para erro ou licença não verificada.

### Badges

```txt
[API do usuário]
[DeepL]
[EN → PT-BR local]
[Glossário aplicado]
[Cache]
[Revisão recomendada]
```

### Estados

```txt
Tradução em andamento:
linha dourada animada ou skeleton discreto.

Erro de API:
card escuro com borda vermelha suave.

Tradução local indisponível:
card escuro com botão “Configurar módulo local”.

Texto traduzido:
card com borda azul suave e badge de provider.
```

---

## 20. API interna sugerida

Se houver API backend:

### 20.1 Traduzir texto

```http
POST /api/translation/translate
```

Request:

```json
{
  "sourceText": "Justification is an act of God's free grace.",
  "sourceLanguage": "en",
  "targetLanguage": "pt-BR",
  "provider": "deepl",
  "mode": "user_api",
  "theologicalMode": true,
  "applyGlossary": true,
  "useCache": true,
  "context": {
    "documentTitle": "Systematic Theology",
    "author": "Charles Hodge",
    "tradition": "reformada",
    "doctrineTags": ["justificação", "soteriologia"]
  }
}
```

Response:

```json
{
  "translatedText": "A justificação é um ato da livre graça de Deus.",
  "provider": "deepl",
  "mode": "user_api",
  "sourceLanguage": "en",
  "targetLanguage": "pt-BR",
  "cached": false,
  "glossaryApplied": true,
  "glossaryVersion": "theological-en-ptbr-v1",
  "terminologyWarnings": [],
  "qualityWarnings": [
    "Tradução automática. Revise antes de publicar."
  ],
  "sourceHash": "abc123",
  "createdAt": "2026-06-18T00:00:00.000Z"
}
```

### 20.2 Testar provider

```http
POST /api/translation/test-provider
```

Request:

```json
{
  "provider": "deepl",
  "apiKey": "user-api-key"
}
```

Response:

```json
{
  "provider": "deepl",
  "ok": true,
  "message": "Conexão com DeepL validada com sucesso."
}
```

### 20.3 Ler configurações

```http
GET /api/translation/settings
```

### 20.4 Salvar configurações

```http
POST /api/translation/settings
```

### 20.5 Limpar cache

```http
DELETE /api/translation/cache
```

---

## 21. Armazenamento de chaves

### 21.1 Regras

- Nunca salvar API key em texto puro.
- Nunca exibir API key completa.
- Nunca logar API key.
- No Electron, usar armazenamento seguro quando disponível.
- No web/SaaS, criptografar no banco com chave de ambiente.
- Permitir remover chave.

### 21.2 UI

Mostrar:

```txt
Chave cadastrada: sk-************X9a
```

Não mostrar botão “copiar chave”.

---

## 22. Licença e direitos autorais

### 22.1 Tradução de conteúdo livre

Se a obra é domínio público ou licença permite tradução:

- pode traduzir;
- pode salvar em cache;
- pode inserir em estudo;
- pode exportar conforme licença da fonte.

### 22.2 Tradução de conteúdo protegido

Se a obra é protegida:

- permitir tradução dinâmica apenas para uso pessoal do usuário, quando permitido;
- não distribuir tradução pronta;
- não indexar tradução permanente como acervo oficial;
- não exportar como publicação oficial sem alerta;
- registrar fonte original.

### 22.3 Aviso padrão

Exibir em configurações:

```txt
Traduções automáticas são recursos auxiliares de leitura e estudo. Elas não substituem tradução oficial, revisão humana, autorização editorial ou análise jurídica de direitos autorais.
```

---

## 23. Integração com IA existente

Neste plano inicial, a IA não deve assumir o controle da tradução.

A IA pode ser usada apenas em funções auxiliares:

```txt
- explicar termo teológico;
- apontar nuance de tradução;
- comparar original e tradução;
- sugerir revisão;
- gerar nota em português.
```

Botão futuro:

```txt
[Revisar com IA]
```

Prompt futuro:

```txt
Revise a tradução abaixo para português brasileiro, preservando terminologia teológica clássica. Não adicione conteúdo novo. Aponte termos técnicos e ambiguidades.
```

---

## 24. Integração com RAG

### 24.1 Regra inicial

Não reindexar automaticamente traduções geradas.

No MVP:

- RAG continua usando texto original.
- Tradução é camada de leitura.
- Ao responder em português, a IA pode citar a fonte original e apresentar tradução auxiliar.

### 24.2 Futuro

Criar campo:

```txt
rag_chunk_translations
```

Mas apenas para:

- conteúdo livre;
- conteúdo autorizado;
- traduções revisadas;
- acervos liberados.

---

## 25. Integração com estudos

Permitir ao usuário salvar uma tradução em uma sessão de estudo.

Bloco:

```txt
Tipo: translated_quote
```

Conteúdo:

```txt
Original:
...

Tradução:
...

Fonte:
...

Provider:
...

Aviso:
Tradução automática, revise antes de publicar.
```

---

## 26. Ordem de implementação

### Sprint 1 — Fundação

- Criar `packages/translation-gateway`.
- Criar tipos centrais.
- Criar interface `TranslationProvider`.
- Criar `TranslationService`.
- Criar stubs dos providers.
- Criar hash de texto.
- Criar glossário inicial.

Critério de aceite:

```txt
O projeto compila e todos os providers existem como classes/serviços, mesmo que só DeepL seja funcional depois.
```

### Sprint 2 — DeepL funcional

- Implementar `deepl.provider.ts`.
- Implementar teste de conexão.
- Implementar tradução simples.
- Implementar tratamento de erros.
- Implementar máscara de API key.
- Criar tela de configuração.

Critério de aceite:

```txt
Usuário cadastra chave DeepL e traduz um parágrafo manualmente.
```

### Sprint 3 — Cache

- Criar tabela de cache.
- Implementar busca no cache.
- Implementar gravação no cache.
- Criar botão limpar cache.
- Mostrar badge `[Cache]`.

Critério de aceite:

```txt
A mesma tradução é reutilizada sem nova chamada API.
```

### Sprint 4 — UI de tradução

- Criar `TranslateButton`.
- Criar `TranslationPanel`.
- Criar `BilingualView`.
- Integrar em RAG Viewer ou leitor teológico.
- Não alterar Bible Reader principal ainda, salvo se solicitado.

Critério de aceite:

```txt
Usuário seleciona um parágrafo teológico e vê original/tradução lado a lado.
```

### Sprint 5 — Glossário

- Aplicar glossário básico.
- Mostrar termos detectados.
- Mostrar avisos de termos médios.
- Badge `[Glossário aplicado]`.

Critério de aceite:

```txt
Termos como justification, covenant e atonement são detectados e padronizados.
```

### Sprint 6 — Argos Local preparado

- Criar provider local.
- Criar detector de instalação.
- Criar tela “módulo local indisponível/disponível”.
- Criar stub de chamada local.
- Não empacotar modelo ainda sem solicitação.

Critério de aceite:

```txt
O app mostra opção local EN → PT-BR e informa se o módulo está disponível.
```

---

## 27. Testes obrigatórios

### 27.1 Unitários

- hash de texto;
- normalização de idioma;
- cache key;
- aplicação de glossário;
- stubs de providers;
- tratamento de provider não implementado.

### 27.2 Integração

- DeepL com chave válida;
- DeepL com chave inválida;
- erro de rede;
- cache hit;
- cache miss;
- texto vazio;
- texto muito longo;
- idioma não suportado no local.

### 27.3 UI

- salvar chave;
- testar chave;
- traduzir parágrafo;
- alternar original/tradução;
- limpar cache;
- exibir erro.

---

## 28. Tratamento de erros

Criar erros padronizados:

```ts
export class TranslationProviderNotConfiguredError extends Error {}
export class TranslationProviderNotImplementedError extends Error {}
export class TranslationApiKeyInvalidError extends Error {}
export class TranslationRateLimitError extends Error {}
export class TranslationUnsupportedLanguageError extends Error {}
export class TranslationLocalEngineUnavailableError extends Error {}
export class TranslationTextTooLongError extends Error {}
```

Mensagens para usuário:

```txt
Chave API inválida. Verifique a chave cadastrada.
Limite do provedor atingido. Tente novamente mais tarde.
O tradutor local suporta apenas Inglês → Português BR nesta versão.
Este provedor ainda não foi implementado nesta versão.
Não foi possível acessar o tradutor local.
```

---

## 29. Limites recomendados

### 29.1 MVP

```txt
Tamanho máximo por tradução pontual:
3.000 a 5.000 caracteres

Tamanho máximo por lote:
não implementar no MVP

Tradução simultânea:
1 a 3 requisições

Timeout:
30 segundos API
60 segundos local
```

### 29.2 Futuro

Criar fila para documentos longos.

---

## 30. Variáveis de ambiente de desenvolvimento

```env
# Apenas para desenvolvimento local
TRANSLATION_DEFAULT_PROVIDER=deepl
TRANSLATION_ENABLE_DEEPL=true
TRANSLATION_ENABLE_LOCAL=false

DEEPL_API_MODE=free
DEEPL_API_KEY=

TRANSLATION_CACHE_ENABLED=true
TRANSLATION_GLOSSARY_ENABLED=true
```

Em produção gratuita, o app deve funcionar sem qualquer `.env` de API.

---

## 31. Checklist de segurança

- [ ] API key não aparece em log.
- [ ] API key não fica em texto puro.
- [ ] Renderer não acessa API key diretamente sem necessidade.
- [ ] Conteúdo traduzido não é enviado para provider errado.
- [ ] Usuário sabe qual provider está usando.
- [ ] Modo local não acessa internet.
- [ ] Cache pode ser limpo.
- [ ] Erros não vazam segredo.
- [ ] Provider futuro não implementado falha com mensagem clara.
- [ ] Tradução protegida por copyright não vira acervo oficial automaticamente.

---

## 32. Critérios de aceite gerais

O módulo estará aprovado quando:

```txt
1. O projeto atual continuar compilando sem refatoração estrutural.
2. O pacote translation-gateway existir e expor API limpa.
3. DeepL funcionar com chave do usuário.
4. Stubs dos demais providers existirem.
5. O cache funcionar.
6. O glossário EN → PT-BR existir.
7. O usuário conseguir traduzir um parágrafo.
8. O usuário conseguir ver original e tradução lado a lado.
9. O app indicar provider, modo, cache e glossário.
10. O modo local EN → PT-BR estiver arquiteturalmente preparado.
11. Nenhuma chave paga estiver embutida.
12. O visual seguir o padrão premium Move Reino Bible.
```

---

## 33. Prompt direto para o agente DEV

Use este prompt para iniciar a implementação:

```txt
Você está trabalhando no projeto Move Reino Bible. Integre um sistema de tradução incremental sem reestruturar o projeto atual.

Regras obrigatórias:
- Não mover ou renomear módulos existentes.
- Não alterar o motor bíblico, STEP, RAG ou IA fora dos pontos de integração.
- Criar a tradução como módulo independente.
- Implementar inicialmente apenas o necessário para deixar APIs disponíveis e traduzir parágrafos pontualmente.
- Não criar tradução massiva.
- Não embutir API keys.
- Preservar visual premium azul Reino e dourado Coroa.

Crie o pacote packages/translation-gateway com:
- tipos centrais de tradução;
- interface TranslationProvider;
- TranslationService;
- TranslationCacheService;
- provider DeepL funcional;
- stubs para Google, Azure, AWS, LLM, Argos Local e LibreTranslate externo;
- glossário teológico EN → PT-BR;
- utilitário de hash;
- erros padronizados.

Integre no app:
- tela Configurações > Tradução;
- cadastro de chave API do usuário;
- teste de conexão DeepL;
- botão Traduzir parágrafo;
- painel de tradução;
- visual lado a lado original/tradução;
- badges API, provider, cache e glossário.

Prepare o modo local:
- apenas Inglês → Português BR;
- provider Argos Local como estrutura inicial;
- mensagem clara se indisponível;
- não implementar download automático de modelo ainda.

Critério final:
O usuário deve conseguir cadastrar uma chave DeepL, traduzir um parágrafo teológico para português brasileiro, ver a tradução lado a lado, e o sistema deve estar preparado para expansão futura de providers sem quebrar a arquitetura.
```

---

## 34. Referências técnicas oficiais para o agente

O agente deve consultar as documentações oficiais atuais antes de implementar chamadas reais:

- DeepL API Translate:  
  https://developers.deepl.com/api-reference/translate

- DeepL Glossaries:  
  https://developers.deepl.com/api-reference/multilingual-glossaries

- Google Cloud Translation:  
  https://cloud.google.com/translate  
  https://cloud.google.com/translate/docs/advanced/glossary

- Argos Translate:  
  https://github.com/argosopentech/argos-translate

- LibreTranslate:  
  https://github.com/LibreTranslate/LibreTranslate

---

## 35. Observação final

Este plano não tenta resolver toda a tradução do Move Reino Bible de uma vez. Ele cria a base correta:

```txt
Módulo isolado
APIs disponíveis
DeepL funcional
cache local
glossário teológico
modo local preparado
visual premium preservado
expansão controlada sob demanda
```

A partir dessa fundação, novas integrações podem ser adicionadas sem quebrar o produto principal.

---

## 36. Verificação do estado atual (18/06/2026)

### 36.1 O que o projeto **já possui**

| Componente | Status | Função |
|------------|--------|--------|
| `@mrb/md-translator` | ✅ Implementado | Tradução EN → PT via `google-translate-api-x` (scripts/batch) |
| `scripts/translate-theology-md.ts` | ✅ Em uso | Suma Teológica EN → PT (lotes, progresso, cache) |
| `scripts/translate-strongs-kjv.ts` | ✅ Em uso | Strong's KJV EN → PT |
| `data/strong/index/translation-cache-en-pt.json` | ✅ Ativo | Cache de traduções Strong |
| `data/rag/index/translation-cache-summa-en-pt.json` | ✅ Ativo | Cache da Suma |
| `packages/shared-types/src/gloss-pt.ts` | ✅ Ativo | Gloss interlinear EN → PT (não é tradução de documentos) |
| `data/library/manifest.json` → `translatedFile` | ✅ Ativo | Biblioteca aponta para versão PT quando existir |
| `packages/translation-gateway` | ❌ Não existe | Previsto neste documento |
| UI Desktop (Traduzir parágrafo / lado a lado) | ❌ Não existe | Previsto neste documento |
| API `/api/translation/*` | ❌ Não existe | Previsto neste documento |
| DeepL / Argos / glossários teológicos | ❌ Não existe | Previsto neste documento |

**Conclusão:** a tradução hoje é **operacional só em pipelines CLI** (EN → PT), sem camada unificada no app nem suporte a francês/espanhol.

### 36.2 Lacunas em relação ao objetivo EN / FR / ES → PT-BR

| Idioma fonte | Necessidade | Situação atual |
|--------------|-------------|----------------|
| **Inglês (en)** | Teologia, Strong, RAG, comentários | Parcial — só scripts + cache |
| **Francês (fr)** | Fontes patrísticas / clássicas futuras | Não implementado |
| **Espanhol (es)** | Fontes STEP (col. espanhola), teologia latino-americana | Não implementado |
| **PT-BR (pt-BR)** | Destino único | Definido como alvo em tipos e manifest |

O documento original (§3.2) exclui FR/ES no **modo local** — correto. Para **API do usuário** (DeepL, Google, etc.), os tipos em §7 já incluem `fr` e `es` em `SupportedSourceLanguage`.

### 36.3 Estratégia recomendada — não duplicar, evoluir

Não criar um segundo sistema paralelo. Evoluir em três camadas:

```txt
Camada A — Pipelines em lote (já existe, expandir)
  @mrb/md-translator  →  renomear/generalizar para sourceLang: en|fr|es
  scripts CLI         →  translate:theology, translate:strongs, novos: fr/es

Camada B — translation-gateway (novo, conforme §4–§8)
  Providers: DeepL (EN/FR/ES→PT), stubs Google/Azure/AWS/LLM
  Cache SQL unificado (substitui JSONs dispersos gradualmente)
  Glossários: en-ptbr, fr-ptbr, es-ptbr

Camada C — UI Desktop (novo, conforme §18)
  Traduzir parágrafo / lado a lado no Library Reader e RAG
  Consome translation-gateway (não chama md-translator direto do renderer)
```

**Regra de migração:** `md-translator` vira **adapter interno** do provider `google_unofficial` ou é absorvido por `TranslationService` no Sprint 1–2.

---

## 37. Plano EN / FR / ES → Português BR

### 37.1 Matriz de provedores por idioma

| Par | Modo API (usuário) | Modo local (futuro) | Pipeline CLI (agora) |
|-----|-------------------|---------------------|----------------------|
| EN → PT-BR | DeepL, Google, Azure, AWS, LLM | Argos (futuro) | `md-translator` ✅ |
| FR → PT-BR | DeepL, Google, Azure, AWS, LLM | Não no MVP | A criar |
| ES → PT-BR | DeepL, Google, Azure, AWS, LLM | Não no MVP | A criar |

DeepL suporta nativamente `EN`, `FR`, `ES` → `PT-BR` — ideal como primeiro provider multi-idioma no app.

### 37.2 Alterações mínimas em `@mrb/md-translator` (Sprint 0 — pré-gateway)

Generalizar API existente sem quebrar chamadas atuais:

```ts
// packages/md-translator/src/translate.ts (evolução de en-pt-translator.ts)

export type MdSourceLanguage = "en" | "fr" | "es";
export type MdTargetLanguage = "pt-BR";

export async function translateToPtBr(
  text: string,
  options?: {
    sourceLang?: MdSourceLanguage;
    cachePath?: string;
  }
): Promise<string>;

export async function translateMarkdownToPtBr(
  input: string,
  options?: { sourceLang?: MdSourceLanguage; cachePath?: string }
): Promise<string>;
```

Cache por idioma:

```txt
data/translation/cache/
├─ en-pt-br.json      ← migrar de data/strong/index/translation-cache-en-pt.json
├─ fr-pt-br.json
├─ es-pt-br.json
└─ manifest.json      ← metadados: versão, contagem, última atualização
```

### 37.3 Glossários teológicos por par de idiomas

Expandir §17 para três arquivos:

```txt
packages/translation-gateway/src/glossary/
├─ theological-glossary.en-ptbr.ts   ← já especificado
├─ theological-glossary.fr-ptbr.ts   ← novo (graça→graça, expiation→expiação, etc.)
├─ theological-glossary.es-ptbr.ts   ← novo (justificación→justificação, etc.)
└─ glossary-registry.ts              ← seleciona por sourceLanguage
```

Termos de alta confiança em francês (exemplos iniciais):

```ts
{ source: "justification", target: "justificação", category: "soteriologia" } // EN
{ source: "justification", target: "justificação", category: "soteriologia" } // FR (même graphie contextuelle)
{ source: "justificación", target: "justificação", category: "soteriologia" } // ES
```

### 37.4 Pontos de integração no app (sem alterar motores bíblico/STEP)

| Superfície | Ação | Idiomas |
|------------|------|---------|
| **Biblioteca** (`LibraryReader`) | Botão "Traduzir parágrafo" + modo lado a lado | EN, FR, ES |
| **RAG Viewer** | Mesmos botões em chunk teológico | EN, FR, ES |
| **Interlinear** | Já resolvido via `gloss-pt.ts` (gloss, não documento) | EN gloss only |
| **Strong / Léxico** | Pipeline CLI existente | EN → PT |
| **Suma / Sistemáticas** | `translate:theology:loop` | EN → PT (expandir FR se fonte existir) |

**Não traduzir automaticamente:** Bíblia licenciada, RAG inteiro, STEP, tokens interlineares em massa.

### 37.5 Detecção de idioma fonte

Ordem de prioridade:

1. Metadado do documento (`manifest.json` → `language`, frontmatter MD).
2. Campo explícito do usuário na UI.
3. `auto` via provider (DeepL / Google).
4. Heurística leve (palavras-chave: `Objeção`/`Objection`/`Objeción`).

```ts
// manifest exemplo futuro
{
  "id": "aquino-suma",
  "language": "en",
  "translatedFile": "systematic/suma-teologica-aquino.md",
  "translationMeta": {
    "sourceLanguage": "en",
    "targetLanguage": "pt-BR",
    "provider": "md-translator-cli",
    "status": "in_progress"
  }
}
```

---

## 38. Ordem de implementação revisada (com FR/ES)

### Fase 0 — Consolidar o que existe (1 sprint)

- [ ] Generalizar `@mrb/md-translator` para `en|fr|es` → `pt-BR`
- [ ] Unificar pasta de cache `data/translation/cache/`
- [ ] Documentar comandos CLI por idioma
- [ ] Manter scripts atuais funcionando (aliases `translateEnToPt` → `translateToPtBr`)

### Fase 1 — `translation-gateway` (Sprints 1–3 do §26)

- [ ] Pacote conforme §5–§8
- [ ] DeepL multi-idioma (EN/FR/ES → PT-BR)
- [ ] Adapter que delega ao `md-translator` como fallback gratuito (somente EN no MVP CLI)

### Fase 2 — UI Desktop (Sprint 4 do §26)

- [ ] Configurações > Tradução
- [ ] `TranslateButton` + `BilingualView` no Library Reader
- [ ] Seletor de idioma fonte: EN | FR | ES | Auto

### Fase 3 — Glossários e qualidade (Sprint 5)

- [ ] Glossários EN/FR/ES → PT-BR
- [ ] Badge `[Glossário aplicado]` por par de idiomas

### Fase 4 — Local e provedores extras (Sprints 6+)

- [ ] Argos EN → PT-BR apenas (§14)
- [ ] Stubs Google/Azure/AWS/LLM conforme §10–§13

---

## 39. Comandos CLI previstos (EN / FR / ES)

```bash
# Inglês (já existe)
pnpm translate:theology --file data/rag/sources/systematic/Suma_....MD --source en
pnpm translate:strongs-kjv --all

# Francês (novo)
pnpm translate:theology --file data/rag/sources/systematic/Aquinas_FR.md --source fr --slug aquino-fr-pt

# Espanhol (novo)
pnpm translate:theology --file data/rag/sources/.../Obra_ES.md --source es --slug obra-es-pt

# App (futuro, via API)
POST /api/translation/translate
{ "sourceLanguage": "fr", "targetLanguage": "pt-BR", "provider": "deepl", ... }
```

---

## 40. Critérios de aceite — camada EN/FR/ES → PT-BR

```txt
[ ] EN, FR e ES listados como idiomas fonte em tipos e UI
[ ] DeepL traduz parágrafo dos três idiomas para PT-BR (chave do usuário)
[ ] Pipelines CLI funcionam para EN (regressão) e aceitam --source fr|es
[ ] Cache separado por par de idiomas
[ ] Biblioteca/RAG exibem original + PT lado a lado sob demanda
[ ] Glossário teológico aplicado conforme idioma fonte
[ ] Nenhuma tradução massiva automática do acervo
[ ] md-translator integrado ao gateway (não duplicado)
[ ] Interlinear (gloss-pt) permanece independente desta camada
```

---

## 41. Relação com outros módulos já resolvidos

| Módulo | Relação com translation-gateway |
|--------|--------------------------------|
| **Interlinear PT** (`gloss-pt.ts`) | Independente — gloss palavra a palavra STEP, não tradução de documentos |
| **Suma Teológica** | Consumidor da Camada A; `translatedFile` na biblioteca |
| **Strong KJV PT** | Consumidor da Camada A; léxico já em português |
| **RAG** | Texto indexado permanece no idioma original (§24); tradução é camada de leitura |

---

## 42. Status do documento

| Versão | Data | Alteração |
|--------|------|-----------|
| 1.0 | — | Plano original MVP |
| 1.1 | 18/06/2026 | §36–42: verificação do código, plano EN/FR/ES → PT-BR, integração com `@mrb/md-translator` |

**Próximo passo recomendado:** Fase 0 — generalizar `@mrb/md-translator` e criar `packages/translation-gateway` (Sprint 1) sem alterar Bible Reader, STEP ou RAG core.

