# MOVE REINO BIBLE — GUIA VISUAL COMPLETO DA APLICAÇÃO

## 1. Direção visual geral

O **Move Reino Bible** deve transmitir três sensações principais:

1. **Reverência** — por se tratar de uma aplicação bíblica e teológica.
2. **Profundidade intelectual** — por conter textos originais, léxicos, Strong, concordância, teologia sistemática e RAG.
3. **Modernidade premium** — por ser um software com IA, comparação textual e ambiente de estudo avançado.

A identidade deve evitar aparência infantil, genérica ou excessivamente “religiosa popular”. O visual deve se aproximar de uma plataforma premium de estudo, biblioteca teológica e software acadêmico-devocional.

A aplicação deve parecer:

* elegante;
* sóbria;
* espiritual sem ser caricata;
* tecnológica sem perder calor humano;
* acadêmica sem ser fria;
* cristã sem exageros visuais.

A referência principal é a logo enviada, com letras azuis fortes, detalhe dourado em forma de coroa/movimento e composição clássica.

---

# 2. Paleta oficial de cores

## 2.1 Cores principais extraídas da logo

### Azul Reino — cor primária

Usar como cor principal da marca, barras, botões primários, títulos, ícones ativos e destaques institucionais.

```css
--mr-blue-900: #003A66;
--mr-blue-800: #004A80;
--mr-blue-700: #075188;
--mr-blue-600: #0B5D9A;
--mr-blue-500: #126EAF;
```

Cor recomendada para o botão principal:

```css
--color-primary: #075188;
```

### Dourado Coroa — cor secundária

Usar em elementos de nobreza, marca, destaques teológicos, separadores, ícones especiais, status premium e chamadas de IA.

```css
--mr-gold-900: #8A6125;
--mr-gold-800: #A97832;
--mr-gold-700: #C38E42;
--mr-gold-600: #D1A058;
--mr-gold-500: #E0B66E;
```

Cor recomendada para acento:

```css
--color-accent: #D1A058;
```

---

## 2.2 Cores de fundo

### Tema escuro principal

O tema escuro deve ser o tema padrão da aplicação, pois valoriza o dourado e o azul, reduz fadiga visual e combina com estudo prolongado.

```css
--bg-dark-950: #05070C;
--bg-dark-900: #080D16;
--bg-dark-850: #0B1220;
--bg-dark-800: #101827;
--bg-dark-700: #172033;
```

Uso recomendado:

```css
--app-background: #080D16;
--sidebar-background: #05070C;
--panel-background: #0B1220;
--card-background: #101827;
```

### Tema claro

O tema claro deve parecer papel premium, não branco puro.

```css
--bg-light-50: #FBF8F1;
--bg-light-100: #F5EFE3;
--bg-light-200: #ECE1D0;
--bg-light-300: #DED0BA;
```

Uso recomendado:

```css
--app-light-background: #FBF8F1;
--reader-light-background: #F5EFE3;
--card-light-background: #FFFFFF;
```

---

## 2.3 Cores para texto

### Tema escuro

```css
--text-main-dark: #F5F0E8;
--text-secondary-dark: #C9D2DE;
--text-muted-dark: #8D9AAD;
--text-disabled-dark: #596579;
```

### Tema claro

```css
--text-main-light: #172033;
--text-secondary-light: #3E4A5C;
--text-muted-light: #6B7280;
--text-disabled-light: #9CA3AF;
```

---

## 2.4 Cores funcionais

```css
--success: #2FA36B;
--warning: #D6A13D;
--danger: #C94A4A;
--info: #2F80C8;
--ai-purple: #7C5CFF;
--rag-green: #3FA878;
--source-cyan: #3AAED8;
```

Uso:

* Verde: fonte encontrada, validação, estudo salvo.
* Amarelo/dourado: aviso, atenção, conteúdo premium.
* Vermelho: erro, fonte sem licença, chave inválida.
* Roxo: IA, LLM, geração assistida.
* Ciano: links, fontes externas, referências web.
* Verde RAG: documentos indexados, base teológica validada.

---

# 3. Tipografia

## 3.1 Tipografia da marca

A logo possui aparência clássica, serifada e nobre. Para títulos institucionais, headings de página e hero sections, usar fontes serifadas elegantes.

Fontes recomendadas:

```txt
- Cinzel
- Cormorant Garamond
- Playfair Display
- Libre Baskerville
```

