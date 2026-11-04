# 🏛️ Arquitetura do Sistema: HQ Tracker

## 1. Visão Geral
O **HQ Tracker** é um sistema projetado para colecionadores de quadrinhos com foco em extrema agilidade no ambiente mobile ("Mobile First"). A aplicação opera em **tela única**, minimizando cliques, eliminando navegações desnecessárias, agrupando edições em blocos táteis de 10 em 10, categorizando coleções por Tipo e Editora, e permitindo ordenação personalizada com **Drag & Drop** e títulos específicos por edição para Minisséries e Coleções.

---

## 2. Diagrama de Fluxo e Componentes

```mermaid
flowchart TD
    User["📱 Usuário (Colecionador no Mobile / Desktop)"] --> UI["🖥️ Interface Web Mobile First (Vite + React)"]

    subgraph Frontend ["Camada de Interface (Frontend)"]
        UI --> Header["Cabeçalho Rápido + Status Cloud/Local"]
        UI --> AddForm["Entrada Rápida de HQ (Nome + Tipo + Editora)"]
        UI --> SortBar["Barra de Ordenação (A-Z, Z-A, Ordem Pessoal)"]
        UI --> FilterPanel["Painel de Filtros (Tipo, Editora, Status, Visão de Edições)"]
        UI --> ComicList["Lista de Coleções (Cards com Drag & Drop Nativo)"]
        
        ComicList --> ChunkEngine["Mecanismo Estrito de Blocos de 10 (Chunking)"]
        ChunkEngine --> TactileCircles["Bolinhas Táteis (01 a 10, 11 a 20...)"]
        ChunkEngine --> IssueTitleModal["Modal de Título Específico (Duplo clique)"]
        ChunkEngine --> AutoSummarize["Resumo Automático (ex: 01..10)"]
        ChunkEngine --> StrictCollapse["Fechamento Automático de Blocos sem Itens"]
        
        ComicList --> DragHandle["Alça de Arrasto (::: + Controles Subir/Descer)"]
        ComicList --> Badges["Badges Clicáveis (Alternância de Tipo e Editora)"]
        ComicList --> SeriesEnder["Botão Encerrar (Minissérie/Coleção ex: 01..06)"]
        ComicList --> EditModal["Edição de Nome, Tipo, Editora & Exclusão com Confirmação"]
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

## 3. Lógica dos Modos de Ordenação

1. **A-Z:** Ordenação alfabética crescente baseada no nome da HQ.
2. **Z-A:** Ordenação alfabética decrescente baseada no nome da HQ.
3. **Ordem Pessoal (Drag & Drop):**
   * Cada card possui a propriedade `position: number`.
   * Ao arrastar e soltar um card usando a alça `:::`, a aplicação comuta imediatamente para o modo `Ordem Pessoal`, atualiza as posições de todos os cards e sincroniza no Firestore e LocalStorage via `saveAllComicsOrder`.
   * No mobile, além do arrasto tátil, há botões rápidos de subir (`↑`) e descer (`↓`) na alça.

---

## 4. Regra Estrita de Blocos Abertos (10 em 10)

```mermaid
stateDiagram-v2
    [*] --> Bloco1_10: Inicial (ownedNumbers vazio)
    Bloco1_10 --> Marcou10: Clica no número 10
    Marcou10 --> Bloco11_20Aberto: Abre bloco 11 a 20
    
    Bloco11_20Aberto --> Desmarcou10SemNadaNoProximo: Desmarca o 10 (nenhum em 11..20)
    Desmarcou10SemNadaNoProximo --> Bloco1_10: Bloco 11..20 fecha imediatamente!
    
    Bloco11_20Aberto --> MarcouAlgumEm11_20: Marcou (ex: 15)
    MarcouAlgumEm11_20 --> Bloco11_20Permanece: Permanece aberto até esvaziar
```

---
*Padrão de excelência técnica: Google Antigravity & SENAI Ourinhos Edition*
