# 📋 Diretiva: Controle Rápido de Coleções de HQs (Mobile-First)

## 1. Visão Geral e Propósito
Desenvolver uma aplicação Web First Mobile para controle ágil de coleções de Histórias em Quadrinhos (HQs, especiais e minisséries). A experiência é concentrada em uma única tela, com alta responsividade tátil, carregamento instantâneo e categorização rica por Tipo e Editora.

## 2. Requisitos Funcionais e Especificações

### 2.1 Cadastro Rápido de Título
* **Nome:** Campo de texto ágil.
* **Tipo da HQ (Botão de Alternância):**
  - Valores: `Mensal`, `Especial`, `Minissérie`.
  - Padrão inicial: `Mensal`.
* **Editora (Botão de Alternância):**
  - Valores: `Marvel`, `DC`, `Vertigo`, `Outras`.
  - Padrão inicial: `Marvel`.
* **Adicionar:** Tecla `Enter` ou botão `+`.

### 2.2 Estilização Cromática dos Cards por Tipo
* **Mensal:** Fundo e bordas em tons de Azul Escuro (`#0f172a` / `#1e293b` com acentos azulados).
* **Especial:** Fundo e bordas em tons de Vermelho Escuro (`#2a0d12` / `#3b1118` com acentos carmesim).
* **Minissérie:** Fundo e bordas em tons de Verde Escuro (`#0b2318` / `#133824` com acentos esmeralda).

### 2.3 Mecanismo de Chunking (10 em 10)
* Bolinhas numéricas táteis ergonômicas para toque móvel.
* Ao marcar a 10ª edição de um bloco:
  - Se todas as 10 estiverem marcadas: resumo automático em `01..10` e abre a próxima dezena (`11..20`).
  - Se faltarem números anteriores: abre `11..20`, mas mantém `01..10` detalhado.
  - Ao completar os números faltantes: colapsa automaticamente.
* Clicar no badge resumido (ex: `01..10`) alterna entre expandir e recolher as 10 bolinhas para ajustes rápidos.

### 2.4 Encerramento de Itens (Minisséries / Títulos Encerrados)
* Botão **Encerrar**: sintetiza a sequência no maior número marcado (ex: `01..06`), alternável a qualquer momento.

### 2.5 Sistema de Filtros Avançado na Tela Única
* **Filtro por Tipo:** Todos | Mensal | Especial | Minissérie.
* **Filtro por Editora:** Todas | Marvel | DC | Vertigo | Outras.
* **Filtro por Status:** Todos | Em Andamento | Encerrados.
* **Filtro de Edições:** Todas as Edições | Somente as que Tenho | Somente Faltantes.

### 2.6 Persistência e Sincronização
* Sincronização em tempo real com Firebase Firestore.
* Cache e funcionamento imediato Offline-First via `LocalStorage`.
* Versionamento Git integrado e deploy contínuo na Vercel via GitHub.
