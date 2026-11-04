# 🏛️ Arquitetura do Sistema: HQs Collections `v1.1.0`

## 1. Visão Geral
O **HQs Collections** é um sistema projetado para colecionadores de quadrinhos com foco em extrema agilidade no ambiente mobile ("Mobile First"). A aplicação opera em **tela única**, minimizando cliques, eliminando navegações desnecessárias, agrupando edições em blocos táteis de 10 em 10, categorizando coleções por Tipo e Editora, permitindo ordenação personalizada com **Drag & Drop**, títulos específicos por fascículo, suporte a início em edições avançadas (`startFrom`), **ciclo interativo de 4 estágios com destaque em neon**, **scraper de capas em segundo plano com aprovação visual** e **indicador de progresso no cabeçalho**.

---

## 2. Diagrama de Fluxo e Componentes

```mermaid
flowchart TD
    User["📱 Usuário (Colecionador no Mobile / Desktop)"] --> UI["🖥️ Interface Web Mobile First (Vite + React)"]

    subgraph Frontend ["Camada de Interface (Frontend)"]
        UI --> Header["Cabeçalho: Versão v1.1.0 + Progresso de Capas (%) + Alternador Consulta/Edição"]
        UI --> AddForm["Entrada Rápida de HQ (Nome + Tipo + Editora + Início nº + Inclusão Detalhada)"]
        UI --> SortBar["Barra de Ordenação (A-Z, Z-A, Ordem Pessoal)"]
        UI --> FilterPanel["Painel de Filtros (Tipo, Editora, Status, Estágios de Edição: Tenho, Lido, Quero, Não Pretendo)"]
        UI --> ComicList["Lista de Coleções (Cards com Drag & Drop Nativo)"]
        
        ComicList --> StartFromLogic["Ponto de Partida Customizado (startFrom)"]
        StartFromLogic --> HiddenChip["Chip de Dezenas Anteriores Ocultas (01..XX)"]
        StartFromLogic --> ActiveChunks["Dezenas Ativas a partir da Faixa Inicial"]
        
        ComicList --> ChunkEngine["Mecanismo Estrito de Blocos de 10 (Chunking)"]
        ChunkEngine --> TactileCircles["Bolinhas Táteis em Linha Única (grid-cols-10)"]
        TactileCircles --> FourStageCycle["Ciclo de 4 Estágios (Owned -> Read -> Wishlist -> None)"]
        FourStageCycle --> NeonVisuals["Estilo Visual: Amarelo Sólido / Borda Azul Neon / Borda Pink Neon"]
        
        ChunkEngine --> IssueDetailModal["Modal de Detalhes da Edição (Modo Consulta)"]
        IssueDetailModal --> CoverFrame["Moldura Estética de Capa (2:3)"]
        IssueDetailModal --> CoverApproval["Aprovação de Capa Pendente (Botão ✓ Verde)"]
        
        ComicList --> DragHandle["Alça de Arrasto (::: + Controles Subir/Descer)"]
        ComicList --> AlignedBadges["Badges Fixos à Direita [Editora] [Tipo] [Encerrar]"]
        ComicList --> SeriesEnder["Botão Encerrar (Resumo respeitando startFrom)"]
        ComicList --> EditModal["Edição de Coleção (Nome, Tipo, Editora, Início, Ano, Grupo & Exclusão)"]
    end

    subgraph BackgroundScraper ["Motor de Busca de Capas Assíncrono"]
        UI --> ScraperHook["Hook de Segundo Plano (Não-bloqueante)"]
        ScraperHook --> ScraperEngine["Serviço de Scraping Híbrido"]
        ScraperEngine --> PaniniBackend["Backend /api/scrape-cover (Panini / Metadados)"]
        ScraperEngine --> FandomAPI["Marvel & DC Fandom MediaWiki (CORS enabled)"]
        ScraperEngine --> OpenLibrary["OpenLibrary Covers API"]
        ScraperEngine --> YearSorting["Ordenação Temporal Decrescente (Mais recentes primeiro)"]
        ScraperEngine --> PendingState["Estado Pendente de Aprovação (pendingCovers)"]
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

## 3. Ciclo de 4 Estágios da Edição (Modo Edição)

```mermaid
stateDiagram-v2
    [*] --> None: Estado Inicial (Não possuo / Não pretendo)
    None --> Owned: 1º Clique (Amarelo Sólido - Comprei / Tenho)
    Owned --> Read: 2º Clique (Amarelo + Borda Azul Neon - Tenho e já li)
    Read --> Wishlist: 3º Clique (Desmarcado + Borda Pink Neon - Quero Comprar)
    Wishlist --> None: 4º Clique (Retorno ao original desmarcado)
```

---

## 4. Fluxo de Scraping e Curadoria de Capas

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário
    participant UI as HQs Collections UI
    participant Scraper as Scraper em 2º Plano
    participant Sources as Fontes (Panini / Fandom / OpenLib)
    participant Storage as Firestore / LocalStorage

    Note over Scraper: Executa de forma assíncrona sem travar a interface
    Scraper->>Sources: Busca capas (Ano mais recente para trás)
    Sources-->>Scraper: Retorna melhor candidato de imagem (URL)
    Scraper->>Storage: Salva em `pendingCovers` + atualiza `searchedIssues`
    Scraper->>UI: Atualiza % de progresso no Header (`🖼️ Capas: XX%`)
    
    User->>UI: Clica na edição (Modo Consulta)
    UI->>User: Abre modal de detalhes com moldura estética 2:3
    Note over UI,User: Imagem exibida com badge "Pendente de Aprovação"
    User->>UI: Clica no botão "✓ Aprovar e Fixar Capa Oficial"
    UI->>Storage: Move para `issueCovers` (capa aprovada definitiva)
    UI-->>User: Capa fixada e confirmada!
```

---
*Padrão de excelência técnica: Google Antigravity & SENAI Ourinhos Edition*
