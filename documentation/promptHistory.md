# 📜 Histórico de Prompts

## Sessão: 03/11/2026

### Prompt 1
```text
/agente-orquestrador /grill-me /goal quero criar uma aplicação web first mobile para controle rapido de coleções (essencialmente hqs). preciso de uma tela onde entro com o nome da hq (normalmente são edições mensais), ao confirmar o nome, na frente aparece para começar a incluir os numeros que disponho, sempre de 10 em 10, podem ser pequenas bolinhas que vou clicando. quando completo a numeração do intervalo de 10 ele passa a resumir no formato 01..10 selecionado e abre do 11 ao 20 para clicar. se chegar no 10, mas faltandoo numeros anteriores ele também abre do 11 ao 20, mas não resume o 01 a 10. deve ter na linha também um botão para encerrar aquele item (por exemplo uma miniserie que vai de 01 a 06 eu clico nesse botão e passa a exibir 01..06. se clicar no nome abre para edição e se estiver em edição pode também excluir, mas com confirmação. crie o banco no firebase sozinho, suba para o github e publique no vercel. tudo se resume em apenas uma tela.
```

### Resposta Grill-Me / Interação 1
```text
Pergunta: Como você prefere que o usuário desmarque ou ajuste edições em intervalos que já foram resumidos (ex: '01..10' ou '01..06')?
Resposta do Usuário: (Recommended) Clicar no badge resumido (ex: '01..10' ou '01..06') alterna entre expandir as bolinhas individuais para ajuste rápido e recolher novamente
```

### Resposta Grill-Me / Interação 2
```text
Pergunta: Como você deseja gerenciar a conexão com o Firebase Firestore e as credenciais de deploy para GitHub e Vercel?
Resposta do Usuário: Desejo informar agora as credenciais do meu projeto Firebase (apiKey, projectId, etc.) para que o app conecte diretamente na nuvem desde o primeiro instante
```

### Resposta Grill-Me / Interação 3
```text
Pergunta: Ao clicar no botão de 'Encerrar' um item (como uma minissérie), como deve ser determinado o número final?
Resposta do Usuário: (Recommended) Encerrar automaticamente baseado no maior número selecionado (ex: marcou 06 e clicou em encerrar -> resume '01..06'), com opção de reabrir se necessário
```

### Resposta Grill-Me / Interação 4
```text
Pergunta: Se o bloco 11 a 20 estiver aberto e o usuário preencher o número que faltava no bloco 1 a 10, ele deve resumir automaticamente?
Resposta do Usuário: (Recommended) Sim, colapsar automaticamente para '01..10' assim que todos os números de 1 a 10 estiverem preenchidos, mantendo o bloco 11 a 20 visível
```

### Resposta Grill-Me / Interação 5
```text
Pergunta: Como as coleções cadastradas devem ser organizadas e visualizadas na tela única?
Resposta do Usuário: (Recommended) Ordem alfabética (A-Z) com uma barra de busca rápida no topo para filtragem instantânea no mobile
```

### Resposta Grill-Me / Interação 6
```text
Pergunta: Como você prefere inserir as credenciais do Firebase (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)?
Resposta do Usuário: já informei o que precisa no arquivo .env
```

### Prompt 2
```text
no github já publiquei, mas no vercel o comando não funcionou, criei o projeto lá manualmente, mas para qual diretorio devo apontar?
```

### Prompt 3
```text
/agente-orquestrador /grill-me /goal ao adicionar cada novo titulo quero após o nome um botão de alternancia com os valores (Mensal / Especial / Minissérie), inclusive utilize a cor atual do card (azul escuro para mensais, vermelho escuro para especiais e verde escuro para minissérie. quero também poder filtrar somente por cada um desses tipos, somente encerrados ou em andamento, exibir somente edições que eu tenho ou edições faltantes. deixe na frente do botão do tipo um botão da editora (Marvel / DC / Vertigo / Outras) e crie tambem esse filtro
```

### Resposta Grill-Me / Interação 7
```text
Pergunta: Como deve se comportar o filtro de 'exibir somente edições que eu tenho ou edições faltantes'?
Resposta do Usuário: (Recommended) Alternância visual nos cards: no topo ou nos filtros, permitir alternar para exibir apenas as bolinhas já adquiridas ou destacar/mostrar apenas os números que faltam comprar
```

