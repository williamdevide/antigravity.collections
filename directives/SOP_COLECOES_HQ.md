# 📋 Diretiva: Controle Rápido de Coleções de HQs (HQs Collections)

## 1. Visão Geral e Propósito
Aplicação Web First Mobile para controle ágil de coleções de Histórias em Quadrinhos, Especiais, Minisséries e Coleções em tela única.
* **Nome Oficial:** `HQs Collections`
* **Versão:** `1.9.1`

## 2. Header, Menu Hambúrguer & Navegação Mobile First
* **Marca e Identidade com Menu Hambúrguer Integrado:** Ao tocar em qualquer ponto do logotipo (`BookOpen`), título ou versão no cabeçalho, uma elegante **Gaveta Lateral (Drawer Menu)** desliza da esquerda com efeito de desfoque de fundo (backdrop-blur).
* **Opções da Gaveta Lateral:**
  - **Meu Perfil:** Informações da conta, atualização de nome, troca de senha e ação de risco "Zerar Minha Coleção".
  - **Entrada por Voz:** Interface tátil e auditiva para ditar comandos e cadastrar HQs automaticamente.
  - **Configurações Visuais:** Personalização livre de cores de fundo (Modos Consulta, Edição e Capas) e 5 presets prontos.
  - **Status de Busca de Capas:** Acesso direto ao painel com porcentagem e curadoria de capas da Panini.
  - **Sair da Conta:** Desconexão segura do Firebase Auth com limpeza de sessão.
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
* **Cálculo Realista de Progresso (% Fixadas):** A porcentagem reflete estritamente a proporção de edições com capa oficial aprovada e fixada (`(fixedCount / totalIssues) * 100`). Ao rejeitar ou cancelar capas pendentes, a porcentagem diminui com precisão, nunca ficando estagnada em 100%.
* Métricas em tempo real: `% Fixadas`, `Buscadas`, `Fixadas` e `Pendentes`.
* Abas de navegação rápida: `Todas`, `Encontradas`, `Em Busca` e `Sem Capa / Rejeitadas`.
* Ações diretas por edição sem texto: Aprovar (✓ verde), Rejeitar (✗ vermelho), Desvincular e Re-buscar.
* **Foco Estável e Sem Saltos de Edição:** Ao selecionar uma alternativa ou alterar status no carrossel, o item expandido é protegido e travado na visualização, impedindo que a lista mude de foco ou salte de edição.
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

