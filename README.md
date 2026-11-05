<div align="center">

# 📚 HQs Collections `v1.8.0` - Mobile First Collection Manager
### *Gerenciador Ágil de Coleções de Quadrinhos e Minisséries*

[![Version](https://img.shields.io/badge/version-1.8.0-amber?style=for-the-badge&logo=semver&logoColor=white)](#)
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
**HQs Collections** (v1.8.0) is an ultra-fast, mobile-first web application designed for comic book readers and collectors to track monthly publications, collections, and miniseries in a single streamlined screen. It features automated intelligent series propagation when confirming an issue cover (propagating aligned covers across all unapproved issues of the comic), a 3-mode cyclic header toggle with the **Cover View Mode** (`ScanEye`), conditional cover carousel lifecycle, a custom confirmation alert dialog for unlinking covers, and high-precision Panini Brasil scraper.

### ✨ Key Features in `v1.8.0`
- **Intelligent Series Propagation:** Approving and fixing a cover on an issue (e.g. *Wolverine #16*) captures the series metadata (Year, Volume, Publisher/Source). The engine automatically searches and proposes covers from that exact same series for all other unapproved issues of that comic.
- **Pending Confirmation Safeguard:** Propagated covers are placed in pending state (`status: pending`) with the green checkmark (`✓`), allowing collectors to review each image before official fixation.
- **Real-Time Series Toast Notifications:** Discreet non-intrusive status banner at the top keeping the user informed of active series scraping and alignment completion.
- **Series Badges:** Direct visual cues indicating the aligned series on issue detail modals and cover search status panels.
- **Cover View Mode (`ScanEye`):** Dedicated compact 2-column grid view displaying the official cover of the highest owned issue of each comic collection.
  - **Line 1:** Comic title and highest owned issue number (e.g. *Wolverine #16* or *(Sem ed.)*).
  - **Line 2:** Compact Publisher and Format badges (e.g. *[Marvel] [Mensal]*).
  - **Cover Display:** High-fidelity 2:3 comic aspect ratio artwork with issue badge and fixed status.
- **3-Mode Header Cycle:** Smooth 3-state navigation button:
  - `Eye`: Standard Consultation Mode (10-issue interactive blocks).
  - `Pencil`: Edit Mode (4-stage status assignment and issue title setting).
  - `ScanEye`: Cover View Mode (2-column compact catalog cards).
- **Direct Card Interaction:** Tapping any compact card immediately opens the Issue Detail Modal for that edition.
- **Conditional Carousel Lifecycle:** Once an official cover is approved and fixed to an issue, the suggestions carousel is cleanly hidden to keep the interface uncluttered.
- **Custom Unlink Confirmation Alert:** Dedicated dark-themed alert modal with warning badge, issue preview, and confirmation prompt before removing fixed covers.
- **Instant Carousel Reopening on Unlink:** Confirming unlinking removes the fixed cover and immediately re-queries and displays the alternatives carousel.

### 🤖 Powered by Google Antigravity
This application was architected and built using **Google Antigravity**, utilizing the 3-Layer Agentic Architecture:
- **Layer 1 (Directives):** High-reliability standard operating procedures in `/directives/`.
- **Layer 2 (Orchestration):** Antigravity Intelligent Decision Agent (`agente-orquestrador`).
- **Layer 3 (Execution):** Deterministic tool-first scripts in `/execution/`.

---

## 🇧🇷 Versão em Português (Brasil)

### 🎯 Visão Geral
O **HQs Collections** (v1.8.0) é uma aplicação web mobile-first ultra-rápida criada sob medida para colecionadores de quadrinhos organizarem edições mensais, coleções e minisséries em apenas uma tela. O sistema emprega uma lógica inteligente de blocos de 10 edições sempre exibidas em linha única contínua, propagação automatizada de séries de capas a partir de confirmação de edições, alternador de 3 modos no cabeçalho com o **Modo Consulta Capa** em grade de 2 colunas, ciclo condicional de fechamento do carrossel ao fixar capa, modal de alerta customizado com confirmação para desvinculação e motor de busca Panini Brasil hiper-otimizado.

### ✨ Novidades da Versão `1.8.0`
- **Propagação Inteligente de Séries de Capas:** Ao escolher e aprovar a capa de uma edição (ex: *Wolverine #16* da Panini 2025 ou Fandom Vol 8), o sistema memoriza a série identificada e busca automaticamente capas da mesma série para todas as outras edições daquela HQ que ainda não possuem capa fixada.
- **Confirmação Pendente Segura:** Todas as novas capas sugeridas permanecem pendentes de aprovação, garantindo total controle ao usuário para revisar e confirmar individualmente com o botão verde (`✓`).
- **Banner / Toast Discreto em Tempo Real:** Notificação informativa no topo do aplicativo exibindo o andamento do alinhamento da série e avisando quando as sugestões estiverem prontas.
- **Badges de Série Reconhecida:** Indicativo visual claro (`⚡ Série: [Ano/Fonte]`) exibido na tela de detalhes da edição e no painel detalhado de status de busca.
- **Novo Modo Consulta Capa (`ScanEye`):** Visualização compacta em grade (2 colunas no mobile, responsivo para até 5 colunas em telas maiores) destacando a capa e informações da última edição adquirida.
  - **Linha 1:** Nome da HQ e número da última edição que tenho (ex: *Wolverine #16* ou *Wolverine (Sem ed.)*).
  - **Linha 2:** Badges compactos com a **Editora** e o **Tipo de Publicação** (ex: *[Marvel] [Mensal]*).
  - **Capa da Última Edição:** Arte ampliada em proporção 2:3 com badge de numeração e status fixado.
- **Ciclo de 3 Modos no Cabeçalho:** Botão único com ciclo contínuo:
  - `Eye`: Modo Consulta tradicional com blocos táteis de 10 em 10 edições.
  - `Pencil`: Modo Edição para preenchimento dos 4 estágios táteis e nomes de edições.
  - `ScanEye`: Modo Consulta Capa para navegação visual rápida no catálogo de capas.
- **Toque Interativo:** Ao tocar em qualquer card compacto, o sistema abre diretamente o Modal de Detalhes daquela edição.
- **Fechamento Automático do Carrossel ao Fixar:** Quando uma edição possui uma capa oficial fixada, o carrossel de sugestões é automaticamente ocultado.
- **Modal de Confirmação Customizado para Desvincular Capa:** Proteção explícita contra cliques acidentais com opções "Cancelar" e "Sim, Desvincular".
- **Reabertura Imediata do Carrossel ao Desvincular:** Confirmada a desvinculação, a capa é removida e o carrossel de alternativas é **imediatamente recarregado e reaberto**.

### 🤖 Desenvolvido com Google Antigravity
Projeto concebido e executado através do ecossistema **Google Antigravity**, operando na Arquitetura de 3 Camadas:
- **Camada 1 (Diretivas):** SOPs estratégicos em `/directives/`.
- **Camada 2 (Orquestração):** Inteligência central via Agente Orquestrador (`agente-orquestrador`).
- **Camada 3 (Execução):** Scripts utilitários determinísticos em `/execution/`.

---
*Desenvolvido com foco no padrão de excelência SENAI & Google DeepMind Antigravity.*