Uso:

```css
--font-brand: "Cinzel", "Cormorant Garamond", "Times New Roman", serif;
```

Aplicar em:

* splash screen;
* tela de login;
* títulos principais;
* páginas institucionais;
* nome do produto;
* seções de destaque.

---

## 3.2 Tipografia da interface

Para a interface operacional, usar fonte moderna, limpa e altamente legível.

Fontes recomendadas:

```txt
- Inter
- Manrope
- Source Sans 3
- IBM Plex Sans
```

Uso:

```css
--font-ui: "Inter", "Manrope", "Segoe UI", Arial, sans-serif;
```

Aplicar em:

* menus;
* botões;
* cards;
* tabelas;
* formulários;
* painéis administrativos;
* configurações.

---

## 3.3 Tipografia para leitura bíblica

Para leitura de longos textos bíblicos, usar fonte serifada confortável.

Fontes recomendadas:

```txt
- Merriweather
- Crimson Pro
- Libre Baskerville
- Georgia
```

Uso:

```css
--font-bible: "Merriweather", "Crimson Pro", Georgia, serif;
```

Configuração padrão:

```css
.bible-text {
  font-family: var(--font-bible);
  font-size: 18px;
  line-height: 1.85;
  letter-spacing: 0.01em;
}
```

---

## 3.4 Tipografia para grego e hebraico

Para textos originais, usar fontes adequadas para caracteres bíblicos.

Sugestões:

```txt
- SBL Greek
- SBL Hebrew
- Ezra SIL
- Cardo
- Noto Serif Hebrew
- Noto Serif Greek
```

Uso:

```css
--font-greek: "SBL Greek", "Cardo", "Noto Serif", serif;
--font-hebrew: "SBL Hebrew", "Ezra SIL", "Noto Serif Hebrew", serif;
```

O hebraico deve respeitar direção RTL:

```css
.hebrew-text {
  direction: rtl;
  text-align: right;
  font-family: var(--font-hebrew);
  font-size: 22px;
  line-height: 2;
}
```

---

# 4. Estilo da interface

## 4.1 Linguagem visual

A interface deve combinar:

* fundo escuro profundo;
* cartões discretos;
* linhas douradas finas;
* títulos serifados;
* navegação moderna;
* ícones lineares;
* destaques azuis;
* elementos premium em dourado;
* painéis modulares para estudo.

O visual deve lembrar uma biblioteca digital teológica com tecnologia de ponta.

---

## 4.2 Bordas e cantos

Usar cantos levemente arredondados, sem aparência excessivamente “app infantil”.

```css
--radius-xs: 4px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 18px;
--radius-xl: 24px;
```

Uso recomendado:

* Botões: `8px`
* Cards: `12px`
* Painéis grandes: `18px`
* Modais: `24px`

---

## 4.3 Sombras

As sombras devem ser discretas. No tema escuro, usar mais borda e contraste do que sombra pesada.

```css
--shadow-soft: 0 8px 24px rgba(0, 0, 0, 0.22);
--shadow-panel: 0 16px 48px rgba(0, 0, 0, 0.35);
--shadow-gold-glow: 0 0 24px rgba(209, 160, 88, 0.18);
--shadow-blue-glow: 0 0 24px rgba(7, 81, 136, 0.26);
```

---

## 4.4 Bordas

```css
--border-dark: rgba(255, 255, 255, 0.08);
--border-gold-soft: rgba(209, 160, 88, 0.28);
--border-blue-soft: rgba(18, 110, 175, 0.28);
```

Uso:

```css
.card {
  border: 1px solid var(--border-dark);
}
```

Cards especiais de IA ou fontes teológicas podem usar borda dourada suave.

---

# 5. Gradientes oficiais

## 5.1 Gradiente principal da marca

```css
--gradient-brand: linear-gradient(135deg, #003A66 0%, #075188 48%, #126EAF 100%);
```

## 5.2 Gradiente dourado

```css
--gradient-gold: linear-gradient(135deg, #8A6125 0%, #D1A058 50%, #E0B66E 100%);
```

## 5.3 Gradiente escuro premium

```css
--gradient-dark: radial-gradient(circle at top left, rgba(7, 81, 136, 0.24), transparent 32%),
                 linear-gradient(135deg, #05070C 0%, #080D16 48%, #0B1220 100%);
```

## 5.4 Gradiente IA

