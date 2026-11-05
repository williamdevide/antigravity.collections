/**
 * Versão e Nome do Sistema
 * Gerenciado automaticamente pelo Agente Orquestrador sob o padrão SemVer (MAJOR.MINOR.PATCH)
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
export const APP_NAME = 'HQs Collections';
export const APP_VERSION = '1.10.0';