### Resposta Grill-Me / Interação 8
```text
Pergunta: Depois que a HQ já estiver cadastrada na lista, como você prefere alterar o Tipo ou a Editora caso necessário?
Resposta do Usuário: (Recommended) Permitir alternar o Tipo e a Editora com um clique rápido diretamente no badge do card e também dentro do modal de edição
```

### Prompt 4
```text
/agente-orquestrador /grill-me /goal quero poder mover o card daquela hq em relação aos outros somente arrastando, mas ter um botão para exibir em ordem alfabetica A-Z, Z-A ou Ordem Pessoal.
se cliquei no 10 ele esta abrindo do 11 ao 20, mas se eu desmarcar o 10 e sair da aplicação sem preencher ninguem do 11 ao 20, na proxima vez que entrar não deve exibir o 11 ao 20.
crie o tipo coleção também.
tem minisséries ou coleção que cada edição tem um nome especifico, se for desses tipo e eu der duplo clique sobre o numero deve permitir colocar um titulo para aquele numero
```

### Resposta Grill-Me / Interação 9
```text
Pergunta: Qual cor de fundo e destaque você prefere para o card do novo tipo 'Coleção'?
Resposta do Usuário: (Recommended) Roxo Escuro / Violeta (#240D33 com detalhes em lilás), combinando com Azul Escuro (Mensal), Vermelho Escuro (Especial) e Verde Escuro (Minissérie)
```

### Resposta Grill-Me / Interação 10
```text
Pergunta: Como você prefere que o título individual da edição seja visualizado e acessado nos cards de Minissérie ou Coleção?
Resposta do Usuário: (Recommended) Exibir um pequeno indicador visual na bolinha (ex: ponto lilás) que mostra o título ao tocar, além de abrir o modal de edição ao dar duplo clique ou toque prolongado
```

### Resposta Grill-Me / Interação 11
```text
Pergunta: Como você prefere acionar o arrastar e soltar (Drag and Drop) dos cards no mobile e desktop?
Resposta do Usuário: (Recommended) Incluir um ícone de alça de arrasto (':::') no card, permitindo arrastar suavemente tanto no celular quanto no desktop sem conflitar com o scroll da tela
```

### Prompt 5
```text
/agente-orquestrador /grill-me /goal quero os botões de tipo e editora sempre com um mesmo alinhamento (proximos ao encerrar) e não proximos ao titulo
```

### Prompt 6
```text
/agente-orquestrador /grill-me /goal tenho outra situação especifica, mas quero sugestões de como resolver, existem hqs mensais que não comecei pela edição 01, mas bem mais para frente (por exemplo edição 32), não quero ficar exibindo as dezenas anteriores pois não pretendo compra-las
```

### Resposta Grill-Me / Interação 12
```text
Pergunta: Qual abordagem você prefere para lidar com coleções que começam em edições avançadas (ex: edição 32)?
Resposta do Usuário: (Recommended) Campo 'Começar no nº' (no cadastro e na edição): se você definir ex: 32, o card abre direto no bloco 31..40 e oculta as dezenas anteriores (com um chip discreto '01..30 Ocultas' caso um dia queira ver)
```

## Sessão: 04/11/2026

### Prompt 7
```text
/agente-orquestrador /grill-me /goal construa os seguintes recursos:
- no header deixe um botão de alternancia (modo consulta, modo edição), sempre o padrão ao abrir o sistema é modo consulta, utilize icones visuais para esses dois modos.
- quando entro no modo edição a cor de fundo do sistema muda para um azul mais claro e retorna para a corr atual no modo consulta.
- nos cards, deixe a linha do titulo só com o titulo, o restante dos botoes vão para uma segunda linha alinhados a direita. deixe primeiro a editora, depois o tipo e por ultimo o encerrar. quero os 3 botões com larguras iguais e fixas independente do conteudo.
- as bolinhas de edições sempre devem exibir as 10 bolinhas eem uma unica linha.
- ao incluir uma nova hq posso preencher somente os campos atuais direto na tela ou abrir inclusão detalhada onde tenho também campos para ano de inicio, editora de venda no brasil, herói/grupo principal
- nos cards ao clicar no nome abre a tela de alterar com todos esses campos tambem.
- no modo consulta quando eu clico no numero de uma edição abre uma tela com as informações detalhadas dessa hq só para consulta (no futuro vai exibir a capa, mas por enquanto não)
- só consigo clicar  em um numero e adicionar aquele numero se estiver no modo edição.
```