```css
--gradient-ai: linear-gradient(135deg, #075188 0%, #7C5CFF 55%, #D1A058 100%);
```

Uso:

* Splash screen.
* Tela inicial.
* Cards de IA.
* Botão “Gerar estudo”.
* Fundo do painel RAG.
* Empty states premium.

---

# 6. Layout geral da aplicação

## 6.1 Estrutura principal

A aplicação deve usar layout em três áreas:

```txt
┌────────────────────────────────────────────────────────────┐
│ Top Bar / Command Bar                                      │
├──────────────┬───────────────────────────────┬─────────────┤
│ Sidebar      │ Área principal de estudo       │ Painel IA   │
│ Navegação    │ Bíblia / Estudos / Busca       │ RAG / notas │
└──────────────┴───────────────────────────────┴─────────────┘
```

### Sidebar esquerda

Contém:

* logo compacta;
* Bíblia;
* Buscar;
* Comparar;
* Original;
* Strong;
* Estudos;
* Cadeias;
* Biblioteca RAG;
* IA;
* Configurações.

Largura recomendada:

```css
--sidebar-width: 280px;
--sidebar-collapsed-width: 76px;
```

### Área central

Usada para:

* leitura bíblica;
* comparação de versões;
* resultados de busca;
* editor de estudos;
* painel interlinear;
* teologia sistemática.

### Painel direito

Usado para:

* IA;
* comentários;
* léxico;
* Strong;
* notas;
* fontes RAG;
* contexto da passagem.

Largura recomendada:

```css
--right-panel-width: 380px;
```

---

# 7. Componentes principais

## 7.1 Botão primário

Visual:

* fundo azul;
* texto claro;
* borda levemente iluminada;
* hover com azul mais claro;
* active com leve redução.

```css
.btn-primary {
  background: var(--gradient-brand);
  color: #FFFFFF;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  box-shadow: var(--shadow-blue-glow);
}
```

Texto recomendado:

* “Abrir Bíblia”
* “Comparar versões”
* “Gerar estudo”
* “Salvar sessão”
* “Indexar fonte”

---

## 7.2 Botão secundário

Visual:

* fundo transparente;
* borda azul suave;
* texto azul claro ou branco suave.

```css
.btn-secondary {
  background: rgba(255,255,255,0.03);
  color: var(--text-main-dark);
  border: 1px solid var(--border-blue-soft);
}
```

---

## 7.3 Botão dourado especial

Usar apenas para ações premium, IA avançada ou destaques.

```css
.btn-gold {
  background: var(--gradient-gold);
  color: #08111F;
  border-radius: 8px;
  font-weight: 700;
  box-shadow: var(--shadow-gold-glow);
}
```

Usar em:

* “Gerar com IA”
* “Criar estudo completo”
* “Comparar tradições”
* “Ativar RAG teológico”
* “Exportar aula”

---

## 7.4 Cards

Cards devem ser sóbrios.

```css
.card {
  background: rgba(16, 24, 39, 0.92);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 20px;
}
```

Card com destaque bíblico:

```css
.card-scripture {
  border-left: 3px solid var(--mr-gold-600);
}
```

Card de IA:

```css
.card-ai {
  border: 1px solid rgba(124, 92, 255, 0.32);
  background: linear-gradient(135deg, rgba(7,81,136,0.18), rgba(124,92,255,0.10));
}
```

Card RAG:

```css
.card-rag {
  border: 1px solid rgba(63,168,120,0.28);
}
```

---

# 8. Ícones e elementos gráficos

## 8.1 Estilo dos ícones

Usar ícones:

* lineares;
* 1.75px ou 2px de espessura;
* cantos arredondados;
* sem preenchimento pesado;
* preferencialmente monocromáticos.

Bibliotecas recomendadas:

```txt
- Lucide Icons
- Phosphor Icons
- Heroicons
```

Estilo:

```css
.icon {
  stroke-width: 1.8;
  color: var(--text-secondary-dark);
}
```

Ícone ativo:

```css
.icon-active {
  color: var(--mr-gold-600);
}
```

---

## 8.2 Ícones principais da aplicação

```txt
Bíblia: livro aberto
Busca: lupa
Comparação: colunas lado a lado
Texto original: caracteres gregos/hebraicos
Strong: etiqueta com número
Léxico: livro com marcador
Estudos: documento editável
Cadeias temáticas: nós conectados
RAG: banco de dados com brilho
IA: estrela/circuito
Teologia: coluna clássica ou pergaminho
Configurações: engrenagem
Web: globo
Fontes: aspas ou documento com link
```

