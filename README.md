<div align="center">

# 📚 HQs Collections `v1.1.0` - Mobile First Collection Manager
### *Gerenciador Ágil de Coleções de Quadrinhos e Minisséries*

[![Version](https://img.shields.io/badge/version-1.1.0-amber?style=for-the-badge&logo=semver&logoColor=white)](#)
[![Powered by Antigravity](https://img.shields.io/badge/Powered%20by-Google%20Antigravity-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/antigravity/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

<p align="center">
  <b>Inglês / English</b> | <a href="#versão-em-português-brasil"><b>Português (Brasil)</b></a>
</p>

</div>

---

## 🇺🇸 English

### 🎯 Overview
**HQs Collections** (v1.1.0) is an ultra-fast, mobile-first web application designed for comic book readers and collectors to track monthly publications, collections, and miniseries in a single streamlined screen. It features an intuitive chunking mechanism that displays issues in groups of 10 in a single continuous row, auto-collapsing completed intervals (e.g. `01..10`), a 4-stage interactive cycle with neon visual cues, and an automated background cover scraper with curation and approval flows.

### ✨ Key Features in `v1.1.0`
- **4-Stage Issue Cycle (Edit Mode):**
  - **Stage 1 (1st Click):** Solid Yellow (`owned`) — "Bought / Owned".
  - **Stage 2 (2nd Click):** Solid Yellow + Neon Blue Glow (`read`) — "Owned & Read".
  - **Stage 3 (3rd Click):** Hollow + Neon Pink Glow (`wishlist`) — "Want to Buy".
  - **Stage 4 (4th Click):** Default unselected state (`none`) — "Do Not Own / Do Not Plan to Buy".
- **4-Stage Search & View Filters:** Filter instantly by All, Owned, Read, Wishlist (Want to Buy), or Not Planned.
- **Background Cover Scraper:** Intelligent scraper running asynchronously in the background. Prioritizes recent editions and scans Panini, Marvel/DC databases (Fandom MediaWiki API), and OpenLibrary with zero rate limits or CORS blocks.
- **Header Live Progress Indicator:** Header displays live percentage (`🖼️ Capas: XX%`) of processed cover searches across all collection issues with subtle pulse animations.
- **Aesthetic Comic Frame & Cover Approval Flow:** High-impact 2:3 aspect ratio modal with artwork preview. When a cover candidate is scraped, it presents a pending approval state with a green checkmark button (`✓`) to permanently fix the image to that issue.
- **Dual Mode (Consultation vs. Edit):** Header toggle switch with visual icons. Consultation mode is default upon launch. Switching to Edit mode transitions the app background to an elevated lighter blue tone.
- **Strict 10-Issue Single-Row Grid:** Issues 01..10 always display in a single, uninterrupted horizontal line on any mobile or desktop screen.
- **Direct & Detailed Addition:** Fast on-screen addition, plus a dedicated "Detailed Inclusion" dialog capturing Start Year, Brazilian Publisher, and Main Hero/Group.
- **Drag-and-Drop & Custom Ordering:** Personal reordering (Drag & Drop or up/down buttons) alongside A-Z and Z-A sorting.
- **Cloud & Offline Sync:** Firebase Firestore real-time sync with automatic local storage fallback.

### 🤖 Powered by Google Antigravity
This application was architected and built using **Google Antigravity**, utilizing the 3-Layer Agentic Architecture:
- **Layer 1 (Directives):** High-reliability standard operating procedures in `/directives/`.
- **Layer 2 (Orchestration):** Antigravity Intelligent Decision Agent (`agente-orquestrador`).
- **Layer 3 (Execution):** Deterministic tool-first scripts in `/execution/`.

**Agent & Skill Packs Activated:**
- `agente-orquestrador` (Tri-layer architecture conductor)
- `clean-code` & `frontend-design` (Pragmatic, responsive UI/UX architecture)
- `firebase-firestore` (Cloud Firestore modeling & security rules)

---

## 🇧🇷 Versão em Português (Brasil)

### 🎯 Visão Geral
O **HQs Collections** (v1.1.0) é uma aplicação web mobile-first ultra-rápida criada sob medida para colecionadores de quadrinhos organizarem edições mensais, coleções e minisséries em apenas uma tela. O sistema emprega uma lógica inteligente de blocos de 10 edições sempre exibidas em linha única contínua, ciclo interativo de 4 estágios com destaque em neon, busca automática de capas em segundo plano e fluxo de curadoria com aprovação visual.

### ✨ Novidades da Versão `1.1.0`
- **Ciclo de 4 Estágios por Edição (Modo Edição):**
  - **1º Clique (Amarelo):** `owned` — Edição comprada / adquirida (Tenho).
  - **2º Clique (Amarelo com Borda Azul Neon):** `read` — Edição comprada e lida (Lida).
  - **3º Clique (Desmarcado com Borda Pink Neon):** `wishlist` — Edição desejada (Quero Comprar).
  - **4º Clique (Original Desmarcado):** `none` — Não possuo e não pretendo comprar.
- **Filtros dos 4 Estágios:** Painel de filtros permite isolar edições por status: *Todas as Edições*, *Compradas (Tenho)*, *Lidas (Azul Neon)*, *Quero Comprar (Pink)* e *Não Pretendo*.
- **Scraper de Capas em Segundo Plano:** Motor assíncrono que busca capas sem travar a interface, priorizando publicações mais recentes e consultando Panini, Marvel/DC Fandom e OpenLibrary via endpoints com CORS habilitado.
- **Progresso de Buscas no Cabeçalho:** O Header exibe em tempo real a porcentagem (`🖼️ Capas: XX%`) de edições com busca completada em relação ao total de edições da coleção.
- **Card de Detalhes Estético & Aprovação de Capa:** Modal com moldura ampla de quadrinho (proporção áurea 2:3). Ao encontrar uma nova capa, o sistema a apresenta como pendente de aprovação com botão verde (`✓`), permitindo ao usuário fixar a imagem oficial com um único clique.
- **Alternância de Modos (Consulta vs. Edição):** Botão visual no cabeçalho com ícones distintos. O sistema sempre inicia no **Modo Consulta** por padrão. Ao entrar no **Modo Edição**, o fundo da aplicação transiciona suavemente para um tom azul mais claro.
- **Bolinhas Sempre em Linha Única:** O bloco de edições exibe estritamente as 10 bolinhas em uma só linha horizontal (`grid-cols-10`), garantindo consistência visual em qualquer celular.
- **Inclusão Direta e Detalhada:** Permite cadastro rápido na própria tela ou abertura da **Inclusão Detalhada** com campos para Ano de Início, Editora de Venda no Brasil e Herói / Grupo Principal.
- **Ordenação Inteligente:** Alternância entre A-Z, Z-A e Ordem Pessoal com arrastar e soltar nativo (Drag and Drop) ou botões de movimentação.
- **Sincronização em Nuvem:** Firebase Firestore em tempo real com fallback automático para armazenamento local.

### 🤖 Desenvolvido com Google Antigravity
Projeto concebido e executado através do ecossistema **Google Antigravity**, operando na Arquitetura de 3 Camadas:
- **Camada 1 (Diretivas):** SOPs estratégicos em `/directives/`.
- **Camada 2 (Orquestração):** Inteligência central via Agente Orquestrador (`agente-orquestrador`).
- **Camada 3 (Execução):** Scripts utilitários determinísticos em `/execution/`.

**Agentes de IA e Skill Packs Utilizados:**
- `agente-orquestrador` (Orquestração determinística e auto-recuperação)
- `clean-code` & `frontend-design` (Padrões de clean code e design mobile-first refinado)
- `firebase-firestore` (Modelagem e sincronização no Cloud Firestore)

---
*Desenvolvido com foco no padrão de excelência SENAI & Google DeepMind Antigravity.*