### Prompt 8
```text
/agente-orquestrador /grill-me /goal a partir de agora estamos na versão 1.0.1 (esse número será exibido ao lado do nome do sistema. o nome do sistema deverá mudar para HQs Collections. o restante continua exibindo como está.
a partir de agora sempre que for pedido alterações, mudanças, acescimos, correções ou verificações você controlará o numero da versão sozinho, alterando os 3 digitos de acordo com tipo de coisa que foi solicitado.
```

### Prompt 9
```text
/agente-orquestrador /grill-me /goal no header abaixo do nome do sistema tinha uma frase de slogan, volte ela. o modo edição e modo consulta exibe só o icone no botão, sem escrito.
o modo de inclusão detalhada tambem é só o icone sem escrito, para caber ao lado do campo incio nº
```

### Prompt 10
```text
/agente-orquestrador /grill-me /goal melhorias a serem criadas:
em cada edição (numero) quando esta no modo edição, se eu clico uma vez ela fica marcada na cor amarela (já esta assim) e isso quer dizer que eu comprei (que eu tenho a edição) se clico de novo cria uma borda azul neon e quer dizer que eu tenho e já li essa edição, se clico de novo volta para a cor de desmarcado, mas fica com uma borda pink neon e quer dizer que eu quero comprar e se clico de novo fica como o riginal e quer dizer que eu não tenho e não pretendo comprar.
esses 4 estagios podem ser filtros para pesquisa.
quero que comece a buscar as capas para exibir no card de detalhes onde já criou a previa. o scrapper será feito preferencialmente no site da panini (panini.com.br), mas quando não achar lá busca geral na internet, quando traz a capa para a pagina de detalhes a imagem ainda deve ficar pendente de aprovação (um pequeno botão com V em verde) se clicar dai fixa a imagem a edição. por padrão procure sempre do ano mais recentepara trás. melhore a estetica do card de detalhes para podermos ter uma imagem um pouco maior.
```

### Prompt 11
```text
/agente-orquestrador /grill-me /goal a busca de capas deve ocorrer em segundo plano e no header ter a porcentagem de buscas completas em relação ao numero de edições
```

### Prompt 12
```text
/agente-orquestrador /grill-me /goal volte os outros itens que você removeu do header. o icone de capas deixe só o icone e a porcentagem, sem o texto "capas". se clicar nesse objeto do icone e porcentagem ele abre uma tela detalhada dessa busca de capas, exibindo os titulos que estão sendo buscados e quais já foram encontrados.
alem do botão aprovar capa, precisamos tambem do rejeitar capa. mas deixe ambos sem texto.
force a busca para tentar a todo custo no panini.com.br
```

### Resposta Grill-Me / Interação 13
```text
Pergunta: Como você prefere que a tela detalhada de busca de capas organize os títulos e capas encontradas?
Resposta do Usuário: (Recommended) Em abas ou filtros rápidos ('Todas', 'Em Busca', 'Encontradas/Pendentes', 'Sem Capa'), com miniaturas e botões rápidos de aprovar (✓) e rejeitar (✗) direto na lista
```

### Resposta Grill-Me / Interação 14
```text
Pergunta: Ao clicar no botão de rejeitar capa (sem texto), qual comportamento você prefere?
Resposta do Usuário: (Recommended) Marcar a imagem como rejeitada para não sugerir novamente e permitir tentar buscar outra alternativa com um clique
```

### Prompt 13
```text
/agente-orquestrador /grill-me /goal na hora de buscar as capas, busque sempre pelas edições mais novas, se for rejeitada dai busca mais antigas (exemplo as edições mensais do wolverine são de 2025 e 2026, mas esta exibindo capas das mais antigas e sempre busque pela numeração, ele está sugerindo a mesma capa para mais de uma edição
```

