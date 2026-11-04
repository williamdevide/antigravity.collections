# 🏛️ Arquitetura do Sistema: HQ Tracker

## 1. Visão Geral
O **HQ Tracker** é um sistema projetado para colecionadores de quadrinhos com foco em extrema agilidade no ambiente mobile ("Mobile First"). A aplicação opera em **tela única**, minimizando cliques, eliminando navegações desnecessárias, agrupando edições em blocos táteis de 10 em 10, categorizando coleções por Tipo e Editora, permitindo ordenação personalizada com **Drag & Drop**, títulos específicos por fascículo e suporte a coleções que iniciam em edições avançadas (`startFrom`).

---

## 2. Diagrama de Fluxo e Componentes

```mermaid
flowchart TD
    User["📱 Usuário (Colecionador no Mobile / Desktop)"] --> UI["🖥️ Interface Web Mobile First (Vite + React)"]

    subgraph Frontend ["Camada de Interface (Frontend)"]
        UI --> Header["Cabeçalho Rápido + Status Cloud/Local"]
        UI --> AddForm["Entrada Rápida de HQ (Nome + Tipo + Editora + Início nº)"]
        UI --> SortBar["Barra de Ordenação (A-Z, Z-A, Ordem Pessoal)"]
        UI --> FilterPanel["Painel de Filtros (Tipo, Editora, Status, Visão de Edições)"]
        UI --> ComicList["Lista de Coleções (Cards com Drag & Drop Nativo)"]
        
        ComicList --> StartFromLogic["Ponto de Partida Customizado (startFrom)"]
        StartFromLogic --> HiddenChip["Chip de Dezenas Anteriores Ocultas (01..XX)"]
        StartFromLogic --> ActiveChunks["Dezenas Ativas a partir da Faixa Inicial"]
        
        ComicList --> ChunkEngine["Mecanismo Estrito de Blocos de 10 (Chunking)"]
        ChunkEngine --> TactileCircles["Bolinhas Táteis (01 a 10, 11 a 20...)"]
        ChunkEngine --> IssueTitleModal["Modal de Título Específico (Duplo clique)"]
        ChunkEngine --> AutoSummarize["Resumo Automático (ex: 01..10)"]
        ChunkEngine --> StrictCollapse["Fechamento Automático de Blocos sem Itens"]
        
        ComicList --> DragHandle["Alça de Arrasto (::: + Controles Subir/Descer)"]
        ComicList --> AlignedBadges["Badges Fixos à Direita [Tipo] [Editora] [Encerrar]"]
        ComicList --> SeriesEnder["Botão Encerrar (Resumo respeitando startFrom)"]
        ComicList --> EditModal["Edição de Nome, Tipo, Editora, Início & Exclusão"]
    end

    subgraph Theming ["Paleta Cromática dos Cards por Tipo"]
        MensalCard["📘 Mensal: Azul Escuro (#0E1A30)"]
        EspecialCard["📕 Especial: Vermelho Escuro (#220B10)"]
        MinisserieCard["📗 Minissérie: Verde Escuro (#0B2117)"]
        ColecaoCard["📙 Coleção: Roxo Escuro / Violeta (#200A2C)"]
    end

    subgraph DataSync ["Motor de Sincronização Híbrida"]
        UI --> StorageLayer["Camada de Armazenamento"]
        StorageLayer --> LocalStorage["💾 Cache Local (LocalStorage / Offline-First)"]
        StorageLayer --> Firestore["☁️ Google Cloud Firestore (Nuvem em Tempo Real)"]
    end
```

---

## 3. Lógica do Ponto de Partida (`startFrom`)

```mermaid
stateDiagram-v2
    [*] --> EntradaInicio: Usuário define ex: Início nº 32
    EntradaInicio --> CalculaBloco: Determina bloco inicial (31..40)
    CalculaBloco --> OcultaAnteriores: Oculta blocos 01..10, 11..20, 21..30
    OcultaAnteriores --> ExibeChip: Mostra chip '01..30 (Ocultas - Toque para ver)'
    ExibeChip --> ExibeAtivo: Abre direto bloco 31..40 com edição 32 disponível!
```

---
*Padrão de excelência técnica: Google Antigravity & SENAI Ourinhos Edition*
