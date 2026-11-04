# 📋 Diretiva: Controle Rápido de Coleções de HQs (Mobile-First)

## 1. Visão Geral e Propósito
Aplicação Web First Mobile para controle ágil de coleções de Histórias em Quadrinhos, Especiais, Minisséries e Coleções em tela única.

## 2. Tipos de Publicação e Identidade Visual
* **Mensal:** Fundo Azul Escuro (`#0E1A30`), bordas azuis.
* **Especial:** Fundo Vermelho Escuro (`#220B10`), bordas carmesim.
* **Minissérie:** Fundo Verde Escuro (`#0B2117`), bordas esmeralda.
* **Coleção:** Fundo Roxo Escuro / Violeta (`#200A2C`), bordas lilás/púrpura.

## 3. Ponto de Partida Customizado (`startFrom`)
* Para HQs que o colecionador começou a colecionar em edições avançadas (ex: nº 32):
  - Campo `Começar no nº` no cadastro e na edição.
  - O card abre diretamente na dezena correspondente (ex: `31..40`), permitindo marcar o fascículo imediatamente.
  - Dezenas anteriores (ex: `01..30`) ficam ocultas por padrão, com um badge compacto `01..30 (Ocultas)` caso o colecionador deseje expandir retroativamente no futuro.

## 4. Títulos Individuais por Edição
* Para títulos do tipo **Minissérie** ou **Coleção**, edições individuais podem ter nomes específicos.
* Acionado por duplo clique sobre o número da edição.
* Indicador visual na bolinha e tooltip com o título da edição.

## 5. Ordenação e Reordenação Manual (Drag & Drop)
* Modos: `A-Z`, `Z-A` e `Ordem Pessoal`.
* Alça de arrasto (`:::`) em cada card com sincronização em tempo real.

## 6. Dinâmica Estrita dos Blocos de 10 em 10
* Se o número múltiplo de 10 estiver marcado: abre a próxima dezena.
* Se for desmarcado sem nenhum item no bloco seguinte: o bloco seguinte fecha imediatamente.

## 7. Persistência e Deploy
* Armazenamento híbrido: Offline-First LocalStorage + Firestore em tempo real.
* Deploy contínuo na Vercel sincronizado com o repositório GitHub.
