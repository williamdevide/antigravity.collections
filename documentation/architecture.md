# 🏛️ Arquitetura do Sistema: HQ Tracker

## 1. Visão Geral
O **HQ Tracker** é um sistema projetado para colecionadores de quadrinhos com foco em extrema agilidade no ambiente mobile ("Mobile First"). A aplicação opera em **tela única**, minimizando cliques, eliminando navegações desnecessárias e agrupando edições em blocos táteis de 10 em 10.

---

## 2. Diagrama de Fluxo e Componentes

```mermaid
flowchart TD
    User["📱 Usuário (Colecionador no Mobile)"] --> UI["🖥️ Interface Web Mobile First (Vite + React)"]

    subgraph Frontend ["Camada de Interface (Frontend)"]
        UI --> Header["Cabeçalho Rápido + Status Cloud/Local"]
        UI --> AddForm["Entrada Rápida de HQ (Enter / +)"]
        UI --> SearchFilter["Busca Instantânea & Ordenação A-Z"]
        UI --> ComicList["Lista de Coleções (Cards Interativos)"]
        
        ComicList --> ChunkEngine["Mecanismo de Blocos de 10 (Chunking)"]
        ChunkEngine --> TactileCircles["Bolinhas Táteis (01 a 10, 11 a 20...)"]
        ChunkEngine --> AutoSummarize["Resumo Automático (ex: 01..10)"]
        ChunkEngine --> ManualExpand["Alternar Expansão com 1 Clique"]
        
        ComicList --> SeriesEnder["Botão Encerrar (Minissérie ex: 01..06)"]
        ComicList --> EditModal["Edição de Nome & Exclusão com Confirmação"]
    end

    subgraph DataSync ["Motor de Sincronização Híbrida"]
        UI --> StorageLayer["Camada de Armazenamento"]
        StorageLayer --> LocalStorage["💾 Cache Local (LocalStorage / Offline-First)"]
        StorageLayer --> Firestore["☁️ Google Cloud Firestore (Nuvem em Tempo Real)"]
    end

    subgraph Automation ["Camada 3: Execução Determinística"]
        Scripts["/execution"] --> DeployGH["deploy_github.js"]
        Scripts --> DeployVercel["deploy_vercel.js"]
        Scripts --> TestFB["test_firebase.js"]
    end
```

---

## 3. Lógica do Mecanismo de Chunking (10 em 10)

```mermaid
stateDiagram-v2
    [*] --> BlocoAberto: Cadastro da HQ
    BlocoAberto --> MarcandoEdicoes: Clique nas bolinhas (01..10)
    MarcandoEdicoes --> ChegouNo10Incompleto: Marcou 10, mas faltam anteriores
    ChegouNo10Incompleto --> AbreProximaDezena: Abre 11..20, mantém 01..10 detalhado
    
    MarcandoEdicoes --> Todos10Marcados: Todos de 01 a 10 preenchidos
    Todos10Marcados --> BlocoResumido: Colapsa em '01..10' e abre 11..20
    
    BlocoResumido --> BlocoExpandido: Clique no badge '01..10'
    BlocoExpandido --> BlocoResumido: Clique para recolher ou preenchimento total
    
    BlocoAberto --> MinisserieConcluida: Clique em 'Encerrar'
    MinisserieConcluida --> ResumoFinal: Resume '01..XX' (ex: 01..06)
```

---

## 4. Estrutura de Pastas Padronizada

```text
/antigravity.collections
├── .env                          # Variáveis de ambiente (Firebase, GitHub)
├── firestore.rules               # Regras de segurança do Firestore
├── vercel.json                   # Configuração de publicação na Vercel
├── package.json                  # Scripts unificados de gerenciamento
├── README.md                     # Documentação profissional bilíngue
├── /directives                   # Camada 1: Diretivas Estratégicas (SOPs)
│   └── SOP_COLECOES_HQ.md
├── /execution                    # Camada 3: Scripts de Automação Determinística
│   ├── build_all.js
│   ├── deploy_github.js
│   ├── deploy_vercel.js
│   └── test_firebase.js
├── /documentation                # Documentação técnica e histórico
│   ├── architecture.md
│   ├── firebase_setup.md
│   └── promptHistory.md
├── /frontend                     # Aplicação Web Mobile First (React + Tailwind)
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx
│       ├── firebase.js
│       ├── index.css
│       └── main.jsx
└── /backend                      # API de Apoio (Node.js + Express)
    ├── package.json
    └── src/
        └── server.js
```

---
*Padrão de excelência técnica: Google Antigravity & SENAI Ourinhos Edition*

