## Planejamento da Solução - Desafio de Microsserviços

Este documento detalha o planejamento para a implementação da solução do desafio da faculdade, que consiste na criação de uma aplicação de pagamento utilizando arquitetura de microsserviços.

### 1. Visão Geral da Arquitetura

A solução será composta por quatro componentes principais orquestrados pelo Docker Compose:

1.  **Serviço de Pagamento (Node.js):** Responsável por receber requisições de pagamento, processá-las, interagir com o banco de dados e publicar eventos no sistema de mensageria.
2.  **Serviço de Notificação (Node.js):** Responsável por consumir eventos do sistema de mensageria e simular o envio de notificações aos usuários.
3.  **Banco de Dados (PostgreSQL):** Persistirá as informações das transações de pagamento.
4.  **Sistema de Mensageria (RabbitMQ):** Facilitará a comunicação assíncrona entre o Serviço de Pagamento e o Serviço de Notificação.

### 2. Tecnologias Utilizadas

*   **Linguagem de Programação:** Node.js (com Express.js para as APIs REST)
*   **Banco de Dados:** PostgreSQL
*   **Sistema de Mensageria:** RabbitMQ
*   **Orquestração de Contêineres:** Docker e Docker Compose
*   **Controle de Versão:** Git e GitHub

### 3. Estrutura dos Projetos

Serão criados dois diretórios principais, um para cada microsserviço:

*   `servico-pagamento/`
*   `servico-notificacao/`

Cada diretório conterá:

*   `package.json`: Definição do projeto Node.js e suas dependências.
*   `Dockerfile`: Instruções para construir a imagem Docker do serviço.
*   `src/`: Código fonte do serviço.
    *   `index.js` ou `server.js`: Ponto de entrada da aplicação.
    *   `routes/`: Definição das rotas da API REST.
    *   `controllers/`: Lógica de negócio para as rotas.
    *   `services/`: Lógica de interação com RabbitMQ e/ou Postgres.
    *   `config/`: Configurações da aplicação (conexão com DB, RabbitMQ).

O projeto raiz conterá:

*   `docker-compose.yml`: Arquivo de configuração do Docker Compose.
*   `README.md`: Instruções de configuração, execução e descrição do projeto.

### 4. Configuração do `docker-compose.yml`

O arquivo `docker-compose.yml` definirá os seguintes serviços:

*   **`postgres`:**
    *   Imagem: `postgres:latest`
    *   Variáveis de ambiente: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
    *   Volumes: Para persistência dos dados.
    *   Portas: Exposição da porta do Postgres (ex: `5432:5432`).
*   **`rabbitmq`:**
    *   Imagem: `rabbitmq:3-management`
    *   Portas: Exposição das portas do RabbitMQ (ex: `5672:5672` para AMQP e `15672:15672` para a interface de gerenciamento).
*   **`servico-pagamento`:**
    *   Build: A partir do `Dockerfile` em `servico-pagamento/`.
    *   Portas: Exposição da porta da API (ex: `3000:3000`).
    *   Variáveis de ambiente: Strings de conexão para Postgres e RabbitMQ.
    *   Dependências: `postgres`, `rabbitmq`.
*   **`servico-notificacao`:**
    *   Build: A partir do `Dockerfile` em `servico-notificacao/`.
    *   Portas: Exposição da porta da API (ex: `3001:3001`).
    *   Variáveis de ambiente: Strings de conexão para RabbitMQ.
    *   Dependências: `rabbitmq`.

### 5. Modelagem do Banco de Dados (PostgreSQL) - Serviço de Pagamento

Será criada uma tabela chamada `transacoes` com a seguinte estrutura:

*   `id`: SERIAL PRIMARY KEY
*   `valor`: DECIMAL NOT NULL
*   `descricao`: TEXT
*   `status`: VARCHAR(50) NOT NULL (valores: `pendente`, `sucesso`, `falha`)
*   `data_criacao`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
*   `data_atualizacao`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 6. Configuração do RabbitMQ

Serão definidas as seguintes filas e exchanges (a serem criadas programaticamente pelos serviços ao iniciarem, se não existirem):

*   **Exchange:** `pagamentos_exchange` (tipo: `direct` ou `topic`)
*   **Filas:**
    *   `fila_notificacao_solicitacao_pagamento`: Para mensagens sobre o recebimento da solicitação de transação.
    *   `fila_notificacao_confirmacao_pagamento`: Para mensagens sobre a confirmação da transação.
*   **Bindings:** As filas serão ligadas à `pagamentos_exchange` com chaves de roteamento apropriadas.

