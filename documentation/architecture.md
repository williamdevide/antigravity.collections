# 🏛️ Arquitetura do Sistema: HQs Collections `v1.6.0`

## 1. Visão Geral
O **HQs Collections** é um sistema projetado para colecionadores de quadrinhos com foco em extrema agilidade no ambiente mobile ("Mobile First"). A aplicação opera em **tela única**, minimizando cliques, eliminando navegações desnecessárias, agrupando edições em blocos táteis de 10 em 10, categorizando coleções por Tipo e Editora, permitindo ordenação personalizada com **Drag & Drop**, títulos específicos por fascículo, suporte a início em edições avançadas (`startFrom`), **ciclo interativo de 4 estágios com destaque em neon**, **scraper da Panini Brasil de alta precisão com suporte a Vol. N e resolução S300**, **carrossel condicional de sugestões de capas fechado após fixação**, **modal de alerta customizado de confirmação para desvinculação de capas** e **ações em lote (Aceitar Todos / Rejeitar Todos)**.

---

## 2. Diagrama de Fluxo e Componentes

```mermaid
flowchart TD
    User["📱 Usuário (Colecionador no Mobile / Desktop)"] --> UI["🖥️ Interface Web Mobile First (Vite + React)"]

    subgraph HeaderSection ["Cabeçalho e Navegação"]
        UI --> Brand["Logotipo + Versão v1.6.0 + Badge Mobile + Slogan"]
        UI --> CoverProgressBtn["Botão Tátil [🖼️ XX%] (Apenas Ícone e Porcentagem)"]
        UI --> ModeToggle["Alternador de Modo (Consulta 👁️ / Edição ✏️)"]
        UI --> ConnectionBadge["Status Conexão [☁️ Nuvem / 💾 Local] + Contadores [XX HQs • YY ed.]"]
    end

    subgraph CoverModalSection ["Modal de Status de Capas & Carrossel de Alternativas"]
        CoverProgressBtn --> CoverModal["Modal de Monitoramento Panini & Web"]
        CoverModal --> BatchActionsBar["Barra de Ações em Lote (Aceitar Todos / Rejeitar Todos)"]
        CoverModal --> IssueRow["Linha da Edição com Botões de Ação"]
        IssueRow --> RejectionTrigger["Rejeitar [✗] / Botão Galeria [🖼️]"]
        RejectionTrigger --> ExpandableCarousel["Carrossel Horizontal com TODAS as Ocorrências"]
        ExpandableCarousel --> SelectAlternative["Toque na Capa -> Define como Nova Pendente"]
        SelectAlternative --> ApproveBtn["Confirmar e Fixar via [✓]"]
    end

    subgraph ScraperEngine ["Motor de Busca Panini Brasil & Web de Alta Precisão"]
        CoverProgressBtn --> BackgroundWorker["Worker Assíncrono em Segundo Plano"]
        BackgroundWorker --> ScraperEndpoint["/api/scrape-cover (Vercel Serverless / Backend Express / Proxy Vite)"]
        
        ScraperEndpoint --> StrictValidator["Validador matchIssueNumber(title, comicName, issueNum)"]
        StrictValidator --> ComicNameCheck["Verificação de Pertencimento à HQ Pesquisada"]
        StrictValidator --> YearFilter["Isola anos de 4 dígitos (ex: 2025/2026) da numeração"]
        StrictValidator --> VolumeDetector["Diferencia Volume e Edição Panini ('Vol. 16' = Ed. 16)"]
        
        ScraperEndpoint --> ChronoRanker["Classificador Cronológico Decrescente"]
        ChronoRanker --> PaniniNewest["Panini Brasil: Anos 2026 > 2025 > 2024..."]
        ChronoRanker --> FandomVolRank["Fandom: Rank = (Volume * 10000) + Ano"]
        
        ScraperEndpoint --> AntiDuplicate["Garantia de Unicidade por Coleção (Sem repetição)"]
        ScraperEndpoint --> ProgressiveFallback["Fallback Progressivo: Rejeição busca próximo candidato mais antigo"]
    end

    subgraph ComicListSection ["Lista de Coleções (Cards com Drag & Drop Nativo)"]
        UI --> ComicList["Lista de Cards"]
        ComicList --> ChunkEngine["Mecanismo Estrito de Blocos de 10 (Chunking)"]
        ChunkEngine --> TactileCircles["Bolinhas Táteis em Linha Única (grid-cols-10)"]
        TactileCircles --> FourStageCycle["Ciclo de 4 Estágios (Owned -> Read -> Wishlist -> None)"]
        
        ChunkEngine --> IssueDetailModal["Modal de Detalhes da Edição (Modo Consulta)"]
        IssueDetailModal --> CoverFrame["Moldura Estética de Capa Ampliada (2:3)"]
        IssueDetailModal --> IntegratedCarousel["Carrossel Horizontal Condicional (Fechado quando Fixado)"]
        IntegratedCarousel --> DetailSelect["Toque na Variante -> Pré-visualização Imediata"]
        IssueDetailModal --> TextFreeCurator["Curadoria Sem Texto: Aprovar [✓] e Rejeitar [✗]"]
        IssueDetailModal --> UnlinkCoverPrompt["Botão Desvincular Capa"]
        UnlinkCoverPrompt --> CustomConfirmModal["Modal Customizado de Confirmação (Alerta Vermelho)"]
        CustomConfirmModal --> ReopenCarousel["Confirmação: Remove Capa Fixada e Reabre Carrossel"]
    end

    subgraph DataSync ["Motor de Sincronização Híbrida"]
        UI --> StorageLayer["Camada de Armazenamento"]
        StorageLayer --> LocalStorage["💾 Cache Local (LocalStorage / Offline-First)"]
        StorageLayer --> Firestore["☁️ Google Cloud Firestore (Nuvem em Tempo Real)"]
    end
```

---

## 3. Lógica do Validador Estrito e Fallback Cronológico

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário
    participant UI as HQs Collections UI
    participant Engine as Scraper Engine
    participant Sources as Panini / Fandom / OpenLib

    User->>UI: Solicita capa da Edição #2 do Wolverine
    UI->>Engine: searchIssueCover('Wolverine', 2, rejectedUrls=[])
    Engine->>Sources: Busca por edições com numeração #2
    Sources-->>Engine: Retorna candidatos (Vol 8 #2 [2025], Vol 7 #2 [2020], Vol 1 #2 [1988])
    Note over Engine: Filtra páginas sem #2 (descarta retratos e posters)
    Note over Engine: Ordena por Rank: Vol 8 (2025) > Vol 7 (2020) > Vol 1 (1988)
    Engine-->>UI: Sugere capa da edição mais nova: Wolverine Vol 8 #2 (2025)
    
    alt Usuário aprova a capa
        User->>UI: Clica em [✓]
        UI->>UI: Fixa como capa oficial da Edição #2
    else Usuário rejeita a capa
        User->>UI: Clica em [✗]
        UI->>Engine: Re-busca adicionando URL de 2025 em rejectedUrls
        Engine-->>UI: Retorna próxima alternativa mais antiga: Wolverine Vol 7 #2 (2020)
    end
```

---
*Padrão de excelência técnica: Google Antigravity & SENAI Ourinhos Edition*