---

## 8.3 Elementos gráficos da marca

A identidade deve usar três elementos recorrentes:

### 1. Coroa fluida

Inspirada na logo. Deve aparecer em:

* splash screen;
* empty states;
* marca d’água discreta;
* tela de login;
* plano premium;
* cabeçalhos institucionais.

Não usar em excesso.

### 2. Linha dourada

Linha horizontal fina, inspirada na composição da logo.

Uso:

* separadores;
* títulos;
* cards premium;
* blocos de citação;
* rodapé de modal.

```css
.gold-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #D1A058, transparent);
}
```

### 3. Bíblia aberta minimalista

Usar como ícone secundário em:

* modo leitura;
* biblioteca;
* exportação;
* documentação;
* splash screen.

---

# 9. Telas principais

## 9.1 Splash Screen

Visual:

* fundo escuro premium;
* logo central;
* coroa dourada com leve glow;
* animação suave de entrada;
* frase curta.

Texto sugerido:

```txt
Move Reino Bible
Estudo bíblico profundo com inteligência e reverência.
```

Animação:

* logo surge com opacidade de 0 a 1;
* coroa dourada aparece com leve traço desenhado;
* brilho sutil no dourado;
* carregamento minimalista.

---

## 9.2 Tela inicial / Dashboard

Deve apresentar:

* saudação;
* passagem do dia;
* estudos recentes;
* botão “Continuar estudo”;
* atalhos rápidos;
* status da IA;
* status da biblioteca RAG.

Layout:

```txt
Topo:
"Bem-vindo ao Move Reino Bible"

Card 1:
Continuar estudo em Romanos 8

Card 2:
Comparar versões

Card 3:
Buscar palavra, tema ou Strong

Card 4:
Criar estudo com IA

Painel lateral:
Sessões recentes / Fontes indexadas
```

---

## 9.3 Tela Bíblia

A tela Bíblia deve ser limpa, com foco no texto.

Elementos:

* seletor de livro;
* seletor de capítulo;
* seletor de versão;
* botão de comparação;
* botão de interlinear;
* botão de IA;
* painel lateral com notas/léxico.

Visual do texto:

```css
.bible-verse-number {
  color: var(--mr-gold-600);
  font-size: 0.72em;
  vertical-align: super;
  margin-right: 4px;
}

.bible-paragraph {
  margin-bottom: 1.4rem;
}
```

Versículo selecionado:

```css
.selected-verse {
  background: rgba(209, 160, 88, 0.12);
  border-left: 3px solid var(--mr-gold-600);
}
```

---

## 9.4 Tela de comparação de versões

Layout com até 4 colunas.

```txt
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ ACF         │ KJV         │ Grego       │ Comentário  │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ João 1:1    │ John 1:1    │ Ἐν ἀρχῇ... │ Análise...  │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

Regras visuais:

* cada coluna deve ter cabeçalho fixo;
* versão ativa em azul;
* texto original com tipografia própria;
* diferenças destacadas em dourado suave;
* divergências relevantes com marcador discreto.

---

## 9.5 Tela de texto original

Deve parecer técnica, acadêmica e clara.

Cada palavra original deve virar um token clicável:

```txt
Ἐν     ἀρχῇ     ἦν     ὁ     λόγος
G1722  G746      G2258  G3588  G3056
```

Ao clicar:

* lema;
* Strong;
* morfologia;
* tradução;
* ocorrências;
* definição;
* exemplos.

Visual:

```css
.original-token {
  border-bottom: 1px dotted rgba(209,160,88,0.5);
  cursor: pointer;
}

.original-token:hover {
  background: rgba(209,160,88,0.10);
}
```

---

## 9.6 Tela Strong / Léxico

Layout recomendado:

```txt
Strong G3056 — λόγος

