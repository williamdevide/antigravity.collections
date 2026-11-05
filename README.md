<div align="center">

# 📚 HQs Collections `v1.5.0` - Mobile First Collection Manager
### *Gerenciador Ágil de Coleções de Quadrinhos e Minisséries*

[![Version](https://img.shields.io/badge/version-1.5.0-amber?style=for-the-badge&logo=semver&logoColor=white)](#)
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
**HQs Collections** (v1.5.0) is an ultra-fast, mobile-first web application designed for comic book readers and collectors to track monthly publications, collections, and miniseries in a single streamlined screen. It features an integrated cover alternatives carousel in the Issue Detail Modal, an inline expandable carousel on the cover status screen, a high-precision Panini Brasil scraper with issue number/comic title matching and stable CDN resolution, batch curatorship controls ("Accept All" / "Reject All"), chronological volume ranking prioritizing newest releases (2025/2026), and zero-repetition cover matching.

### ✨ Key Features in `v1.5.0`
- **Issue Detail Modal Integrated Carousel:** When opening the enlarged issue detail modal in view mode, a horizontal carousel automatically loads all available cover candidates in the background right below the main cover frame.
- **Instant Variant Preview & Approval:** Tapping any alternative instantly displays it as the active candidate in the main preview with the green checkmark (`✓`) button ready to fix as the official cover.
- **Panini Brasil Scraper Super-Optimization:**
  - Strict comic title verification preventing unrelated comic search results (e.g. Deadpool) from being matched.
  - Native support for Brazilian publication naming conventions (such as `Wolverine (2022) Vol. 16` being recognized as issue #16).
  - High-resolution image CDN normalization using `-S300-` (eliminating Cloudfront HTTP 302 redirects).
  - Vite dev server reverse proxy for seamless local scraping via `/api`.
- **Inline Multi-Cover Carousel on Rejection:** Rejecting a cover on the status screen automatically expands the issue row and queries for all matching occurrences across Panini and Web sources.
- **Batch Cover Actions ("Accept All" / "Reject All"):** Directly in the Cover Search Dashboard, collectors can approve or reject all pending covers at once with a single tap.
- **Strict Integrity Guarantee:** Batch actions operate exclusively on covers pending approval (`status === 'pending'`), never modifying or unlinking already approved/fixed artwork.

### 🤖 Powered by Google Antigravity
This application was architected and built using **Google Antigravity**, utilizing the 3-Layer Agentic Architecture:
- **Layer 1 (Directives):** High-reliability standard operating procedures in `/directives/`.
- **Layer 2 (Orchestration):** Antigravity Intelligent Decision Agent (`agente-orquestrador`).
- **Layer 3 (Execution):** Deterministic tool-first scripts in `/execution/`.

---

## 🇧🇷 Versão em Português (Brasil)

### 🎯 Visão Geral
O **HQs Collections** (v1.5.0) é uma aplicação web mobile-first ultra-rápida criada sob medida para colecionadores de quadrinhos organizarem edições mensais, coleções e minisséries em apenas uma tela. O sistema emprega uma lógica inteligente de blocos de 10 edições sempre exibidas em linha única contínua, carrossel integrado de sugestões de capas na tela de detalhes da edição, motor de busca Panini Brasil hiper-otimizado com suporte a Vol. N e resolução S300, carrossel tátil expansível na tela de status de capas, ações de curadoria em lote ("Aceitar Todos" e "Rejeitar Todos") e validação estrita de número e título de HQ.

### ✨ Novidades da Versão `1.5.0`
- **Carrossel Integrado de Sugestões na Tela de Detalhes:** Ao clicar em qualquer edição no Modo Consulta, o modal de detalhes ampliado carrega automaticamente em segundo plano um carrossel horizontal de capas alternativas logo abaixo da imagem principal.
- **Pré-visualização e Aprovação Imediata:** Ao tocar em qualquer miniatura do carrossel, ela assume o quadro principal de visualização como capa pendente, acompanhada do botão verde (`✓`) para aprovação e fixação com um clique.
- **Super-Otimização do Scraper Panini Brasil:**
  - Validação estrita do nome da HQ, impedindo que títulos alheios (como Deadpool) interfiram na busca de Wolverine.
  - Reconhecimento automático do formato editorial brasileiro da Panini (`Wolverine (2022) Vol. 16` é identificado com precisão como edição #16).
  - Normalização estável de resolução de imagem no CDN Cloudfront utilizando `-S300-FWEBP` (eliminando erros de redirecionamento 302 temporário).
  - Configuração de Proxy no servidor Vite dev para encaminhamento transparente de chamadas `/api` ao backend local na porta 3001.
- **Carrossel Horizontal na Tela de Status:** Ao rejeitar uma capa (`✗`) ou tocar no botão de galeria (`Images`), a linha se expande exibindo todas as ocorrências encontradas para seleção tátil.
- **Ações em Lote no Painel de Capas ("Aceitar Todos" / "Rejeitar Todos"):** Curadoria em lote que opera exclusivamente sobre as capas pendentes de aprovação, mantendo intactas as edições já aprovadas.

### 🤖 Desenvolvido com Google Antigravity
Projeto concebido e executado através do ecossistema **Google Antigravity**, operando na Arquitetura de 3 Camadas:
- **Camada 1 (Diretivas):** SOPs estratégicos em `/directives/`.
- **Camada 2 (Orquestração):** Inteligência central via Agente Orquestrador (`agente-orquestrador`).
- **Camada 3 (Execução):** Scripts utilitários determinísticos em `/execution/`.

---
*Desenvolvido com foco no padrão de excelência SENAI & Google DeepMind Antigravity.*