### Resposta Grill-Me / Interação 15
```text
Pergunta: Para coleções com muitos relançamentos (ex: Wolverine, Batman), qual regra de prioridade temporal você prefere?
Resposta do Usuário: (Recommended) Priorizar sempre o lançamento mais recente (2025/2026 / maior volume). Ao rejeitar, buscar progressivamente os volumes/anos anteriores
```

### Prompt 14
```text
/agente-orquestrador na tela de status da busca de capas deixe um botão aceitar todos ou rejeitar todos, mas só para as que ainda não foram aprovadas.
```

### Prompt 15
```text
/agente-orquestrador /grill-me /goal ao rejeitar uma foto na tela de status de busca de capas, busca por todas as ocorrencias que encontrar dessa hq e numero e dai o uusuário clica na qual deseja
```

### Resposta Grill-Me / Interação 16
```text
Pergunta: Ao rejeitar uma foto na tela de status, como você prefere visualizar e escolher entre todas as capas encontradas?
Resposta do Usuário: Expansão na própria linha da tela de status: A linha da edição se expande abrindo um carrossel horizontal com as opções de capas disponíveis para selecionar
```

### Resposta Grill-Me / Interação 17
```text
Pergunta: Ao clicar em uma das capas alternativas no carrossel expandido, qual ação deve ocorrer?
Resposta do Usuário: Definir como nova candidata pendente: Ao clicar na capa do carrossel, ela substitui a sugestão atual e exibe o botão (✓) para você confirmar se gostou antes de fixar
```

### Resposta Grill-Me / Interação 18
```text
Pergunta: Você gostaria de poder abrir esse carrossel de opções a qualquer momento, ou apenas ao rejeitar?
Resposta do Usuário: (Recommended) Sim, além de abrir automaticamente ao rejeitar, incluir também um pequeno botão com ícone de galeria para abrir o carrossel a qualquer momento
```

### Prompt 16
```text
/agente-orquestrador /grill-me /goal quero poder ver o carrossel de imagens de sugestão de capa tambem na tela de detalhes da edição.
você precisa melhorar muito o scrapper na panini, fiz um teste, busquei no site da panini por wolverine 16 e a primeira sugestão já era a capa certa, mas no scrapper sugeriu varias capas e nenhuma vez a correta.
```

### Resposta Grill-Me / Interação 19
```text
Pergunta: Na tela de detalhes da edição, como você prefere visualizar e interagir com o carrossel de opções de capas?
Resposta do Usuário: (Recommended) Carrossel horizontal integrado na própria tela de detalhes (logo abaixo da capa principal), permitindo rolar e tocar em qualquer variante para pré-visualizar e aprovar
```

### Resposta Grill-Me / Interação 20
```text
Pergunta: Na tela de detalhes, o carrossel de variantes deve ser carregado automaticamente ao abrir o modal ou sob demanda?
Resposta do Usuário: (Recommended) Carregar automaticamente em segundo plano ao abrir o modal de detalhes, exibindo o carrossel assim que estiver pronto
```

### Prompt 17
```text
/agente-orquestrador /grill-me /goal depois que eu fixo uma imagem na edição pode fechar o carrossel de imagens e só volta a aparecer se eu clicar em Desvincular capa dessa edição. Inclusive o desvincular capa deve pedir confirmação
```

### Resposta Grill-Me / Interação 21
```text
Pergunta: Como você prefere que seja apresentada a solicitação de confirmação ao clicar em 'Desvincular capa'?
Resposta do Usuário: Modal de alerta customizado: Abre uma pequena caixa de diálogo centralizada na tela solicitando a confirmação com botão de aviso em vermelho
```

### Resposta Grill-Me / Interação 22
```text
Pergunta: Ao confirmar a desvinculação da capa, como o sistema deve se comportar no modal de detalhes?
Resposta do Usuário: (Recommended) Remover a capa fixada e reabrir imediatamente o carrossel de alternativas para escolher uma nova capa na hora
```

