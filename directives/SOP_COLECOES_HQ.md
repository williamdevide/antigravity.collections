# 📋 Diretiva: Controle Rápido de Coleções de HQs (HQs Collections)

## 1. Visão Geral e Propósito
Aplicação Web First Mobile para controle ágil de coleções de Histórias em Quadrinhos, Especiais, Minisséries e Coleções em tela única.
* **Nome Oficial:** `HQs Collections`
* **Versão:** `1.8.0`

## 2. Header & Navegação Mobile First
* **Marca e Identidade:** Logotipo `BookOpen`, Título `HQs Collections`, versão SemVer (`v1.7.0`), badge `Mobile` e slogan `Controle Ágil de Coleções`.
* **Monitor de Capas no Header:** Objeto tátil composto estritamente pelo ícone e pela porcentagem (ex: `🖼️ 85%`), sem o texto "capas". Ao tocar nesse objeto, abre o **Modal Detalhado de Status da Busca de Capas**.
* **Alternador Cíclico de 3 Modos:** Botão único no cabeçalho com ciclo de 3 toques:
  - **Modo Consulta (Eye):** Exibe a lista completa de coleções com blocos de dezenas e dezenas expandidas.
  - **Modo Edição (Pencil):** Permite preenchimento dos 4 estágios táteis e edição de títulos e configurações da HQ.
  - **Modo Consulta Capa (ScanEye):** Exibe uma galeria em grade (2 colunas no mobile) focada nas capas e na última edição adquirida de cada coleção.
* **Badge de Conexão e Estatísticas:** Status em tempo real (`Nuvem` / `Local`) e contagem total (`XX HQs • YY ed.`).

## 3. Sistema de 4 Estágios por Edição (Modo Edição)
* **Estágio 0 (Original / Desmarcado):** Não tenho e não pretendo comprar (`none`).
* **Estágio 1 (Amarelo Sólido):** Comprei / Tenho a edição (`owned`).
* **Estágio 2 (Amarelo com Borda Azul Neon):** Tenho e Já Li a edição (`read`).
* **Estágio 3 (Desmarcado com Borda Pink Neon):** Quero Comprar / Lista de Desejos (`wishlist`).
* Ciclo ao clicar no Modo Edição: `none ➔ owned ➔ read ➔ wishlist ➔ none`.

## 4. Scraper Panini Brasil & Web em Segundo Plano
* **Busca Forçada no panini.com.br:** O scraper executa buscas automatizadas no catálogo oficial da Panini Brasil utilizando curl/serverless e fallback com proxy de cliente para contornar bloqueios de CDN/Fastly e capturar capas originais de alta resolução sem erros 302 do Cloudfront (-S300-FWEBP).
* **Validação Estrita do Título e Edição:** Função `matchIssueNumber` valida estritamente tanto o nome da HQ quanto o número da edição alvo (ex: `#16` ou `Vol. 16` no padrão editorial brasileiro da Panini), impedindo que títulos alheios (ex: Deadpool) interfiram ou que anos de 4 dígitos sejam confundidos com o fascículo.
* **Ordenação Cronológica Estrita (Mais Recentes Primeiro):** A busca prioriza sempre as publicações mais novas (2025/2026, maiores volumes na Fandom como Vol 8 > Vol 7 > Vol 6...).
* **Unicidade por Coleção:** Uma URL de capa já atribuída a uma edição é bloqueada para qualquer outro fascículo da mesma HQ.
* **Fallback Progressivo por Rejeição:** Ao rejeitar uma capa, o sistema descarta a imagem atual e busca automaticamente a próxima alternativa mais antiga disponível.

## 5. Modal de Status da Busca de Capas
* Acessível diretamente pelo botão de porcentagem no cabeçalho.
* Métricas em tempo real: `% Progresso`, `Buscadas`, `Fixadas` e `Pendentes`.
* Abas de navegação rápida: `Todas`, `Encontradas`, `Em Busca` e `Sem Capa / Rejeitadas`.
* Ações diretas por edição sem texto: Aprovar (✓ verde), Rejeitar (✗ vermelho), Desvincular e Re-buscar.
* **Ações em Lote (Aceitar Todos / Rejeitar Todos):**
  - Botão **Aceitar Todos**: Aprova em lote todas as capas pendentes de aprovação na coleção (ou no filtro pesquisado), gravando-as como capas fixadas no Firestore/LocalStorage via `saveComicsBatch`.
  - Botão **Rejeitar Todos**: Rejeita em lote todas as capas pendentes, adicionando-as aos arrays de rejeição e disparando buscas sequenciais pelas edições cronologicamente anteriores.
  - **Proteção Estrita de Integridade:** As ações em lote operam *exclusivamente* sobre edições pendentes (`status === 'pending'`), nunca alterando ou desvinculando edições que já haviam sido aprovadas anteriormente.