### 7. Fluxo de Comunicação e Lógica dos Serviços

**Serviço de Pagamento:**

1.  **Receber Solicitação de Transação (API REST - POST `/pagamentos`):**
    *   Input: `{ "valor": 100.50, "descricao": "Compra de produto X" }`
    *   Ação: Valida os dados de entrada.
    *   Ação: Armazena a transação no banco de dados (Postgres) com `status = 'pendente'`. (SQL: `INSERT INTO transacoes (valor, descricao, status) VALUES ($1, $2, 'pendente') RETURNING id;`)
    *   Ação: Publica uma mensagem na `fila_notificacao_solicitacao_pagamento` via `pagamentos_exchange`.
        *   Conteúdo da mensagem: `{ "transacaoId": id_da_transacao, "status": "pendente", "mensagem": "Solicitação de pagamento recebida." }`
    *   Resposta da API: `{ "transacaoId": id_da_transacao, "status": "pendente" }`

2.  **Processamento Assíncrono (Simulado):**
    *   Após um breve delay (simulando processamento externo), o serviço de pagamento considera a transação como confirmada.
    *   Ação: Atualiza o status da transação no banco de dados para `sucesso`. (SQL: `UPDATE transacoes SET status = 'sucesso', data_atualizacao = CURRENT_TIMESTAMP WHERE id = $1;`)
    *   Ação: Publica uma mensagem na `fila_notificacao_confirmacao_pagamento` via `pagamentos_exchange`.
        *   Conteúdo da mensagem: `{ "transacaoId": id_da_transacao, "status": "sucesso", "mensagem": "Pagamento confirmado com sucesso." }`

**Serviço de Notificação:**

1.  **Consumir Mensagem de Solicitação de Pagamento:**
    *   Ação: Conecta-se ao RabbitMQ e consome mensagens da `fila_notificacao_solicitacao_pagamento`.
    *   Ação: Ao receber uma mensagem, simula o envio de uma notificação ao usuário (ex: loga no console: `Notificação para usuário: Solicitação de pagamento para transação ${transacaoId} recebida.`).

2.  **Consumir Mensagem de Confirmação de Pagamento:**
    *   Ação: Conecta-se ao RabbitMQ e consome mensagens da `fila_notificacao_confirmacao_pagamento`.
    *   Ação: Ao receber uma mensagem, simula o envio de uma notificação ao usuário (ex: loga no console: `Notificação para usuário: Pagamento para transação ${transacaoId} confirmado com sucesso.`).

### 8. Implementação das Interfaces de Comunicação

*   **Serviço de Pagamento:**
    *   API REST: Utilizar Express.js para expor o endpoint `/pagamentos`.
    *   AMQP: Utilizar a biblioteca `amqplib` para publicar mensagens no RabbitMQ.
*   **Serviço de Notificação:**
    *   API REST (Opcional, conforme desafio): Pode ter um endpoint para verificar status ou forçar o envio de notificações, se necessário, mas o foco é o consumo AMQP.
    *   AMQP: Utilizar a biblioteca `amqplib` para consumir mensagens do RabbitMQ.

### 9. Instruções de Execução (`README.md`)

O `README.md` no repositório raiz deverá conter:

*   Pré-requisitos (Docker, Docker Compose).
*   Como clonar o repositório.
*   Como configurar variáveis de ambiente (se houver `.env` files, fornecer exemplos).
*   Comandos para construir e iniciar os serviços: `docker-compose up --build -d`.
*   Como testar a aplicação (ex: usando `curl` ou Postman para enviar uma requisição ao serviço de pagamento).
*   Como verificar os logs: `docker-compose logs -f servico-pagamento servico-notificacao`.
*   Como parar os serviços: `docker-compose down`.

### 10. Criação do Repositório no GitHub

1.  Criar um novo repositório público no GitHub.
2.  Inicializar um repositório Git localmente no diretório do projeto.
3.  Adicionar os arquivos do projeto.
4.  Fazer o commit inicial.
5.  Adicionar o remote do GitHub.
6.  Fazer o push do código para o GitHub.

### 11. Critérios de Avaliação a Serem Atendidos

1.  **Serviços independentes:** Garantido pela arquitetura de microsserviços e Docker Compose.
2.  **Comunicação com sistema de mensageria de forma assíncrona:** Implementado com RabbitMQ.
3.  **Realização do fluxo de processamento solicitado:** Detalhado no item 7.

Este planejamento servirá como guia para a implementação do desafio.