### Prompt 18
```text
/agente-orquestrador /grill-me /goal agora na tela principal o botão com o olho (modo consulta) e lapis (modo edição) ganha uma terceira opção com um olho aberto (modo consulta capa): nesse modo ele exibe cards menores (talvez 2 colunas) com o nome da HQ e numero da ultima edição que tenho na linha 1, editora e tipo na linha 2, capa da ultima edição que eu tenho (por exemplo o ultimo wolverine que tenho é a 16)
```

### Resposta Grill-Me / Interação 23
```text
Pergunta: Caso você ainda não tenha nenhuma edição comprada daquela HQ, como ela deve aparecer no Modo Consulta Capa?
Resposta do Usuário: (Recommended) Exibir a HQ com o aviso 'Sem edições' e uma moldura elegante indicando sem capa, mantendo todas as coleções visíveis no catálogo
```

### Resposta Grill-Me / Interação 24
```text
Pergunta: Ao tocar em um card de HQ no Modo Consulta Capa, qual ação você prefere que aconteça?
Resposta do Usuário: (Recommended) Abrir o Modal de Detalhes daquela última edição (exibindo a capa em tamanho ampliado, metadados e opções de curadoria)
```

### Resposta Grill-Me / Interação 25
```text
Pergunta: Como você prefere a ordem do ciclo e a representação visual do botão de 3 modos no cabeçalho?
Resposta do Usuário: (Recommended) Ciclo de 3 toques: Consulta [Eye] ➔ Edição [Pencil] ➔ Consulta Capa [ScanEye / Olho com destaque de Capa], com tooltip indicando o modo ativo
```

### Prompt 19
```text
/agente-orquestrador /grill-me /goal o fato de escolher e confirmar a capa de uma edição deve auxiliar na escolha das capas das outras edições da mesma hq (exemplo escolhi a capa do wolverine 16, automaticamente sugere como escolha de capa para as outras edições as que fazem parte da mesma série, contudo ainda fica pendente a confirmação.
```

### Resposta Grill-Me / Interação 26
```text
Pergunta: Ao confirmar a capa de uma edição (ex: Wolverine #16 da série 2025), para quais outras edições daquela HQ o sistema deve buscar e sugerir capas da mesma série?
Resposta do Usuário: (Recommended) Todas as edições daquela HQ que ainda não possuem capa fixada (substitui sugestões pendentes antigas para alinhar toda a coleção à mesma série)
```

### Resposta Grill-Me / Interação 27
```text
Pergunta: Quando você confirmar uma capa e o sistema disparar a sugestão para as outras edições da série, como você prefere ser avisado?
Resposta do Usuário: (Recommended) Notificação visual discreta temporária (banner/toast no topo informando que a série foi alinhada e as outras edições estão sendo atualizadas)
```

### Resposta Grill-Me / Interação 28
```text
Pergunta: Como você prefere que o sistema identifique se outra edição pertence à 'mesma série' da capa confirmada?
Resposta do Usuário: (Recommended) Correspondência inteligente por Ano, Volume e Fonte (ex: Panini Brasil 2025 ou Fandom Vol 8), garantindo coerência visual em toda a coleção
```

### Prompt 20
```text
/agente-orquestrador /grill-me /goal ao clicar no logo quero que abra um menu tipo hamburguer com a opção Meu Perfil (a partir de agora teremos um login no sistema podendo cadastrar usuário, recuperar senha, utilizar conta google (e tudo que julgar necessário).
no menu meu perfil eu posso atualizar meus dados, zerar minha coleção (exige confirmação), trocar senha e afins. para logar posso deixar senha salva ou logar com conta google, ddai não precisa preencher senha.
no menu hamburguer tambem quero uma tela de configurações (crie as configurações que julgar necessário), mas sugiro que tenha uma para trocarmos as cores de fundo do modo consulta e edição.
quero tambem no menu hamburguer um item Entrada por voz onde consigo mandar uma mensagem de voz (por exemplo: tenho a hq wolverine da marvel mensal das edições 01 até 09) e automaticamente ele cria o card e já preenche essas edições.
```

