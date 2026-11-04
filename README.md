<div align="center">

# 📚 HQs Collections `v1.0.2` - Mobile First Collection Manager
### *Gerenciador Ágil de Coleções de Quadrinhos e Minisséries*

[![Version](https://img.shields.io/badge/version-1.0.2-amber?style=for-the-badge&logo=semver&logoColor=white)](#)
[![Powered by Antigravity](https://img.shields.io/badge/Powered%20by-Google%20Antigravity-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/antigravity/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
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
**HQs Collections** (v1.0.2) is an ultra-fast, mobile-first web application designed for comic book readers and collectors to track monthly publications, collections, and miniseries in a single streamlined screen. It features an intuitive chunking mechanism that displays issues in groups of 10 in a single continuous row, auto-collapsing completed intervals (e.g. `01..10`) and dynamically revealing subsequent issue blocks.

### ✨ Key Features
- **Dual Mode (Consultation vs. Edit):** Header toggle switch with visual icons. Consultation mode is default upon launch. Switching to Edit mode transitions the app background to an elevated lighter blue tone.
- **Strict Mode Protection:** Issue marking and adding is exclusively enabled in Edit Mode. In Consultation Mode, tapping an issue opens an issue detail sheet with full metadata and cover placeholder.
- **Refined Card Layout:** Distinct title-only header line, with actions neatly organized in a right-aligned secondary line (Publisher, Type, Complete Series) featuring equal, fixed widths.
- **Strict 10-Issue Single-Row Grid:** Issues 01..10 always display in a single, uninterrupted horizontal line on any mobile or desktop screen.
- **Direct & Detailed Addition:** Fast on-screen addition, plus a dedicated "Detailed Inclusion" dialog capturing Start Year, Brazilian Publisher, and Main Hero/Group.
- **Deep Edit Experience:** Clicking the comic title opens an edit modal with all fields, plus secure deletion confirmation.
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
O **HQs Collections** (v1.0.2) é uma aplicação web mobile-first ultra-rápida criada sob medida para colecionadores de quadrinhos organizarem edições mensais, coleções e minisséries em apenas uma tela. O sistema emprega uma lógica inteligente de blocos de 10 edições sempre exibidas em linha única contínua, resumindo automaticamente sequências completas (ex: `01..10`) e abrindo novas dezenas dinamicamente conforme a coleção avança.

### ✨ Principais Funcionalidades
- **Alternância de Modos (Consulta vs. Edição):** Botão visual no cabeçalho com ícones distintos. O sistema sempre inicia no **Modo Consulta** por padrão. Ao entrar no **Modo Edição**, o fundo da aplicação transiciona suavemente para um tom azul mais claro e retorna à cor original ao voltar para Consulta.
- **Proteção e Consulta de Edições:** Marcações de edições são permitidas unicamente no Modo Edição. No Modo Consulta, clicar no número abre um modal detalhado com as informações da HQ (ano, editora original e no Brasil, herói/grupo e espaço reservado para capa).
- **Alinhamento Uniforme dos Cards:** Linha superior exclusiva para o título da HQ. Segunda linha dedicada com botões alinhados à direita na ordem exata: **1º Editora**, **2º Tipo** e **3º Encerrar**, todos com larguras iguais e fixas.
- **Bolinhas Sempre em Linha Única:** O bloco de edições exibe estritamente as 10 bolinhas em uma só linha horizontal (`grid-cols-10`), garantindo consistência visual em qualquer celular.
- **Inclusão Direta e Detalhada:** Permite cadastro rápido na própria tela ou abertura da **Inclusão Detalhada** com campos para Ano de Início, Editora de Venda no Brasil e Herói / Grupo Principal.
- **Edição Completa da Coleção:** Ao tocar no nome da HQ no card, abre a tela de alteração com todos os campos e confirmação de exclusão segura.
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
