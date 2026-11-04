<div align="center">

# 📚 HQs Collections `v1.4.0` - Mobile First Collection Manager
### *Gerenciador Ágil de Coleções de Quadrinhos e Minisséries*

[![Version](https://img.shields.io/badge/version-1.4.0-amber?style=for-the-badge&logo=semver&logoColor=white)](#)
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
**HQs Collections** (v1.4.0) is an ultra-fast, mobile-first web application designed for comic book readers and collectors to track monthly publications, collections, and miniseries in a single streamlined screen. It features an intuitive chunking mechanism displaying issues in groups of 10 in a single continuous row, an inline expandable carousel of all found cover occurrences upon rejection or gallery exploration, batch curatorship controls ("Accept All" / "Reject All"), chronological volume ranking prioritizing newest releases (2025/2026), zero-repetition issue cover matching, and automatic progressive fallback.

### ✨ Key Features in `v1.4.0`
- **Inline Multi-Cover Carousel on Rejection:** Rejecting a cover on the status screen automatically expands the issue row and queries for all matching occurrences across Panini and Web sources, displaying a horizontal scrollable gallery with year, volume, and publication source.
- **Selectable Alternatives:** Tapping any cover in the carousel sets it as the new pending candidate with a checkmark (`✓`) ready to confirm and lock as official.
- **Dedicated Gallery Button (`Images`):** Collectors can tap the gallery icon on any issue row at any time to browse and alternate between all known variant covers.
- **Batch Cover Actions ("Accept All" / "Reject All"):** Directly in the Cover Search Dashboard, collectors can approve or reject all pending covers at once with a single tap.
- **Strict Integrity Guarantee:** Batch actions operate exclusively on covers pending approval (`status === 'pending'`), never modifying or unlinking already approved/fixed artwork.
- **Chronological Volume & Year Ranking (Newest First):** Always searches for the newest publication (e.g. 2025/2026 runs, Volume 8 for Wolverine) before considering older legacy volumes.
- **Strict Issue Number Validation (`matchIssueNumber`):** Completely eliminates duplicate covers across issues.
- **Interactive Cover Status (Icon & Percentage Only):** Clean header indicator showing strictly `🖼️ XX%` to open the Cover Search Dashboard.
- **Text-Free Individual Curatorship:** Dedicated text-free buttons (`✓` green to approve, `✗` red to reject) on cards and modal items.

### 🤖 Powered by Google Antigravity
This application was architected and built using **Google Antigravity**, utilizing the 3-Layer Agentic Architecture:
- **Layer 1 (Directives):** High-reliability standard operating procedures in `/directives/`.
- **Layer 2 (Orchestration):** Antigravity Intelligent Decision Agent (`agente-orquestrador`).
- **Layer 3 (Execution):** Deterministic tool-first scripts in `/execution/`.

---

## 🇧🇷 Versão em Português (Brasil)

### 🎯 Visão Geral
O **HQs Collections** (v1.4.0) é uma aplicação web mobile-first ultra-rápida criada sob medida para colecionadores de quadrinhos organizarem edições mensais, coleções e minisséries em apenas uma tela. O sistema emprega uma lógica inteligente de blocos de 10 edições sempre exibidas em linha única contínua, carrossel tátil expansível na própria linha com todas as ocorrências de capas ao rejeitar ou pelo botão de galeria, ações de curadoria em lote ("Aceitar Todos" e "Rejeitar Todos"), ordenação cronológica rigorosa priorizando publicações mais recentes (2025/2026) e validação estrita de número de edição.

### ✨ Novidades da Versão `1.4.0`
- **Carrossel Horizontal de Todas as Ocorrências de Capas:** Ao clicar no botão rejeitar (`✗`) na tela de status de busca, a linha da edição se expande suavemente e busca todas as ocorrências daquela HQ e número na Panini Brasil e Web (MediaWiki volumes 10 a 1 e OpenLibrary).
- **Seleção Tátil Direta:** O usuário rola o carrossel horizontal, visualiza miniaturas com ano e volume, e ao tocar em qualquer opção ela é definida como a nova candidata pendente com o botão verde (`✓`) pronto para aprovação.
- **Botão de Galeria de Capas (`Images`):** Permite abrir o carrossel de variantes daquela edição a qualquer momento diretamente na linha, sem necessidade de rejeitar previamente.
- **Ações em Lote no Painel de Capas ("Aceitar Todos" / "Rejeitar Todos"):** Um clique aprova todas as capas pendentes de uma só vez (gravando no Firestore/LocalStorage via `saveComicsBatch`) ou rejeita todas, buscando alternativas.
- **Proteção Estrita de Integridade:** As ações em lote afetam *exclusivamente* as capas pendentes de aprovação, mantendo 100% intactas todas as capas já aprovadas.
- **Prioridade para Lançamentos Mais Recentes (2025/2026):** O motor de scraping busca sistematicamente as publicações mais novas (anos 2025/2026 na Panini Brasil e maiores volumes na Fandom, como Vol 8 > Vol 7 > Vol 6 para o Wolverine).
- **Filtro Rigoroso de Numeração (`matchIssueNumber`):** Elimina o problema de capas repetidas em edições diferentes.
- **Monitor de Capas no Header (Apenas Ícone e Porcentagem):** Botão sem texto exibindo unicamente `🖼️ XX%`.
- **Curadoria Individual Sem Texto:** Botões dedicados **SEM TEXTO** (`✓` em verde esmeralda para aprovar, `✗` em vermelho suave para rejeitar).

### 🤖 Desenvolvido com Google Antigravity
Projeto concebido e executado através do ecossistema **Google Antigravity**, operando na Arquitetura de 3 Camadas:
- **Camada 1 (Diretivas):** SOPs estratégicos em `/directives/`.
- **Camada 2 (Orquestração):** Inteligência central via Agente Orquestrador (`agente-orquestrador`).
- **Camada 3 (Execução):** Scripts utilitários determinísticos em `/execution/`.

---
*Desenvolvido com foco no padrão de excelência SENAI & Google DeepMind Antigravity.*