## 10. Propagação Inteligente de Séries de Capas & Indicadores Visuais
* **Auxílio Automatizado por Confirmação:** Ao escolher e aprovar a capa de uma edição (ex: Wolverine #16 da Panini 2025 ou Fandom Vol 8), o sistema armazena a série identificada (`preferredSeries` contendo Ano, Volume e Fonte).
* **Alinhamento para Outras Edições:** Automaticamente busca e sugere para **todas as outras edições** daquela HQ que ainda não possuem capa fixada as imagens pertencentes à mesma série/ano/volume, substituindo sugestões pendentes divergentes.
* **Segurança e Confirmação Pendente:** As novas capas sugeridas permanecem no estado **pendente de aprovação** (`status === 'pending'`), exigindo que o colecionador revise e confirme cada uma com o botão verde (`✓`).
* **Trava de Foco Rigorosa:** A aprovação ou troca de capa mantém estritamente a edição sob foco aberta no modal de detalhes ou no status de busca, sem saltar para outra edição.
* **Indicadores Visuais Completos de Série Alinhada:**
  - **Bolinhas das Edições (Tela Principal):** Ponto pulsante âmbar/dourado com ícone de raio (`⚡`) no canto inferior direito da bolinha e tooltip explicativo para qualquer edição que disponha de uma sugestão de capa alinhada à série pronta para aprovação.
  - **Cards das HQs (Linha 2):** Badge `⚡ Série: [Ano/Fonte]` posicionado ao lado dos metadados da HQ (em cards ativos, coleções concluídas e no Modo Consulta Capa).
  - **Modal de Detalhes da Edição:** Banner temático violeta/âmbar destacando `⚡ Sugestão da Mesma Série` com a indicação da série de origem e orientação para confirmação rápida pelo botão `✓`.
  - **Painel de Status de Capas:** Badge pulsante `⚡ Sugestão da Série ([Ano/Fonte])` na identificação do fascículo.

## 11. Autenticação e Multi-Tenancy (Firebase Auth)
* **Login Obrigatório na Inicialização:** Tela de entrada com suporte a autenticação oficial Google (`loginWithGoogle`) e cadastro/login com E-mail e Senha (`loginWithEmail`, `registerWithEmail`).
* **Recuperação de Senha & Lembrar E-mail:** Envio de e-mail seguro para redefinição de credenciais (`resetPassword`) e persistência opcional do e-mail no navegador.
* **Isolamento de Coleções por Usuário:** Cada usuário possui subcoleções isoladas no Cloud Firestore (`/users/{userId}/comics/{comicId}` e `/users/{userId}/settings/preferences`), com chave de cache local dedicada e regras de segurança v2 com fallback retrocompatível.

## 12. Painel "Meu Perfil" e Zerar Coleção com Confirmação
* **Acesso:** Disponível na gaveta lateral (Menu Hambúrguer).
* **Edição de Perfil:** Atualização de nome de exibição (`displayName`) e alteração de senha de acesso.
* **Zerar Minha Coleção (Segurança Máxima):** Botão na zona de perigo que abre o modal de confirmação irreversível. O botão vermelho de exclusão só é desbloqueado se o usuário digitar exatamente a palavra de segurança `ZERAR` em letras maiúsculas. Ao confirmar, executa limpeza atômica em batch no Firestore e LocalStorage.

## 13. Configurações Visuais e Paletas de Cores
* **5 Presets Elegantes (1-Clique):**
  - **Dark Slate (Padrão):** Fundo original de alto contraste (`#070B14`, `#0c1e38`, `#0b1220`).
  - **Dark Navy (Oceano):** Tons azuis náuticos profundos (`#0a192f`, `#112240`, `#020c1b`).
  - **Deep Purple (Galáxia):** Ambientação cósmica violeta e lilás (`#130924`, `#27104d`, `#1e0836`).
  - **Cyberpunk (Neon):** Base escura de alto realce para bordas neon (`#090d16`, `#16122c`, `#0c192c`).
  - **Charcoal (Minimalista):** Tons neutros de cinza grafite e preto puro (`#121212`, `#1e1e1e`, `#181818`).
* **Seletores Livres de Cor:** Controles com seletor nativo `<input type="color">` e código hexadecimal para customizar individualmente os fundos dos Modos Consulta, Edição e Consulta Capa.
* **Preferências de Interface:** Ajustes de densidade de cards (Compacto / Normal / Amplo) e feedback tátil (vibração).

## 14. Entrada por Voz Inteligente (Web Speech API PT-BR)
* **Microfone Dinâmico com Ondas Sonoras:** Interface tátil com botão pulsante e anéis concêntricos que ativam a Web Speech API no idioma Português do Brasil (`pt-BR`).
* **Transcrição e Fallback:** Transcrição em tempo real da fala e área de texto editável para pequenos ajustes manuais antes do cadastro.
* **Parser Semântico Estruturado (`parseVoiceComicCommand`):** Extrai automaticamente o nome da HQ (ex: *"Wolverine"*), a editora (ex: *"Marvel"*), o tipo de publicação (ex: *"Mensal"*) e o intervalo ou lista de edições (ex: *"01 até 09"*).
* **Detecção Inteligente de HQ Existente:** Se a HQ já estiver cadastrada na coleção, mescla as edições sem sobrescrever o histórico anterior; se for uma nova série, cria o card no topo do acervo.
* **Disparo Automático de Capas:** Ao confirmar a inclusão, o robô de busca de capas Panini é iniciado imediatamente em segundo plano para todas as edições cadastradas.
