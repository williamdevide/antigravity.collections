# 📋 Diretiva: Controle Rápido de Coleções de HQs (Mobile-First)

## 1. Visão Geral e Propósito
Aplicação Web First Mobile para controle ágil de coleções de Histórias em Quadrinhos, Especiais, Minisséries e Coleções em tela única.

## 2. Tipos de Publicação e Identidade Visual
* **Mensal:** Fundo Azul Escuro (`#0E1A30`), bordas azuis.
* **Especial:** Fundo Vermelho Escuro (`#220B10`), bordas carmesim.
* **Minissérie:** Fundo Verde Escuro (`#0B2117`), bordas esmeralda.
* **Coleção:** Fundo Roxo Escuro / Violeta (`#240D33`), bordas lilás/púrpura.

## 3. Títulos Individuais por Edição
* Para títulos do tipo **Minissérie** ou **Coleção**, edições individuais podem ter nomes específicos.
* Acionado por **duplo clique** (desktop) ou **toque prolongado / clique duplo** (mobile).
* As bolinhas com título personalizado exibem um indicador visual (dot lilás) e tooltip com o título da edição.

## 4. Ordenação e Reordenação Manual (Drag & Drop)
* **Modos de Ordenação:**
  - `A-Z`: Alfabética crescente.
  - `Z-A`: Alfabética decrescente.
  - `Ordem Pessoal`: Ordem customizada manual pelo colecionador.
* Alça de arrasto (`:::`) em cada card para movimentação suave em dispositivos móveis e desktop sem conflito de rolagem.
* Ao soltar um card, a ordem pessoal é atualizada e salva automaticamente no Firestore e LocalStorage.

## 5. Dinâmica Estrita dos Blocos de 10 em 10
* Se o número `10` estiver marcado: abre o bloco `11..20`.
* Se o número `10` for desmarcado e nenhuma edição de `11..20` estiver selecionada: o bloco `11..20` é fechado imediatamente e não reaparece em sessões futuras.

## 6. Persistência e Deploy
* Armazenamento híbrido: Offline-First LocalStorage + Firestore em tempo real.
* Deploy contínuo na Vercel sincronizado com o repositório GitHub.
