# 📋 Diretiva: Controle Rápido de Coleções de HQs (Mobile-First)

## 1. Visão Geral e Propósito
Desenvolver uma aplicação Web First Mobile para controle ágil de coleções de Histórias em Quadrinhos (HQs e minisséries). A experiência deve ser concentrada em uma única tela, com alta responsividade tátil, carregamento instantâneo e facilidade para marcar edições individuais ou em blocos.

## 2. Requisitos Funcionais
* **Entrada Rápida:** Campo para digitar o nome do título da HQ e confirmar.
* **Blocos de 10 em 10 (Chunking):**
  - Exibição inicial das edições de 01 a 10 como bolinhas/chips táteis clicáveis.
  - Ao selecionar a 10ª edição:
    - Se todas as edições anteriores (01 a 10) estiverem selecionadas, o intervalo é resumido visualmente como `01..10` e o próximo intervalo (11 a 20) é aberto imediatamente.
    - Se a 10ª edição for selecionada mas faltarem números anteriores no intervalo, o próximo intervalo (11 a 20) se abre, mas o bloco anterior continua detalhado com suas respectivas bolinhas.
* **Encerramento de Coleção / Minissérie:**
  - Botão na linha para "Encerrar" a coleção (ex: minissérie concluída em 06 edições).
  - Ao encerrar, sintetiza o resumo do que foi obtido (ex: `01..06`).
* **Edição e Exclusão:**
  - Clicar no nome da HQ abre modal/modo inline para edição do nome.
  - No modo de edição, possibilita a exclusão do item mediante confirmação explícita.
* **Persistência e Nuvem:**
  - Banco de dados Firestore (Firebase) com sincronização em tempo real e cache offline para uso fluido no celular.
  - Versionamento Git/GitHub e implantação na Vercel.

## 3. Arquitetura da Solução
* **Frontend:** React 18+ com Vite, Tailwind CSS, Lucide Icons, Mobile Viewport First.
* **Backend:** Camada de serviços Firebase (Firestore client + security rules) e endpoints de apoio em Node.js/Express.
* **Automação de Execução:** Scripts determinísticos em `/execution` para build, lint, testes e deploy.