### Resposta Grill-Me / Interação 29
```text
Pergunta: Como você prefere que o sistema gerencie o acesso inicial e as coleções com a introdução do novo sistema de Login (E-mail/Senha e Google)?
Resposta do Usuário: Login Obrigatório na Inicialização: Exige login ou cadastro (Google ou E-mail/Senha) logo na primeira tela para acessar o app e as coleções
```

### Resposta Grill-Me / Interação 30
```text
Pergunta: Como você prefere que funcione o fluxo da Entrada por Voz ao cadastrar HQs?
Resposta do Usuário: (Recommended) Modal Interativo com Transcrição e Pré-visualização: Exibe as ondas sonoras/microfone, transcreve o texto em tempo real, exibe o resumo interpretado (Nome, Editora, Tipo e Edições) com botão de confirmação rápida para evitar erros de interpretação
```

### Resposta Grill-Me / Interação 31
```text
Pergunta: Como você prefere que funcione a personalização de cores e a tela de Configurações?
Resposta do Usuário: (Recommended) Presets Elegantes + Seletor Livre de Cores: Oferece paletas modernas para fundo do Modo Consulta e Modo Edição (Dark Slate, Dark Navy, Deep Purple, Cyberpunk, Charcoal) com seletor livre (color picker), além de opções de densidade visual e confirmações táteis
```

### Resposta Grill-Me / Interação 32
```text
Pergunta: Ao solicitar 'Zerar Minha Coleção' no Meu Perfil, qual mecanismo de confirmação de segurança você prefere?
Resposta do Usuário: (Recommended) Digitar palavra de segurança ('ZERAR') em Modal de Alerta Máximo: Exige confirmação explícita digitando a palavra 'ZERAR' para desbloquear o botão vermelho de exclusão permanente
```

### Prompt 21 (Subagente Especialista em Regras Firestore)
```text
Atualize o arquivo firestore.rules na raiz do projeto g:\antigravity\projetos\antigravity.collections\firestore.rules para:
1. Permitir leitura e escrita para coleções de usuários em /users/{userId}/comics/{comicId} e /users/{userId}/settings/{settingId} quando autenticado (request.auth != null && request.auth.uid == userId), ou em modo de desenvolvimento se request.auth != null.
2. Manter compatibilidade com a coleção existente /comics/{comicId} (allow read, write: if true ou se autenticado).
3. Garantir regras seguras, livres de erros e compatíveis com Firestore Rules v2.
```

### Prompt 22
```text
/agente-orquestrador /grill-me /goal em alguns casos quando estou escolhendo a imagem de capa ele pula para outra edição, ao cancelar todas as capas não aprovadas a porcentagem mantem em 100% e quando ja tenho capas de uma hq e ele deveria sugerir as outras não tem nenhuma indicação visual de que ele fez isso
```

### Resposta Grill-Me / Interação 33
```text
Pergunta: Como você prefere que a porcentagem de capas no cabeçalho seja calculada e se comporte ao cancelar ou rejeitar capas não aprovadas?
Resposta do Usuário: (Recommended) Porcentagem de Capas Aprovadas / Fixadas: A porcentagem no cabeçalho passa a indicar quantas edições têm capa confirmada e aprovada (ex: 12/20 = 60%). Ao cancelar ou rejeitar capas, a porcentagem diminui proporcionalmente, mostrando o progresso real de capas fixadas.
```

### Resposta Grill-Me / Interação 34
```text
Pergunta: Como você prefere que seja a indicação visual de que as outras edições receberam sugestões automáticas da mesma série?
Resposta do Usuário: (Recommended) Indicador Completo: Ponto pulsante âmbar/dourado com raio (⚡) na bolinha da edição na tela principal + Badge '⚡ Série Alinhada' no card da HQ + Banner explicativo no modal de detalhes mostrando a série de origem
```

### Resposta Grill-Me / Interação 35
```text
Pergunta: Ao selecionar ou trocar a capa de uma edição, como você prefere que a tela se comporte para evitar qualquer salto indesejado para outra edição?
Resposta do Usuário: (Recommended) Travar Edição e Manter Foco Estável: Ao escolher, aprovar ou rejeitar uma capa (seja no Modal de Detalhes ou no Status de Capas), a tela NUNCA muda de edição nem a remove da visão enquanto o carrossel estiver aberto. O item permanece na tela com a nova capa selecionada para sua conferência.
```

