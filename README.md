<div align="center">

# 📚 HQs Collections `v1.3.0` - Mobile First Collection Manager
### *Gerenciador Ágil de Coleções de Quadrinhos e Minisséries*

[![Version](https://img.shields.io/badge/version-1.3.0-amber?style=for-the-badge&logo=semver&logoColor=white)](#)
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
**HQs Collections** (v1.3.0) is an ultra-fast, mobile-first web application designed for comic book readers and collectors to track monthly publications, collections, and miniseries in a single streamlined screen. It features an intuitive chunking mechanism displaying issues in groups of 10 in a single continuous row, batch curatorship controls ("Accept All" / "Reject All" strictly for pending covers), chronological volume ranking prioritizing newest releases (2025/2026), zero-repetition issue cover matching, and automatic progressive fallback.

### ✨ Key Features in `v1.3.0`
- **Batch Cover Actions ("Accept All" / "Reject All"):** Directly in the Cover Search Dashboard, collectors can approve or reject all pending covers at once with a single tap.
- **Strict Integrity Guarantee:** Batch actions operate exclusively on covers pending approval (`status === 'pending'`), never modifying or unlinking already approved/fixed artwork.
- **Chronological Volume & Year Ranking (Newest First):** Always searches for the newest publication (e.g. 2025/2026 runs, Volume 8 for Wolverine) before considering older legacy volumes.
- **Strict Issue Number Validation (`matchIssueNumber`):** Completely eliminates duplicate covers across issues.
- **Progressive Rejection Fallback:** Rejecting candidate covers triggers an automated search for the next chronologically older run for that issue.
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
O **HQs Collections** (v1.3.0) é uma aplicação web mobile-first ultra-rápida criada sob medida para colecionadores de quadrinhos organizarem edições mensais, coleções e minisséries em apenas uma tela. O sistema emprega uma lógica inteligente de blocos de 10 edições sempre exibidas em linha única contínua, ações de curadoria em lote ("Aceitar Todos" e "Rejeitar Todos" exclusivamente para capas pendentes), ordenação cronológica rigorosa priorizando publicações mais recentes (2025/2026), validação estrita de número de edição e fallback progressivo por rejeição.

### ✨ Novidades da Versão `1.3.0`
- **Ações em Lote no Painel de Capas ("Aceitar Todos" / "Rejeitar Todos"):** No Modal de Status da Busca de Capas, um clique aprova todas as capas pendentes de uma só vez (gravando no Firestore/LocalStorage via `saveComicsBatch`) ou rejeita todas, disparando a busca pelas versões cronológicas anteriores.
- **Proteção Estrita de Integridade:** As ações em lote afetam *exclusivamente* as capas pendentes de aprovação, mantendo 100% intactas todas as capas que já haviam sido aprovadas e fixadas.
- **Prioridade para Lançamentos Mais Recentes (2025/2026):** O motor de scraping busca sistematicamente as publicações mais novas (anos 2025/2026 na Panini Brasil e maiores volumes na Fandom, como Vol 8 > Vol 7 > Vol 6 para o Wolverine).
- **Filtro Rigoroso de Numeração (`matchIssueNumber`):** Elimina o problema de capas repetidas em edições diferentes.
- **Fallback Progressivo por Rejeição:** Ao rejeitar uma capa, o sistema busca imediatamente a próxima versão cronologicamente anterior daquela mesma edição.
- **Monitor de Capas no Header (Apenas Ícone e Porcentagem):** Botão sem texto exibindo unicamente `🖼️ XX%`.
- **Curadoria Individual Sem Texto:** Botões dedicados **SEM TEXTO** (`✓` em verde esmeralda para aprovar, `✗` em vermelho suave para rejeitar).

### 🤖 Desenvolvido com Google Antigravity
Projeto concebido e executado através do ecossistema **Google Antigravity**, operando na Arquitetura de 3 Camadas:
- **Camada 1 (Diretivas):** SOPs estratégicos em `/directives/`.
- **Camada 2 (Orquestração):** Inteligência central via Agente Orquestrador (`agente-orquestrador`).
- **Camada 3 (Execução):** Scripts utilitários determinísticos em `/execution/`.

---
*Desenvolvido com foco no padrão de excelência SENAI & Google DeepMind Antigravity.*
