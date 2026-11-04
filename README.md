<div align="center">

# 📚 HQs Collections `v1.2.0` - Mobile First Collection Manager
### *Gerenciador Ágil de Coleções de Quadrinhos e Minisséries*

[![Version](https://img.shields.io/badge/version-1.2.0-amber?style=for-the-badge&logo=semver&logoColor=white)](#)
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
**HQs Collections** (v1.2.0) is an ultra-fast, mobile-first web application designed for comic book readers and collectors to track monthly publications, collections, and miniseries in a single streamlined screen. It features an intuitive chunking mechanism that displays issues in groups of 10 in a single continuous row, a 4-stage interactive issue cycle with neon indicators, a forced Panini scraper with serverless capabilities, cover rejection and approval workflows without text, and a live cover search tracking dashboard accessible straight from the header.

### ✨ Key Features in `v1.2.0`
- **Restored Header Controls & Cloud Status:** Full branding restored with `Mobile` tag, slogan, connection mode (`Cloud` / `Local`), and live collection summary (`XX HQs • YY issues`).
- **Interactive Cover Status (Icon & Percentage Only):** Clean header indicator showing strictly the artwork icon and percentage (e.g. `🖼️ 85%`). Tapping it opens the detailed **Cover Search Dashboard**.
- **Detailed Cover Search Dashboard:** Comprehensive modal organized in tabs (*All*, *Found/Pending*, *In Search Queue*, *Missing/Rejected*) with live metrics, issue thumbnails, search filters, and instant approval / rejection actions.
- **Text-Free Cover Approval & Rejection:** Both the issue detail card and cover search modal feature dual text-free action buttons:
  - **Approve (✓ green):** Fixes the artwork as the official issue cover in Cloud Firestore & LocalStorage.
  - **Reject (✗ red):** Discards the candidate, prevents duplicate suggestions, and allows manual re-search.
- **Forced Panini Scraping (`panini.com.br`):** High-reliability scraper utilizing curl and serverless functions to bypass Fastly/CDN blocks, retrieving authentic Brazilian comic covers (897x1373 and Cloudfront -S600-) before falling back to Fandom and OpenLibrary.
- **4-Stage Issue Cycle (Edit Mode):**
  - **Stage 1 (1st Click):** Solid Yellow (`owned`) — "Bought / Owned".
  - **Stage 2 (2nd Click):** Solid Yellow + Neon Blue Glow (`read`) — "Owned & Read".
  - **Stage 3 (3rd Click):** Hollow + Neon Pink Glow (`wishlist`) — "Want to Buy".
  - **Stage 4 (4th Click):** Default unselected state (`none`) — "Do Not Own / Do Not Plan to Buy".

### 🤖 Powered by Google Antigravity
This application was architected and built using **Google Antigravity**, utilizing the 3-Layer Agentic Architecture:
- **Layer 1 (Directives):** High-reliability standard operating procedures in `/directives/`.
- **Layer 2 (Orchestration):** Antigravity Intelligent Decision Agent (`agente-orquestrador`).
- **Layer 3 (Execution):** Deterministic tool-first scripts in `/execution/`.

---

## 🇧🇷 Versão em Português (Brasil)

### 🎯 Visão Geral
O **HQs Collections** (v1.2.0) é uma aplicação web mobile-first ultra-rápida criada sob medida para colecionadores de quadrinhos organizarem edições mensais, coleções e minisséries em apenas uma tela. O sistema emprega uma lógica inteligente de blocos de 10 edições sempre exibidas em linha única contínua, ciclo interativo de 4 estágios com destaque em neon, busca forçada de capas na Panini Brasil, painel de monitoramento de busca de capas acessível pelo cabeçalho e curadoria com aprovação e rejeição de capas sem texto.

### ✨ Novidades da Versão `1.2.0`
- **Cabeçalho Completo & Status de Conexão Restaurados:** Preservação do badge `Mobile`, slogan da aplicação, status em tempo real (`Nuvem` / `Local`) e contador de acervo (`XX HQs • YY ed.`).
- **Monitor de Capas no Header (Apenas Ícone e Porcentagem):** Botão discreto sem a palavra "capas" exibindo unicamente `🖼️ XX%`. Ao tocar nele, abre o painel detalhado de status de busca.
- **Painel Detalhado de Status da Busca de Capas:** Modal completo estruturado em abas (*Todas*, *Encontradas / Pendentes*, *Em Busca / Fila* e *Sem Capa / Rejeitadas*), com métricas em tempo real, miniaturas das edições, busca por título e ações rápidas.
- **Aprovação e Rejeição de Capas Sem Texto:** Tanto no card de detalhes da edição quanto no painel de busca, são apresentados dois botões táteis **SEM TEXTO**:
  - **Aprovar (✓ verde):** Fixa a arte como capa oficial daquela edição no Firestore e LocalStorage.
  - **Rejeitar (✗ vermelho):** Descarta a imagem, evita sugestões repetidas e permite acionar nova busca a qualquer momento.
- **Busca Forçada no panini.com.br:** Motor de busca aprimorado que executa consultas direcionadas no catálogo da Panini Brasil via curl e Vercel Serverless (`/api/scrape-cover`), contornando firewalls da CDN Fastly e capturando capas oficiais em alta resolução (897x1373 e Cloudfront -S600-), com fallback para Fandom e OpenLibrary.
- **Ciclo de 4 Estágios por Edição (Modo Edição):**
  - **1º Clique (Amarelo):** `owned` — Edição comprada / adquirida (Tenho).
  - **2º Clique (Amarelo com Borda Azul Neon):** `read` — Edição comprada e lida (Lida).
  - **3º Clique (Desmarcado com Borda Pink Neon):** `wishlist` — Edição desejada (Quero Comprar).
  - **4º Clique (Original Desmarcado):** `none` — Não possuo e não pretendo comprar.

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