Definição curta
Uso bíblico
Morfologia
Ocorrências
Distribuição por livro
Passagens principais
Comentários lexicais
```

Visual:

* número Strong em dourado;
* lema em fonte grega/hebraica;
* cards para definições;
* tabela de ocorrências;
* gráfico discreto de frequência.

---

## 9.7 Tela de busca

A busca deve ser uma das experiências mais importantes do app.

Campo principal:

```txt
Buscar palavra, tema, Strong, passagem ou pergunta...
```

Tipos de busca:

* Texto bíblico.
* Palavra exata.
* Strong.
* Lema.
* Tema.
* Teologia.
* RAG.
* Web.

Visual dos resultados:

```txt
[João 1:1] No princípio era o Verbo...
Versão: ACF | Strong detectado: G3056 | Tema: Cristo, Palavra
```

Destaques:

* termo encontrado em azul claro;
* Strong em dourado;
* fonte RAG em verde;
* web em ciano.

---

## 9.8 Tela de IA

O painel de IA deve ser elegante e controlado, sem parecer chatbot genérico.

Nome recomendado:

```txt
Assistente de Estudo
```

Ou:

```txt
IA de Estudo Bíblico
```

Modos:

```txt
- Explicar passagem
- Analisar texto original
- Comparar tradições
- Criar sermão
- Criar estudo
- Gerar perguntas
- Consultar RAG
```

Visual:

* avatar abstrato com coroa/estrela;
* caixa de prompt ampla;
* seletor de modo;
* indicação do modelo;
* fontes usadas;
* botão “Inserir no estudo”.

Mensagem da IA deve conter blocos:

```txt
Resumo
Contexto
Análise lexical
Interpretações por tradição
Fontes consultadas
Aplicação
Limites da resposta
```

---

## 9.9 Tela RAG teológico

Deve parecer uma biblioteca curada, não apenas upload de PDF.

Elementos:

* lista de documentos;
* tradição;
* autor;
* século;
* licença;
* tipo de fonte;
* status de indexação;
* qualidade da fonte.

Badges:

```txt
Patrística
Reformada
Católica
Metodista
Pentecostal
Comentário
Confissão
Teologia Sistemática
Domínio Público
Licença Verificada
```

Cores:

* tradição: azul;
* licença verificada: verde;
* fonte clássica: dourado;
* alerta de licença: vermelho;
* em processamento: amarelo.

---

## 9.10 Editor de estudos

O editor deve permitir criar materiais de alto nível.

Blocos:

```txt
- Título
- Texto bíblico
- Nota pessoal
- Comentário
- Citação
- Resposta IA
- Fonte RAG
- Aplicação
- Pergunta
- Esboço
- Oração
```

Visual:

* editor limpo;
* barra lateral com estrutura;
* botão de IA contextual;
* exportação em Markdown/PDF;
* referências vinculadas.

---

# 10. Estados visuais

## 10.1 Empty State

Quando não houver conteúdo, usar ilustração minimalista dourada/azul.

Exemplo:

```txt
Nenhum estudo criado ainda.
Comece escolhendo uma passagem bíblica ou tema.
[Criar primeiro estudo]
```

## 10.2 Loading

Evitar spinners genéricos. Usar:

* linha dourada animada;
* shimmer discreto;
* coroa desenhada progressivamente;
* skeleton loading.

## 10.3 Erro

Visual:

* card com borda vermelha suave;
* texto direto;
* opção de tentar novamente.

Exemplo:

```txt
Não foi possível carregar esta versão bíblica.
Verifique a origem do conteúdo ou tente novamente.
```

## 10.4 Sucesso

Visual:

* toast discreto;
* ícone verde;
* mensagem curta.

```txt
Estudo salvo com sucesso.
Fonte indexada na biblioteca RAG.
Chave de API validada.
```

---

# 11. Design responsivo

## 11.1 Desktop

Prioridade principal.

Resolução mínima recomendada:

```txt
1366 × 768
```

Resolução ideal:

```txt
1920 × 1080 ou superior
```

O app deve aproveitar telas grandes para comparação, múltiplas colunas e painéis laterais.

## 11.2 Tablet

Layout adaptado:

* sidebar recolhida;
* painel IA em drawer;
* comparação limitada a 2 colunas por vez;
* leitura otimizada.

## 11.3 Mobile futuro

No mobile, priorizar:

* leitura;
* busca;
* notas;
* IA;
* estudos salvos.

Evitar tentar exibir 4 colunas simultâneas no celular.

---

# 12. Microinterações e animações

As animações devem ser suaves, discretas e elegantes.

Regras:

```txt
Duração curta: 120ms
Duração média: 220ms
Duração longa: 420ms
Easing: ease-out ou cubic-bezier(0.22, 1, 0.36, 1)
```

Usar animações em:

* abertura de painéis;
* hover de cards;
* seleção de versículo;
* carregamento de IA;
* expansão de léxico;
* troca de versão;
* indexação RAG.

Evitar:

* animações exageradas;
* pulos;
* efeitos neon fortes;
* excesso de partículas;
* transições lentas.

---

# 13. Acessibilidade

A aplicação deve ser confortável para estudo prolongado.

Obrigatório:

* contraste alto;
* tamanho de fonte ajustável;
* modo escuro e claro;
* espaçamento ajustável no texto bíblico;
* atalhos de teclado;
* navegação por teclado;
* suporte a leitores de tela;
* foco visível;
* opção de reduzir animações.

Configurações de leitura:

```txt
- Tamanho da fonte
- Altura da linha
- Espaçamento entre parágrafos
- Modo escuro
- Modo claro
- Modo sépia
- Fonte serifada ou sans
- Largura da coluna
```

---

# 14. Sistema de temas

## 14.1 Tema Reino Dark

Tema padrão.

```css
:root[data-theme="reino-dark"] {
  --background: #080D16;
  --surface: #0B1220;
  --surface-elevated: #101827;
  --primary: #075188;
  --accent: #D1A058;
  --text-main: #F5F0E8;
  --text-secondary: #C9D2DE;
}
```

## 14.2 Tema Pergaminho Light

Tema claro para leitura.

```css
:root[data-theme="scroll-light"] {
  --background: #FBF8F1;
  --surface: #FFFFFF;
  --surface-elevated: #F5EFE3;
  --primary: #075188;
  --accent: #A97832;
  --text-main: #172033;
  --text-secondary: #3E4A5C;
}
```

## 14.3 Tema Noite Profunda

Tema ultra escuro.

```css
:root[data-theme="deep-night"] {
  --background: #030509;
  --surface: #070B12;
  --surface-elevated: #0B1220;
  --primary: #126EAF;
  --accent: #E0B66E;
  --text-main: #F7F2EA;
  --text-secondary: #B8C2D0;
}
```

---

# 15. Estilo dos blocos de conteúdo bíblico

## 15.1 Citação bíblica

```css
.scripture-quote {
  border-left: 3px solid var(--accent);
  padding: 16px 20px;
  background: rgba(209,160,88,0.08);
  font-family: var(--font-bible);
  line-height: 1.8;
}
```

## 15.2 Referência bíblica

```css
.bible-reference {
  color: var(--accent);
  font-weight: 700;
  letter-spacing: 0.02em;
}
```

## 15.3 Nota teológica

```css
.theology-note {
  background: rgba(7,81,136,0.14);
  border: 1px solid rgba(7,81,136,0.34);
  border-radius: 12px;
}
```

## 15.4 Citação de fonte RAG

```css
.rag-citation {
  color: #3FA878;
  border-bottom: 1px dotted rgba(63,168,120,0.6);
}
```

---

# 16. Design dos badges

Badges devem ser pequenos, elegantes e informativos.

```css
.badge {
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
}
```

Exemplos:

```txt
Grego
Hebraico
Strong
RAG
IA
Fonte verificada
Domínio público
Comentário
Patrística
Reformada
Católica
Metodista
Pentecostal
```

Cores:

```css
.badge-gold {
  background: rgba(209,160,88,0.14);
  color: #E0B66E;
  border: 1px solid rgba(209,160,88,0.32);
}

