/**
 * Versão e Nome do Sistema
 * Gerenciado automaticamente pelo Agente Orquestrador sob o padrão SemVer (MAJOR.MINOR.PATCH)
 * v1.11.3: Refinamento dos agrupamentos 01..10 e de minisséries completas: borda azul neon vibrante
 *          (border-2 border-cyan-400 com brilho neon) idêntica à das bolinhas individuais para edições lidas,
 *          e quando todas forem desejo, agrupamento com borda pink neon (border-2 border-pink-500) e
 *          preenchimento escuro com texto rosa (bg-slate-900 text-pink-300) idêntico às bolinhas de Desejo,
 *          eliminação de interferência de sombra CSS e suporte dinâmico a avanços de dezenas por edições desejadas.
 * v1.11.2: Refinamento estético da barra de ordenação mobile: botões A-Z e Z-A compactos apenas com ícones,
 *          renomeação de 'Personagem' para 'Herói' e de 'Pessoal' para 'Usuário' com ícone dedicado e
 *          encaixe fluido em linha única em todas as resoluções de smartphone.
 * v1.11.1: Botões da busca por ISBN com exibição compacta exclusiva por ícones (Buscar e Câmera),
 *          manutenção estrita das cores originais dos 4 estágios das bolinhas (amarelo sólido para Tenho,
 *          amarelo com borda azul neon vibrante para Lido, escuro com borda pink neon para Desejo) nos
 *          agrupamentos 01..10 e de minisséries encerradas independentemente do tema do card, rolagem
 *          suave automática (smooth scroll) até o card da nova HQ cadastrada ou atualizada com animação
 *          de anel pulsante, e correção da lombada vertical (-90°) do Herói Principal no lado esquerdo
 *          do card utilizando writing-mode vertical sem corte de caracteres e espaço fixo unificado em todos os cards.
 * v1.11.0: Substituição integral de marca para 'HQ Collections', Tela de Splash animada com logotipo,
 *          slogan e barra de progresso vinculada ao carregamento completo da coleção, autenticação com
 *          persistência de sessão ('Manter usuário conectado') no login e no perfil, agrupamentos 01..10
 *          com bordas neon estilizadas (azul neon para lidos, pink neon para desejo, preenchimento âmbar
 *          para tenho), recolhimento do bloco expandido ao tocar na área da div, nova ordenação por
 *          Personagem Principal e título, faixa vertical estilizada (-90°) do Herói/Personagem no lado
 *          esquerdo de cada card, e módulo de inclusão com busca e escaneamento de código de barras (ISBN)
 *          via câmera do celular e APIs BrasilAPI / Google Books / OpenLibrary com marcação automática de Tenho.
 * v1.10.2: Endpoint Serverless Panini Brasil oficial (/api/scrape-cover), middleware de desenvolvimento
 *          no Vite (vite.config.js) com fetch Node.js direto contornando bloqueios de proxy/WAF,
 *          priorização de consulta com preenchimento em 2 dígitos ('Wolverine 01'), bônus massivo (+600k)
 *          para correspondência exata do título base da série (eliminando falsos positivos e spinoffs
 *          como 'Novíssima Wolverine' em buscas por 'Wolverine') e penalização severa (-200k) para capas
 *          variantes de revendedores (ex: 616 Comics Exclusive, Homage, etc.).
 * v1.10.1: Descoberta dinâmica e tradução automática de títulos PT-BR ➔ EN via API da Wikipédia/Wikidata,
 *          expansão massiva do catálogo DC Comics/Vertigo (A Brigada dos Encapotados / The Trenchcoat Brigade,
 *          Os Livros da Magia, Hellblazer, Sandman, etc.), busca resiliente com e sem artigos ('The', 'A', 'O')
 *          e pontuação com bônus prioritário (+500k) para candidatos com número de edição explícito correspondente.
 * v1.10.0: Quarto Modo de Visualização "Consulta Total com Capas" (appMode === 'capas_total') com
 *          botão cíclico de 4 modos no header (Consulta [Eye] ➔ Edição [Pencil] ➔ Consulta Capa [ScanEye]
 *          ➔ Consulta Total com Capas [LayoutGrid]), exibindo cada card de HQ com grade adaptativa completa
 *          de minicapas verticais na proporção 2:3 de gibi (5 colunas mobile / 10 desktop), bordas dos estágios
 *          (amarelo tenho, ciano neon já li, pink neon quero comprar, escuro não pretendo), número da edição
 *          fixado no canto inferior esquerdo de cada capa (#{format2(n)}) e seletor de cor de fundo dedicado.
 * v1.9.2: Scraper Multi-Wiki Fandom (Star Wars/Wookieepedia, Marvel, DC, Image, Dark Horse, Disney),
 *          dicionário de tradução de títulos PT-BR/EN, suporte a graphic novels/volumes únicos na edição #01
 *          e busca bibliográfica global na Open Library.
 * v1.9.1: Trava de foco estrito sem saltos de edição no carrossel de capas, cálculo realista da
 *          porcentagem de capas (% Fixadas) e indicadores visuais completos de séries alinhadas (⚡).
 * v1.9.0: Menu Hambúrguer ao tocar na marca/logo com gaveta lateral elegante, Autenticação de Usuários
 *         (Firebase Auth com Google e E-mail/Senha, persistência de login e recuperação de senha),
 *         Painel Meu Perfil com atualização de nome de exibição, alteração de senha e ação de segurança
 *         'Zerar Minha Coleção' com confirmação estrita da palavra 'ZERAR', Tela de Configurações Visuais
 *         com 5 presets prontos e seletores livres de cor para os modos Consulta, Edição e Consulta Capa,
 *         e Módulo de Entrada por Voz com Web Speech API (PT-BR), transcrição em tempo real, parser
 *         estruturado inteligente de HQs e cadastro/mesclagem instantânea no catálogo.
 * v1.8.0: Propagação inteligente de séries de capas: ao confirmar a capa de uma edição (ex: Wolverine #16),
 *         o sistema identifica automaticamente o Ano, Volume e Fonte da publicação e propaga sugestões
 *         da mesma série para todas as outras edições daquela HQ que ainda não possuem capa fixada,
 *         mantendo-as pendentes de aprovação e exibindo notificação discreta em tempo real no topo do app.
 * v1.7.0: Novo Modo Consulta Capa com botão cíclico de 3 modos no header (Consulta [Eye] ➔ Edição [Pencil]
 *         ➔ Consulta Capa [ScanEye]), exibindo galeria de cards compactos em 2 colunas com nome da HQ
 *         e número da última edição que tenho na linha 1, editora e tipo na linha 2, e capa da última edição.
 * v1.6.0: Fechamento automático do carrossel ao fixar capa oficial na edição, modal de alerta customizado
 *         com confirmação para desvincular capas e reabertura imediata do carrossel de sugestões ao desvincular.
 * v1.5.0: Carrossel integrado de alternativas e sugestões de capas na tela de detalhes da edição
 *         com carregamento automático em segundo plano e seleção imediata para aprovação.
 *         Super-otimização do scraper Panini Brasil: validação estrita do nome da HQ, suporte a
 *         edições com 'Vol. N' no título e elevação de resolução estável sem erro CDN (-S300-).
 * v1.4.0: Ao rejeitar capa na tela de status, busca por todas as ocorrências encontradas daquela
 *         HQ e número e abre carrossel expandido na própria linha para seleção tátil e botão de galeria.
 * v1.3.0: Ações em lote na tela de status de capas: botões 'Aceitar Todos' e 'Rejeitar Todos'
 *         exclusivamente para capas pendentes de aprovação.
 * v1.2.1: Ordenação cronológica estrita (lançamentos mais novos 2025/2026 / maiores volumes primeiro),
 *         filtro rigoroso por número de edição (evitando repetição de capa em edições diferentes) e
 *         fallback progressivo para edições mais antigas ao rejeitar uma capa.
 */
export const APP_NAME = 'HQ Collections';
export const APP_VERSION = '1.11.3';
