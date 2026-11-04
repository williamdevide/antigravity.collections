# 📋 Diretiva: Controle Rápido de Coleções de HQs (HQs Collections)

## 1. Visão Geral e Propósito
Aplicação Web First Mobile para controle ágil de coleções de Histórias em Quadrinhos, Especiais, Minisséries e Coleções em tela única.
* **Nome Oficial:** `HQs Collections`
* **Versão:** `1.1.0`

## 2. Sistema de 4 Estágios por Edição (Modo Edição)
* **Estágio 0 (Original / Desmarcado):** Não tenho e não pretendo comprar (`none`).
* **Estágio 1 (Amarelo Sólido):** Comprei / Tenho a edição (`owned`).
* **Estágio 2 (Amarelo com Borda Azul Neon):** Tenho e Já Li a edição (`read`).
* **Estágio 3 (Desmarcado com Borda Pink Neon):** Quero Comprar / Lista de Desejos (`wishlist`).
* Ciclo ao clicar no Modo Edição: `none ➔ owned ➔ read ➔ wishlist ➔ none`.

## 3. Filtros por Estágio de Edição
O painel de filtros permite visualizar:
* Todas as Edições.
* Compradas (Tenho).
* Já Lidas (Tenho e Li).
* Quero Comprar (Pink Neon).
* Não Pretendo Comprar.

## 4. Scraper de Capas Panini & Web em Segundo Plano
* Busca automática em segundo plano, preferencialmente Panini Brasil (`panini.com.br`) com fallback geral na web (Fandom/OpenLibrary).
* Ordenação por padrão do **ano mais recente para trás**.
* **Progresso no Header:** Exibe a porcentagem de buscas completas em relação ao número total de edições ativas (ex: `🖼️ Capas: XX%`).
* **Fluxo de Aprovação com V Verde:** Quando a capa é localizada, ela fica no estado "Pendente de Aprovação". Na tela de detalhes da edição, o usuário clica no botão verde com `V` (`✓ Fixar Capa`) para fixá-la definitivamente à edição.

## 5. Tela de Detalhes da Edição (Modo Consulta)
* Ao clicar sobre o número da edição no Modo Consulta, abre a tela de detalhes com moldura estética ampliada de gibi (proporção 2:3).
* Apresenta o status da edição, título do fascículo, ano de início, editora no Brasil e herói principal.
