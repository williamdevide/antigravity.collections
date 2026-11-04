# 🏛️ Arquitetura do Sistema: HQ Tracker

## 1. Visão Geral
O **HQ Tracker** é um sistema projetado para colecionadores de quadrinhos com foco em extrema agilidade no ambiente mobile ("Mobile First"). A aplicação opera em **tela única**, minimizando cliques, eliminando navegações desnecessárias, agrupando edições em blocos táteis de 10 em 10 e categorizando coleções por Tipo e Editora com paletas cromáticas temáticas.

---

## 2. Diagrama de Fluxo e Componentes

```mermaid
flowchart TD
    User["📱 Usuário (Colecionador no Mobile)"] --> UI["🖥️ Interface Web Mobile First (Vite + React)"]

    subgraph Frontend ["Camada de Interface (Frontend)"]
        UI --> Header["Cabeçalho Rápido + Status Cloud/Local"]
        UI --> AddForm["Entrada Rápida de HQ (Nome + Tipo + Editora)"]
        UI --> FilterPanel["Painel de Filtros (Tipo, Editora, Status, Visão de Edições)"]
        UI --> ComicList["Lista de Coleções (Cards Cromáticos por Tipo)"]
        
        ComicList --> ChunkEngine["Mecanismo de Blocos de 10 (Chunking)"]
        ChunkEngine --> TactileCircles["Bolinhas Táteis (01 a 10, 11 a 20...)"]
        ChunkEngine --> AutoSummarize["Resumo Automático (ex: 01..10)"]
        ChunkEngine --> ManualExpand["Alternar Expansão com 1 Clique"]
        
        ComicList --> Badges["Badges Clicáveis (Alternância rápida de Tipo e Editora)"]
        ComicList --> SeriesEnder["Botão Encerrar (Minissérie ex: 01..06)"]
        ComicList --> EditModal["Edição de Nome, Tipo, Editora & Exclusão com Confirmação"]
    end

    subgraph Theming ["Paleta Cromática dos Cards por Tipo"]
        MensalCard["📘 Mensal: Azul Escuro (#0E1A30)"]
        EspecialCard["📕 Especial: Vermelho Escuro (#220B10)"]
        MinisserieCard["📗 Minissérie: Verde Escuro (#0B2117)"]
    end

    subgraph DataSync ["Motor de Sincronização Híbrida"]
        UI --> StorageLayer["Camada de Armazenamento"]
        StorageLayer --> LocalStorage["💾 Cache Local (LocalStorage / Offline-First)"]
        StorageLayer --> Firestore["☁️ Google Cloud Firestore (Nuvem em Tempo Real)"]
    end
```

---

## 3. Lógica dos Filtros e Modos de Visualização

1. **Filtro de Tipo:** `Todos` | `Mensal` | `Especial` | `Minissérie`
2. **Filtro de Editora:** `Todas` | `Marvel` | `DC` | `Vertigo` | `Outras`
3. **Filtro de Status:** `Todos` | `Em Andamento` | `Encerrados`
4. **Modo de Visualização das Edições:**
   * **Todas as Edições:** Exibe o conjunto completo de 10 botões do bloco.
   * **Somente que Tenho:** Oculta números não adquiridos, exibindo apenas as edições já colecionadas.
   * **Somente Faltantes:** Destaca exclusivamente os números pendentes para aquisição, com estilo visual de alerta (`red-950/40` com borda `red-500/50`).

---
*Padrão de excelência técnica: Google Antigravity & SENAI Ourinhos Edition*