* **Carrossel de Todas as Ocorrências Encontradas (Ao Rejeitar ou Botão de Galeria):**
  - Ao clicar no botão **✗ (Rejeitar)** na tela de status de busca de capas, a imagem atual é registrada no histórico de rejeições e a linha da edição se **expande automaticamente**.
  - O sistema consulta e reúne **todas as ocorrências** daquela HQ e número em todas as fontes (Panini Brasil, Marvel/DC Fandom com volumes 10 a 1 e OpenLibrary).
  - Um carrossel horizontal tátil com scroll exibe todas as opções encontradas lado a lado, com thumbnail nítido, ano de publicação, volume e fonte.
  - Ao tocar em qualquer capa do carrossel, ela é definida como a **nova candidata pendente**, permitindo ao usuário conferir a miniatura e aprovar com o botão verde (✓).
  - Um botão com ícone de galeria (`Images`) na linha permite ao colecionador abrir esse carrossel a qualquer momento para explorar todas as variantes.

## 6. Fluxo de Curadoria de Capa (Aprovar / Rejeitar sem texto)
* Tanto no card de detalhes da edição quanto no modal de busca de capas, a capa encontrada pendente apresenta dois botões dedicados **SEM TEXTO**:
  - **Aprovar:** Botão verde com ícone `Check` (`✓`) que fixa a capa como imagem oficial daquela edição no Firestore e LocalStorage.
  - **Rejeitar:** Botão vermelho com ícone `X` (`✗`) que descarta a imagem, armazena no histórico de rejeições daquela edição e dispara a busca imediata da versão cronologicamente anterior.

## 7. Carrossel de Alternativas na Tela de Detalhes da Edição
* Ao clicar sobre qualquer número de edição no Modo Consulta, o modal de detalhes exibe a capa ampliada e, logo abaixo, um **carrossel horizontal integrado** com todas as ocorrências e sugestões de capas encontradas para aquela edição.
* **Ciclo de Vida Condicional:** Enquanto a edição tiver uma capa fixada oficialmente, o carrossel de sugestões permanece recolhido/fechado para manter a interface limpa e focada.
* **Carregamento Condicional:** Carrega em segundo plano assim que o modal de detalhes é aberto apenas se a edição ainda não possuir capa oficial fixada.
* **Seleção Imediata para Pré-visualização:** Ao tocar em qualquer miniatura do carrossel, a imagem selecionada é imediatamente exibida no quadro principal de pré-visualização, acompanhada dos botões de aprovação rápida (✓ verde) e rejeição (✗ vermelho). Ao aprovar (✓), a capa é fixada e o carrossel se fecha automaticamente.

## 8. Confirmação Customizada para Desvincular Capa
* Ao clicar no botão **Desvincular capa desta edição** (no modal de detalhes ou no painel de status), o sistema abre um **modal de alerta customizado** (`z-[70]`) com tema escuro e destaque em vermelho.
* Exibe miniatura da capa a ser desvinculada, número da edição e nome da HQ com opções **Cancelar** e **Sim, Desvincular**.
* Ao confirmar, a capa é desvinculada e o **carrossel de sugestões é imediatamente reaberto e recarregado**, permitindo selecionar e aprovar uma nova imagem instantaneamente.

## 9. Modo Consulta Capa (Cards Compactos em Grade)
* **Ativação:** Terceiro estado do botão cíclico do cabeçalho (ícone `ScanEye` com iluminação âmbar).
* **Grade Compacta Responsiva:** 2 colunas no mobile (`grid-cols-2`), expandindo para 3 a 5 colunas em tablets e desktops.
* **Composição do Card:**
  * **Capa da Última Edição que Tenho:** Proporção 2:3 com moldura e cantos arredondados, exibindo a capa da maior edição marcada como adquirida (`owned` ou `read`). Caso a coleção não possua edições ainda, exibe elegante moldura com aviso *"Sem edições"*.
  * **Linha 1:** Nome da HQ e número da última edição que tenho (ex: *"Wolverine #16"* ou *"Wolverine (Sem ed.)"*).
  * **Linha 2:** Badges compactos com a **Editora** e o **Tipo de Publicação** (ex: `[Marvel] [Mensal]`).
* **Interatividade ao Tocar:** Ao tocar no card, abre o **Modal de Detalhes daquela edição** exibindo a capa em tamanho ampliado, metadados e opções de curadoria. Suporta reordenação via Drag & Drop.

## 10. Propagação Inteligente de Séries de Capas
* **Auxílio Automatizado por Confirmação:** Ao escolher e aprovar a capa de uma edição (ex: Wolverine #16 da Panini 2025 ou Fandom Vol 8), o sistema armazena a série identificada (`preferredSeries` contendo Ano, Volume e Fonte).
* **Alinhamento para Outras Edições:** Automaticamente busca e sugere para **todas as outras edições** daquela HQ que ainda não possuem capa fixada as imagens pertencentes à mesma série/ano/volume, substituindo sugestões pendentes divergentes.
* **Segurança e Confirmação Pendente:** As novas capas sugeridas permanecem no estado **pendente de aprovação** (`status === 'pending'`), exigindo que o colecionador revise e confirme cada uma com o botão verde (`✓`).
* **Notificação Visual em Tempo Real:** Banner/toast discreto no topo do aplicativo informa o início do alinhamento da série e a conclusão da busca em lote.
* **Badges de Série Reconhecida:** Exibe distintivo visual `⚡ Série: [Ano/Fonte]` no modal de detalhes da edição e no painel de status de busca de capas.
