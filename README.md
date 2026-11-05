<div align="center">

# 📚 HQs Collections `v1.9.1` - Mobile First Collection Manager
### *Gerenciador Ágil de Coleções de Quadrinhos e Minisséries*

[![Version](https://img.shields.io/badge/version-1.9.1-amber?style=for-the-badge&logo=semver&logoColor=white)](#)
[![Powered by Antigravity](https://img.shields.io/badge/Powered%20by-Google%20Antigravity-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/antigravity/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

<p align="center">
  <b>Inglês / English</b> | <a href="#versão-em-português-brasil"><b>Português (Brasil)</b></a>
</p>

</div>

---

## 🇺🇸 English

### 🎯 Overview
**HQs Collections** (v1.9.0) is an ultra-fast, mobile-first web application designed for comic book readers and collectors to track monthly publications, collections, and miniseries in a single streamlined screen. Version 1.9.0 introduces **Drawer Navigation via Logo Tap**, full **User Authentication** (Firebase Auth with Google Single Sign-On and Email/Password), **My Profile Panel** with name updates, password change, and a protected "Clear My Collection" safety gate requiring the `ZERAR` security passphrase, a comprehensive **Visual Settings Panel** with 5 elegant color presets and free hex pickers for Consultation, Edit, and Cover modes, and a dedicated **Voice Input Module** powered by the Web Speech API (PT-BR) with semantic parsing and automatic Panini cover scraping.

### ✨ Key Features & Improvements in `v1.9.1`
- **Stable Edition Focus & Anti-Jump Lock:** Fixed the edition jumping issue when approving, rejecting, or browsing alternatives in the cover carousel. The active edition remains pinned and stable on screen.
- **Accurate Fixed-Cover Progress Percentage:** Header cover progress is now calculated strictly from confirmed and fixed covers (`(fixedCount / totalIssues) * 100`). Rejecting or cancelling covers accurately updates the percentage downward rather than getting stuck at 100%.
- **Comprehensive Visual Series Indicators:**
  - Pulsing amber bolt (`⚡`) on edition balls with pending series suggestions across normal and completed collections.
  - Distinctive `⚡ Série: [Year/Source]` badges on Comic Cards and Cover View cards.
  - Dedicated series suggestion banner in the Edition Detail modal with quick 1-tap `✓` approval.
  - Pulsing `⚡ Sugestão da Série` badges in the Cover Search Status panel.
- **Hamburger Drawer Menu via Brand Logo:** Tapping the app logo or title opens a smooth sliding navigation drawer with user avatar, profile status, and quick shortcuts.
- **Firebase Authentication & Multi-Tenancy:** Complete authentication suite supporting Google Sign-In (no password required), email/password login and registration, remembered email, and password recovery. Each user's comics are strictly isolated in Cloud Firestore subcollections (`/users/{userId}/comics`).
- **My Profile Panel:** View account details, update display name, change account password, and access high-risk operations.
- **Safety-Gated "Clear Collection":** Permanent collection wipe requiring typing the exact security keyword `ZERAR` to unlock the destruction button.
- **Visual Settings & Background Customizer:** 
  - 5 Curated Presets: *Dark Slate* (Default), *Dark Navy* (Ocean), *Deep Purple* (Galaxy), *Cyberpunk* (Neon), and *Charcoal* (Minimalist).
  - Free color pickers for Consultation Mode, Edit Mode, and Cover View Mode backgrounds.
  - Card density options (Compact, Normal, Relaxed) and haptic feedback toggles.
- **Smart Voice Input (Web Speech API PT-BR):** Speak natural Portuguese sentences (e.g., *"tenho a hq wolverine da marvel mensal das edições 01 até 09"*). The semantic parser extracts Comic Title, Publisher, Format, and Issue range, instantly creating or merging the comic into your collection and triggering background Panini cover searches.
- **Intelligent Series Propagation:** Approving and fixing a cover on an issue captures the series metadata (Year, Volume, Source), automatically searching and proposing covers from that exact same series for all other unapproved issues.
- **Cover View Mode (`ScanEye`):** Dedicated compact 2-column grid view displaying the official cover of the highest owned issue of each comic collection.

### 🤖 Powered by Google Antigravity
This application was architected and built using **Google Antigravity**, utilizing the 3-Layer Agentic Architecture:
- **Layer 1 (Directives):** High-reliability standard operating procedures in `/directives/`.
- **Layer 2 (Orchestration):** Antigravity Intelligent Decision Agent (`agente-orquestrador`).
- **Layer 3 (Execution):** Deterministic tool-first scripts in `/execution/`.

---

## 🇧🇷 Versão em Português (Brasil)

### 🎯 Visão Geral
O **HQs Collections** (v1.9.0) é uma aplicação web mobile-first ultra-rápida criada sob medida para colecionadores de quadrinhos organizarem edições mensais, coleções e minisséries em apenas uma tela. A versão 1.9.0 traz a nova **Gaveta Lateral de Navegação (Menu Hambúrguer)** acionada ao tocar no logotipo da aplicação, **Autenticação Completa com Firebase Auth** (Google e E-mail/Senha), painel **Meu Perfil** com alteração de dados e ação de segurança para zerar a coleção digitando `ZERAR`, tela de **Configurações Visuais** com 5 presets de cores e seletores livres de cor para os fundos dos modos Consulta, Edição e Capas, e **Módulo de Entrada por Voz** com Web Speech API em PT-BR para ditar e cadastrar HQs automaticamente.

### ✨ Novidades e Melhorias da Versão `1.9.1`
- **Trava de Foco e Estabilidade sem Saltos de Edição:** Correção definitiva do salto indesejado de edição ao escolher, aprovar, rejeitar ou alternar miniaturas no carrossel. A edição sob consulta permanece fixa e estável para revisão contínua.
- **Cálculo Realista da Porcentagem de Capas (% Fixadas):** O medidor no cabeçalho e nos painéis agora calcula a proporção estrita de edições com capas fixadas oficialmente (`(fixedCount / totalIssues) * 100`). Ao rejeitar ou desvincular capas, a porcentagem se ajusta proporcionalmente, sem ficar presa em 100%.
- **Indicadores Visuais Completos de Séries Alinhadas:**
  - Ponto pulsante âmbar/dourado com raio (`⚡`) na bolinha da edição na tela principal (cards normais e concluídos) para edições com sugestão pendente da série.
  - Badge `⚡ Série: [Ano/Fonte]` na Linha 2 dos cards da HQ e no Modo Consulta Capa.
  - Banner explicativo de sugestão de série no Modal de Detalhes da edição com botão de confirmação rápida `✓`.
  - Distintivo pulsante `⚡ Sugestão da Série` na tela detalhada de status de busca de capas.
- **Menu Hambúrguer ao Tocar no Logo:** Toque no logo ou no título no cabeçalho para abrir a gaveta lateral com o perfil do colecionador, status de sincronização e atalhos rápidos.
- **Autenticação Firebase & Isolamento Multi-Usuário:**
  - Login rápido com Conta Google (dispensa digitação de senha).
  - Cadastro e login com E-mail e Senha, recuperação de senha esquecida e opção "Lembrar meu e-mail".
  - Isolamento estrito de dados na nuvem: cada usuário possui suas próprias HQs e preferências no Firestore (`/users/{userId}/comics`).
- **Painel "Meu Perfil":** Permite atualizar o nome de exibição, alterar a senha de acesso e monitorar o status da conta.
- **Zerar Minha Coleção com Confirmação Rigorosa:** Ação destrutiva protegida por modal de alerta máximo que exige digitar a palavra `ZERAR` em maiúsculas para liberar a exclusão permanente no Firestore e no cache local.
- **Tela de Configurações Visuais:**
  - 5 Presets Elegantes prontos com um toque: *Dark Slate* (Padrão), *Dark Navy* (Oceano), *Deep Purple* (Galáxia), *Cyberpunk* (Neon) e *Charcoal* (Minimalista).
  - Seletores livres de cor (`<input type="color">` e código hex) para personalizar os fundos dos Modos Consulta, Edição e Consulta Capa.
  - Ajuste de densidade visual (Compacto, Normal, Amplo) e feedback tátil (vibração).
- **Entrada por Voz Inteligente (PT-BR):**
  - Dite frases naturais como: *"tenho a hq wolverine da marvel mensal das edições 01 até 09"*.
  - O interpretador semântico detecta automaticamente o Nome da HQ (*Wolverine*), a Editora (*Marvel*), o Tipo (*Mensal*) e o Intervalo de Edições (*01 a 09*).
  - Se a HQ já existir, as novas edições são mescladas na coleção existente sem sobrescrever dados anteriores; se for nova, o card é criado instantaneamente.
  - O robô de busca de capas Panini é iniciado automaticamente em segundo plano para cada edição identificada.
- **Propagação Inteligente de Séries de Capas:** Ao fixar a capa de uma edição, o sistema propaga sugestões alinhadas da mesma série para as outras edições daquela HQ.
- **Modo Consulta Capa (`ScanEye`):** Galeria compacta em 2 colunas no mobile destacando a capa da última edição adquirida de cada coleção.

### 🤖 Desenvolvido com Google Antigravity
Projeto concebido e executado através do ecossistema **Google Antigravity**, operando na Arquitetura de 3 Camadas:
- **Camada 1 (Diretivas):** SOPs estratégicos em `/directives/`.
- **Camada 2 (Orquestração):** Inteligência central via Agente Orquestrador (`agente-orquestrador`).
- **Camada 3 (Execução):** Scripts utilitários determinísticos em `/execution/`.

---
*Desenvolvido com foco no padrão de excelência SENAI & Google DeepMind Antigravity.*
