<div align="center">

# 📚 HQs Collections `v1.6.0` - Mobile First Collection Manager
### *Gerenciador Ágil de Coleções de Quadrinhos e Minisséries*

[![Version](https://img.shields.io/badge/version-1.6.0-amber?style=for-the-badge&logo=semver&logoColor=white)](#)
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
**HQs Collections** (v1.6.0) is an ultra-fast, mobile-first web application designed for comic book readers and collectors to track monthly publications, collections, and miniseries in a single streamlined screen. It features conditional cover suggestions carousel lifecycle (automatically hidden once a cover is officially fixed), a custom dark-mode confirmation alert dialog for unlinking covers, instant carousel reopening upon unlinking, high-precision Panini Brasil scraper with issue number/comic title matching, batch curatorship controls ("Accept All" / "Reject All"), and chronological volume ranking.

### ✨ Key Features in `v1.6.0`
- **Conditional Carousel Lifecycle:** Once an official cover is approved and fixed to an issue, the suggestions carousel is cleanly hidden to keep the interface uncluttered.
- **Custom Unlink Confirmation Alert:** Clicking "Desvincular capa desta edição" (or unlinking from the status dashboard) presents a dedicated dark-themed alert modal with warning badge, issue preview, and confirmation prompt.
- **Instant Carousel Reopening on Unlink:** Confirming unlinking removes the fixed cover and immediately re-queries and displays the alternatives carousel for swift selection of a new image.
- **Issue Detail Modal Integrated Carousel:** When opening the enlarged issue detail modal for unapproved editions, a horizontal carousel automatically loads all available candidates in the background.
- **Panini Brasil Scraper Super-Optimization:** Strict comic title verification, native support for Brazilian publication naming conventions (`Vol. 16` = #16), and high-resolution image CDN normalization (`-S300-FWEBP`).
- **Inline Multi-Cover Carousel on Rejection:** Rejecting a cover on the status screen automatically expands the issue row and queries for all matching occurrences.
- **Batch Cover Actions ("Accept All" / "Reject All"):** Directly in the Cover Search Dashboard, collectors can approve or reject all pending covers at once with a single tap.

### 🤖 Powered by Google Antigravity
This application was architected and built using **Google Antigravity**, utilizing the 3-Layer Agentic Architecture:
- **Layer 1 (Directives):** High-reliability standard operating procedures in `/directives/`.
- **Layer 2 (Orchestration):** Antigravity Intelligent Decision Agent (`agente-orquestrador`).
- **Layer 3 (Execution):** Deterministic tool-first scripts in `/execution/`.

---

## 🇧🇷 Versão em Português (Brasil)

### 🎯 Visão Geral
O **HQs Collections** (v1.6.0) é uma aplicação web mobile-first ultra-rápida criada sob medida para colecionadores de quadrinhos organizarem edições mensais, coleções e minisséries em apenas uma tela. O sistema emprega uma lógica inteligente de blocos de 10 edições sempre exibidas em linha única contínua, ciclo condicional de fechamento do carrossel ao fixar capa, modal de alerta customizado com confirmação para desvinculação, motor de busca Panini Brasil hiper-otimizado com suporte a Vol. N e resolução S300, e ações em lote de curadoria ("Aceitar Todos" e "Rejeitar Todos").

### ✨ Novidades da Versão `1.6.0`
- **Fechamento Automático do Carrossel ao Fixar:** Quando uma edição possui uma capa oficial fixada, o carrossel de sugestões é automaticamente ocultado, mantendo a visualização de detalhes limpa, elegante e sem distrações.
- **Modal de Confirmação Customizado para Desvincular Capa:** Ao tocar em "Desvincular capa desta edição" (ou no botão de remoção do painel de capas), um modal de alerta estilizado em tema escuro com ícone de alerta vermelho solicita a confirmação explícita do colecionador com opções "Cancelar" e "Sim, Desvincular".
- **Reabertura Imediata do Carrossel ao Desvincular:** Confirmada a desvinculação, a capa é removida e o carrossel de alternativas é **imediatamente recarregado e reaberto** para que o usuário escolha uma nova imagem sem etapas extras.
- **Carrossel Integrado de Sugestões na Tela de Detalhes:** Para edições sem capa fixada, o modal de detalhes carrega automaticamente em segundo plano um carrossel horizontal de sugestões.
- **Super-Otimização do Scraper Panini Brasil:** Validação estrita de título, tratamento de `Vol. 16` como edição Panini e resolução de imagem estável `-S300-FWEBP`.
- **Ações em Lote no Painel de Capas ("Aceitar Todos" / "Rejeitar Todos"):** Curadoria em lote exclusiva para capas pendentes.

### 🤖 Desenvolvido com Google Antigravity
Projeto concebido e executado através do ecossistema **Google Antigravity**, operando na Arquitetura de 3 Camadas:
- **Camada 1 (Diretivas):** SOPs estratégicos em `/directives/`.
- **Camada 2 (Orquestração):** Inteligência central via Agente Orquestrador (`agente-orquestrador`).
- **Camada 3 (Execução):** Scripts utilitários determinísticos em `/execution/`.

---
*Desenvolvido com foco no padrão de excelência SENAI & Google DeepMind Antigravity.*