### Prompt 23
```text
/agente-orquestrador /grill-me /goal verifique se o scrapper fora da panini tambem esta funcionando (testei com Starwars a princesinha de vader que não tem na panini, e não apareceu a capa correta)
```

### Resposta Grill-Me / Interação 36
```text
Pergunta: Como você prefere que o scraper selecione e priorize as fontes de busca fora da Panini para HQs e graphic novels de outras editoras (como Star Wars, Aleph, Image, etc.)?
Resposta do Usuário: (Recommended) Roteamento Inteligente Multi-Universo + Fallback Global: Detecta pelo título ou editora o universo temático (Star Wars/Wookieepedia, Marvel, DC, Image, Dark Horse, Disney) e, se não encontrar na wiki principal, faz fallback automático para Open Library e demais wikis pesquisando tanto o título em português quanto o equivalente em inglês.
```

### Resposta Grill-Me / Interação 37
```text
Pergunta: Como o validador de capas deve se comportar ao buscar a Edição #01 de Graphic Novels, encadernados ou volumes únicos que não possuem números no título (como 'Vader's Little Princess' / 'A Princesinha de Vader')?
Resposta do Usuário: (Recommended) Aceitar para a Edição #01 se não houver numeração conflitante: Se a edição cadastrada for a #01 (ou 1) e o livro/graphic novel encontrado trouxer o título da obra sem números explícitos (e sem 'Vol 2' ou '#2'), aceitar a capa como a edição única/volume 1 da publicação.
```

### Prompt 24
```text
/agente-orquestrador /grill-me /goal vamos ter um quarto modo de visualização "consulta total com capas", ele exibe cada card como no modo consulta normal, mas ao inves de mostrar só os numeros ele mostra cada capa e as bordas como no modo consulta normal, dentro da capa, no canto inferior esquerdo de cada capa aparece o numero da edição
```

### Resposta Grill-Me / Interação 38
```text
Pergunta: No novo modo "Consulta Total com Capas", como você prefere que as edições e os blocos resumidos (dezenas) sejam exibidos dentro do card da HQ?
Resposta do Usuário: (Recommended) Grade Adaptativa com Todas as Edições Abertas: Exibir diretamente todas as edições cadastradas em minicapas retangulares de HQ (proporção 2:3 vertical, 5 colunas no mobile / 10 no desktop) com a borda do estágio e o número no canto inferior esquerdo, mostrando a coleção completa de capas sem precisar expandir dezenas.
```

### Resposta Grill-Me / Interação 39
```text
Pergunta: Como devem ser exibidas as edições que ainda NÃO possuem capa oficial fixada no modo "Consulta Total com Capas"?
Resposta do Usuário: (Recommended) Placeholder Temático com Borda do Estágio: Card retangular 2:3 com fundo sutil, borda do estágio da edição (amarelo para tenho, azul neon para já li, pink para quero comprar), ícone suave de gibi e, caso haja sugestão de capa pendente ou alinhada à série, exibe a imagem prévia translúcida com indicador de raio (⚡).
```

### Resposta Grill-Me / Interação 40
```text
Pergunta: Qual ícone e posicionamento você prefere para o 4º modo no alternador cíclico do cabeçalho?
Resposta do Usuário: (Recommended) Ícone LayoutGrid (Grade de Capas) no 4º passo do ciclo: Consulta (Eye) ➔ Edição (Pencil) ➔ Consulta Capa (ScanEye) ➔ Consulta Total com Capas (LayoutGrid) ➔ Consulta, com seletor de cor de fundo dedicado nas Configurações.
```

### Resposta Grill-Me / Interação 41
```text
Pergunta: O que deve acontecer ao tocar em uma minicapa no modo "Consulta Total com Capas"?
Resposta do Usuário: (Recommended) Abrir Modal de Detalhes da Edição: Ao tocar em qualquer capa, abre o modal de detalhes daquela edição com carrossel de imagens, metadados e opções de curadoria (igual ao modo consulta normal).
```
