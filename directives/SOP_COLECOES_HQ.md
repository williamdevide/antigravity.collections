# 📋 Diretiva: Controle Rápido de Coleções de HQs (HQs Collections)

## 1. Visão Geral e Propósito
Aplicação Web First Mobile para controle ágil de coleções de Histórias em Quadrinhos, Especiais, Minisséries e Coleções em tela única.
* **Nome Oficial:** `HQs Collections`
* **Versão:** `1.2.1`

## 2. Header & Navegação Mobile First
* **Marca e Identidade:** Logotipo `BookOpen`, Título `HQs Collections`, versão SemVer (`v1.2.1`), badge `Mobile` e slogan `Controle Ágil de Coleções`.
* **Monitor de Capas no Header:** Objeto tátil composto estritamente pelo ícone e pela porcentagem (ex: `🖼️ 85%`), sem o texto "capas". Ao tocar nesse objeto, abre o **Modal Detalhado de Status da Busca de Capas**.
* **Alternador de Modos:** Ícone único de alternância (Lápis para Edição / Olho para Consulta).
* **Badge de Conexão e Estatísticas:** Status em tempo real (`Nuvem` / `Local`) e contagem total (`XX HQs • YY ed.`).

## 3. Sistema de 4 Estágios por Edição (Modo Edição)
* **Estágio 0 (Original / Desmarcado):** Não tenho e não pretendo comprar (`none`).
* **Estágio 1 (Amarelo Sólido):** Comprei / Tenho a edição (`owned`).
* **Estágio 2 (Amarelo com Borda Azul Neon):** Tenho e Já Li a edição (`read`).
* **Estágio 3 (Desmarcado com Borda Pink Neon):** Quero Comprar / Lista de Desejos (`wishlist`).
* Ciclo ao clicar no Modo Edição: `none ➔ owned ➔ read ➔ wishlist ➔ none`.

## 4. Scraper Panini Brasil & Web em Segundo Plano
* **Busca Forçada no panini.com.br:** O scraper executa buscas automatizadas no catálogo oficial da Panini Brasil utilizando curl/serverless com múltiplas variações de consulta (`nome edição`, `nome 0N`, `nome`) para contornar bloqueios de CDN/Fastly e capturar capas originais de alta resolução (897x1373 ou Cloudfront -S600-).
* **Ordenação Cronológica Estrita (Mais Recentes Primeiro):** A busca prioriza sempre as publicações mais novas (2025/2026, maiores volumes na Fandom como Vol 8 > Vol 7 > Vol 6...).
* **Validação Rigorosa de Edição:** Função `matchIssueNumber` valida estritamente o número da edição alvo (ex: `#2` ou `02`), isolando anos de 4 dígitos e volumes inteiros para garantir que edições diferentes NUNCA recebam a mesma capa genérica.
* **Unicidade por Coleção:** Uma URL de capa já atribuída a uma edição é bloqueada para qualquer outro fascículo da mesma HQ.
* **Fallback Progressivo por Rejeição:** Ao rejeitar uma capa, o sistema descarta a imagem atual e busca automaticamente a próxima alternativa mais antiga disponível.

## 5. Modal de Status da Busca de Capas
* Acessível diretamente pelo botão de porcentagem no cabeçalho.
* Métricas em tempo real: `% Progresso`, `Buscadas`, `Fixadas` e `Pendentes`.
* Abas de navegação rápida: `Todas`, `Encontradas`, `Em Busca` e `Sem Capa / Rejeitadas`.
* Ações diretas por edição sem texto: Aprovar (✓ verde), Rejeitar (✗ vermelho), Desvincular e Re-buscar.

## 6. Fluxo de Curadoria de Capa (Aprovar / Rejeitar sem texto)
* Tanto no card de detalhes da edição quanto no modal de busca de capas, a capa encontrada pendente apresenta dois botões dedicados **SEM TEXTO**:
  - **Aprovar:** Botão verde com ícone `Check` (`✓`) que fixa a capa como imagem oficial daquela edição no Firestore e LocalStorage.
  - **Rejeitar:** Botão vermelho com ícone `X` (`✗`) que descarta a imagem, armazena no histórico de rejeições daquela edição e dispara a busca imediata da versão cronologicamente anterior.
