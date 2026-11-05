/**
 * Versão e Nome do Sistema
 * Gerenciado automaticamente pelo Agente Orquestrador sob o padrão SemVer (MAJOR.MINOR.PATCH)
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
export const APP_VERSION = '1.5.0';