.badge-blue {
  background: rgba(7,81,136,0.18);
  color: #8AC7F4;
  border: 1px solid rgba(7,81,136,0.38);
}

.badge-green {
  background: rgba(63,168,120,0.14);
  color: #76D9A5;
  border: 1px solid rgba(63,168,120,0.34);
}

.badge-purple {
  background: rgba(124,92,255,0.14);
  color: #B8A8FF;
  border: 1px solid rgba(124,92,255,0.34);
}
```

---

# 17. Layout do painel de IA com RAG

O painel de IA deve sempre mostrar transparência sobre fontes.

Estrutura visual:

```txt
┌───────────────────────────────┐
│ IA de Estudo Bíblico           │
│ Modelo: GPT / Claude / Local   │
├───────────────────────────────┤
│ Pergunta do usuário            │
├───────────────────────────────┤
│ Resposta estruturada           │
│ - Síntese                      │
│ - Exegese                      │
│ - Tradições                    │
│ - Aplicação                    │
├───────────────────────────────┤
│ Fontes usadas                  │
│ [Calvino] [Wesley] [Strong]    │
└───────────────────────────────┘
```

Cada resposta deve ter botões:

```txt
- Inserir no estudo
- Copiar
- Regenerar
- Ver fontes
- Comparar tradições
- Exportar
```

---

# 18. Identidade visual dos módulos

Cada módulo pode ter uma cor auxiliar, mantendo azul e dourado como base.

```txt
Bíblia: Azul Reino
Texto original: Dourado
Strong/Léxico: Ciano
Estudos: Verde
IA: Roxo
RAG: Verde profundo
Teologia sistemática: Dourado escuro
Web: Azul claro
Admin: Cinza técnico
```

---

# 19. Regras de uso da logo

## 19.1 Versão principal

Usar a logo completa em:

* splash screen;
* tela de login;
* documentação;
* site;
* capa de PDF;
* página inicial.

## 19.2 Versão horizontal

Criar versão horizontal para:

* top bar;
* website;
* relatórios;
* cabeçalhos.

## 19.3 Versão compacta

Criar símbolo reduzido com:

* coroa;
* letra “o” estilizada;
* Bíblia aberta;
* ou monograma “MR”.

Uso:

* favicon;
* ícone do app;
* sidebar recolhida;
* loading;
* avatar da IA.

## 19.4 Área de respiro

A logo deve ter margem mínima equivalente à altura da letra “m” minúscula ao redor.

## 19.5 Fundos permitidos

Permitidos:

* fundo escuro;
* fundo claro premium;
* fundo transparente;
* azul profundo;
* textura sutil de papel.

Evitar:

* fundos coloridos fortes;
* gradientes agressivos;
* imagens poluídas;
* baixo contraste.

---

# 20. Estilo do ícone do aplicativo

O ícone do aplicativo deve ser derivado da marca, não apenas a logo reduzida.

Conceito recomendado:

```txt
Fundo azul profundo.
Coroa dourada fluida no centro.
Pequena Bíblia aberta na base.
Brilho sutil e borda premium.
```

Versões:

```txt
- Windows .ico
- macOS .icns
- PNG 1024x1024
- PNG 512x512
- PNG 256x256
- PNG 128x128
- PNG 64x64
- PNG 32x32
```

---

# 21. Estilo das ilustrações

As ilustrações devem ser minimalistas, lineares e nobres.

Temas permitidos:

* Bíblia aberta;
* pergaminho;
* lâmpada antiga;
* coluna clássica;
* coroa;
* pena;
* mapa bíblico;
* biblioteca;
* manuscrito;
* rolo do mar morto estilizado;
* rede de conhecimento;
* partículas discretas de IA.

Estilo:

```txt
- linha fina;
- azul e dourado;
- sem rostos humanos;
- sem imagens de Jesus;
- sem iconografia polêmica;
- sem excesso denominacional;
- sem estética infantil.
```

---

# 22. Estilo de gráficos e dados

Para frequência de palavras, ocorrências Strong e estatísticas bíblicas:

* fundo transparente;
* linhas finas;
* azul para dados principais;
* dourado para destaque;
* verde para RAG;
* sem cores gritantes;
* labels limpos.

Exemplos de gráficos:

```txt
- Ocorrências por livro
- Frequência por autor
- Distribuição no AT/NT
- Relação entre temas
- Rede de passagens paralelas
- Tradições interpretativas por fonte
```

---

# 23. Design para documentos exportados

PDFs, estudos e aulas exportadas devem seguir a mesma identidade.

Capa:

```txt
Logo Move Reino Bible
Título do estudo
Passagem bíblica
Autor
Data
Linha dourada
```

Interior:

* títulos em azul;
* subtítulos em dourado;
* citações bíblicas com borda dourada;
* notas em cards suaves;
* rodapé com referência;
* fontes ao final.

---

# 24. Tom visual da aplicação

A aplicação deve comunicar:

```txt
“Você está entrando em um ambiente sério de estudo bíblico, mas com ferramentas modernas e inteligentes.”
```

Não deve comunicar:

```txt
“App devocional simples.”
“Chatbot religioso.”
“Site genérico de Bíblia.”
“Ferramenta acadêmica fria e sem espiritualidade.”
```

---

# 25. Design tokens finais

```css
:root {
  /* Brand */
  --mr-blue-900: #003A66;
  --mr-blue-800: #004A80;
  --mr-blue-700: #075188;
  --mr-blue-600: #0B5D9A;
  --mr-blue-500: #126EAF;

  --mr-gold-900: #8A6125;
  --mr-gold-800: #A97832;
  --mr-gold-700: #C38E42;
  --mr-gold-600: #D1A058;
  --mr-gold-500: #E0B66E;

  /* Dark theme */
  --bg-dark-950: #05070C;
  --bg-dark-900: #080D16;
  --bg-dark-850: #0B1220;
  --bg-dark-800: #101827;
  --bg-dark-700: #172033;

  /* Light theme */
  --bg-light-50: #FBF8F1;
  --bg-light-100: #F5EFE3;
  --bg-light-200: #ECE1D0;
  --bg-light-300: #DED0BA;

  /* Text */
  --text-main-dark: #F5F0E8;
  --text-secondary-dark: #C9D2DE;
  --text-muted-dark: #8D9AAD;

  --text-main-light: #172033;
  --text-secondary-light: #3E4A5C;
  --text-muted-light: #6B7280;

  /* Functional */
  --success: #2FA36B;
  --warning: #D6A13D;
  --danger: #C94A4A;
  --info: #2F80C8;
  --ai-purple: #7C5CFF;
  --rag-green: #3FA878;
  --source-cyan: #3AAED8;

  /* Radius */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 24px;

  /* Typography */
  --font-brand: "Cinzel", "Cormorant Garamond", "Times New Roman", serif;
  --font-ui: "Inter", "Manrope", "Segoe UI", Arial, sans-serif;
  --font-bible: "Merriweather", "Crimson Pro", Georgia, serif;
  --font-greek: "SBL Greek", "Cardo", "Noto Serif", serif;
  --font-hebrew: "SBL Hebrew", "Ezra SIL", "Noto Serif Hebrew", serif;

  /* Shadows */
  --shadow-soft: 0 8px 24px rgba(0, 0, 0, 0.22);
  --shadow-panel: 0 16px 48px rgba(0, 0, 0, 0.35);
  --shadow-gold-glow: 0 0 24px rgba(209, 160, 88, 0.18);
  --shadow-blue-glow: 0 0 24px rgba(7, 81, 136, 0.26);

  /* Borders */
  --border-dark: rgba(255, 255, 255, 0.08);
  --border-gold-soft: rgba(209, 160, 88, 0.28);
  --border-blue-soft: rgba(18, 110, 175, 0.28);

  /* Gradients */
  --gradient-brand: linear-gradient(135deg, #003A66 0%, #075188 48%, #126EAF 100%);
  --gradient-gold: linear-gradient(135deg, #8A6125 0%, #D1A058 50%, #E0B66E 100%);
  --gradient-ai: linear-gradient(135deg, #075188 0%, #7C5CFF 55%, #D1A058 100%);
}
```

---

# 26. Critérios de aceite visual

A interface será considerada aprovada quando atender aos seguintes critérios:

```txt
1. A logo funciona bem no tema escuro e claro.
2. O azul e o dourado são usados com consistência.
3. A aplicação parece premium, séria e bíblica.
4. O texto bíblico é confortável para leitura prolongada.
5. A comparação de versões é clara mesmo com 4 colunas.
6. Os módulos de IA e RAG são visualmente distintos.
7. O app não parece genérico ou copiado de outro software bíblico.
8. O visual mantém coerência entre desktop, web e documentos exportados.
9. O usuário identifica facilmente: Bíblia, Strong, IA, RAG, Estudos e Busca.
10. A interface respeita acessibilidade mínima de contraste, foco e leitura.
```

---

# 27. Diretriz final para o desenvolvedor

Todo novo componente criado para o Move Reino Bible deve seguir esta ordem de decisão visual:

```txt
1. Fundo escuro premium ou papel claro.
2. Azul Reino para estrutura e ações principais.
3. Dourado Coroa para nobreza, destaque bíblico e marca.
4. Tipografia serifada para conteúdo bíblico e institucional.
5. Tipografia sans moderna para interface.
6. Ícones lineares e discretos.
7. Cards sóbrios, bordas suaves e pouco ruído visual.
8. IA e RAG sempre com fontes, badges e estados claros.
9. Nada visualmente exagerado, caricatural ou infantil.
10. O estudo bíblico deve permanecer no centro da experiência.
```
