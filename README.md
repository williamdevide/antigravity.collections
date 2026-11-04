<div align="center">

# 📚 HQs Collections `v1.2.1` - Mobile First Collection Manager
### *Gerenciador Ágil de Coleções de Quadrinhos e Minisséries*

[![Version](https://img.shields.io/badge/version-1.2.1-amber?style=for-the-badge&logo=semver&logoColor=white)](#)
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
**HQs Collections** (v1.2.1) is an ultra-fast, mobile-first web application designed for comic book readers and collectors to track monthly publications, collections, and miniseries in a single streamlined screen. It features an intuitive chunking mechanism that displays issues in groups of 10 in a single continuous row, strict chronological volume ranking prioritizing newest releases (2025/2026 / latest volumes), zero-repetition issue cover matching, and automatic progressive fallback to older editions upon rejection.

### ✨ Key Features in `v1.2.1`
- **Chronological Volume & Year Ranking (Newest First):** Always searches for the newest publication (e.g. 2025/2026 runs, Volume 8 for Wolverine, Volume 6 for Spider-Man) before considering older legacy volumes.
- **Strict Issue Number Validation (`matchIssueNumber`):** Completely eliminates duplicate covers across issues. An issue will only receive artwork that corresponds precisely to its issue number (e.g. Issue #2 will only match Issue #2 artwork, never Issue #1 or a generic series promo).
- **Progressive Rejection Fallback:** Rejecting a candidate cover immediately triggers a fetch for the next newest (older run) alternative for that issue.
- **Uniqueness Guarantee per Comic:** Once an artwork is assigned to an issue, it is excluded from all other issues of that comic.
- **Restored Header Controls & Cloud Status:** Full branding with `Mobile` tag, slogan, connection mode (`Cloud` / `Local`), and live collection summary (`XX HQs • YY issues`).
- **Interactive Cover Status (Icon & Percentage Only):** Clean header indicator showing strictly the artwork icon and percentage (e.g. `🖼️ 85%`). Tapping it opens the detailed **Cover Search Dashboard**.
- **Text-Free Cover Approval & Rejection:** Both the issue detail card and cover search modal feature dual text-free action buttons (`✓` green to approve, `✗` red to reject).

### 🤖 Powered by Google Antigravity
This application was architected and built using **Google Antigravity**, utilizing the 3-Layer Agentic Architecture:
- **Layer 1 (Directives):** High-reliability standard operating procedures in `/directives/`.
- **Layer 2 (Orchestration):** Antigravity Intelligent Decision Agent (`agente-orquestrador`).
- **Layer 3 (Execution):** Deterministic tool-first scripts in `/execution/`.

---

## 🇧🇷 Versão em Português (Brasil)

### 🎯 Visão Geral
O **HQs Collections** (v1.2.1) é uma aplicação web mobile-first ultra-rápida criada sob medida para colecionadores de quadrinhos organizarem edições mensais, coleções e minisséries em apenas uma tela. O sistema emprega uma lógica inteligente de blocos de 10 edições sempre exibidas em linha única contínua, ordenação cronológica rigorosa priorizando publicações mais recentes (2025/2026), validação estrita de número de edição e fallback progressivo para edições mais antigas ao rejeitar uma capa.

### ✨ Novidades da Versão `1.2.1`
- **Prioridade para Lançamentos Mais Recentes (2025/2026):** O motor de scraping busca sistematicamente as publicações mais novas (anos 2025/2026 na Panini Brasil e maiores volumes na Fandom, como Vol 8 > Vol 7 > Vol 6 para o Wolverine).
- **Filtro Rigoroso de Numeração (`matchIssueNumber`):** Elimina o problema de capas repetidas em edições diferentes. O validador isola anos de 4 dígitos e coleções inteiras, assegurando que a edição #2 receba exclusivamente a arte da edição #2.
- **Fallback Progressivo por Rejeição:** Ao tocar no botão rejeitar (`✗`), a capa atual é descartada e o sistema busca imediatamente a próxima versão cronologicamente anterior daquela mesma edição.
- **Garantia de Unicidade por HQ:** Uma arte atribuída ou pendente em uma edição jamais será sugerida para outro fascículo da mesma coleção.
- **Cabeçalho Completo & Status de Conexão:** Badge `Mobile`, slogan, status em tempo real (`Nuvem` / `Local`) e contador de acervo (`XX HQs • YY ed.`).
- **Monitor de Capas no Header (Apenas Ícone e Porcentagem):** Botão sem a palavra "capas" exibindo unicamente `🖼️ XX%` que abre o painel detalhado de status de busca.
- **Aprovação e Rejeição de Capas Sem Texto:** Botões táteis dedicados **SEM TEXTO** (`✓` em verde esmeralda para aprovar, `✗` em vermelho suave para rejeitar).

### 🤖 Desenvolvido com Google Antigravity
Projeto concebido e executado através do ecossistema **Google Antigravity**, operando na Arquitetura de 3 Camadas:
- **Camada 1 (Diretivas):** SOPs estratégicos em `/directives/`.
- **Camada 2 (Orquestração):** Inteligência central via Agente Orquestrador (`agente-orquestrador`).
- **Camada 3 (Execução):** Scripts utilitários determinísticos em `/execution/`.

---
*Desenvolvido com foco no padrão de excelência SENAI & Google DeepMind Antigravity.*
