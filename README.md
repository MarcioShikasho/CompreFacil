# Sistema de Pagamento Assíncrono com Notificação

Este projeto demonstra um fluxo de pagamento e notificação assíncrona utilizando NestJS, Docker, PostgreSQL e RabbitMQ. O sistema é composto por dois microsserviços principais: um **Sistema de Pagamento** (síncrono via HTTP e publisher RabbitMQ) e um **Sistema de Notificação** (consumer RabbitMQ).

## Arquitetura

A arquitetura do projeto consiste em:

- **Serviço de Pagamento (`servico-pagamento`):** Aplicação NestJS que recebe requisições HTTP, salva transações iniciais no DB, publica mensagens no RabbitMQ (solicitação e confirmação).
- **Serviço de Notificação (`servico-notificacao`):** Aplicação NestJS que consome mensagens do RabbitMQ e processa as notificações (simuladas, incluindo salvar no DB).
- **RabbitMQ (`rabbitmq_server`):** Broker de mensagens utilizado para a comunicação assíncrona entre os serviços.
- **PostgreSQL (`postgres_db`):** Banco de dados relacional compartilhado pelos serviços (para transações e notificações).

O fluxo assíncrono implementado segue os passos:

1.  Sistema de Pagamento recebe requisição (via HTTP) e salva transação como "pendente" no DB.
2.  Sistema de Pagamento publica mensagem na exchange RabbitMQ informando sobre a **solicitação** de transação.
3.  Sistema de Notificação consome a mensagem de solicitação da fila RabbitMQ e processa a notificação inicial.
4.  Sistema de Pagamento (após simular processamento) atualiza o status da transação para "sucesso" no DB.
5.  Sistema de Pagamento publica mensagem na exchange RabbitMQ informando sobre a **confirmação** da transação.
6.  Sistema de Notificação consome a mensagem de confirmação da fila RabbitMQ e processa a notificação final.

## Pré-requisitos

- Docker e Docker Compose instalados.
- Node.js e npm (ou yarn) instalados (necessário para rodar comandos Prisma localmente).

## Configuração

1.  Clone este repositório.
2.  Navegue até a pasta raiz do projeto.
3.  Crie arquivos `.env` nas pastas `servico-pagamento` e `servico-notificacao`. Cada arquivo `.env` deve conter a `DATABASE_URL` para conectar ao DB Dockerizado a partir do seu host (para comandos Prisma locais):

    ```env
    # servico-pagamento/.env e servico-notificacao/.env
    DATABASE_URL="postgresql://nestuser:nestpassword@localhost:5433/nest_payment_db"
    ```
    Certifique-se de que as credenciais, host (`localhost`) e porta (`5433`) estão corretos conforme seu mapeamento no `docker-compose.yml`.

## Como Rodar o Projeto

1.  Na pasta raiz do projeto, construa as imagens Docker:

    ```bash
    docker-compose build
    ```

2.  Suba os serviços:

    ```bash
    docker-compose up -d
    ```

    Isso iniciará os contêineres do PostgreSQL, RabbitMQ, Serviço de Pagamento e Serviço de Notificação. O Serviço de Pagamento executará `npx prisma migrate deploy` na inicialização para aplicar as migrações do seu schema (tabela `Transacao`).

3.  **Inicialize o Schema do Serviço de Notificação (se necessário):**
    Se for a primeira vez ou se o schema do Serviço de Notificação (tabela `Notificacao`) não existir no DB, você precisará aplicá-lo. Navegue até a pasta `servico-notificacao` e execute um comando Prisma localmente, usando a `DATABASE_URL` do `.env` para se conectar ao DB Dockerizado:

    ```bash
    # Na pasta servico-notificacao
    npx prisma migrate dev --name initial_notification_migration # Para criar a migração
    # Ou se já tiver o schema, apenas aplique via db push (pode sobrescrever migrações existentes)
    # npx prisma db push
    ```
    Use a sobrescrita da `DATABASE_URL` se o seu `.env` não estiver configurado corretamente para `localhost:5433`:
    ```bash
    # Exemplo Linux/macOS para db push a partir de servico-notificacao
    DATABASE_URL="postgresql://nestuser:nestpassword@localhost:5433/nest_payment_db" npx prisma db push
    ```

4.  **Configure as Ligações no RabbitMQ:**
    Mesmo com a configuração do código, pode ser necessário criar as ligações (bindings) entre a exchange e a fila manualmente no RabbitMQ UI.

    - Acesse a interface do RabbitMQ Management: `http://localhost:15673` (usuário/senha padrão: guest/guest).
    - Vá na aba **Exchanges**.
    - Clique na exchange `pagamentos_exchange`.
    - Na seção **Bindings from this exchange**, adicione as duas ligações para a fila `notificacoes_queue`:
        - To queue: `notificacoes_queue`, Routing key: `solicitacao_pagamento_criada`
        - To queue: `notificacoes_queue`, Routing key: `pagamento_confirmado`

## Testando o Fluxo

1.  Certifique-se de que todos os contêineres estão rodando (`docker-compose ps`).
2.  Monitore os logs dos serviços de pagamento e notificação:

    ```bash
    docker-compose logs -f servico-pagamento servico-notificacao
    ```

3.  Em outro terminal, execute o comando `curl` para iniciar uma transação:

    ```bash
    curl -X POST \
      http://localhost:4000/pagamentos \
      -H 'Content-Type: application/json' \
      -d '{
        "valor": 750.50,
        "descricao": "Pagamento de teste completo"
      }'
    ```

4.  Observe os logs nos terminais de monitoramento. Você verá o serviço de pagamento processando a requisição, salvando no DB, publicando mensagens, e depois o serviço de notificação recebendo as mensagens e processando as notificações correspondentes.

## Observações da Depuração

Durante o desenvolvimento deste projeto, foram encontrados e resolvidos diversos desafios comuns em sistemas distribuídos e Dockerizados:

- Problemas de conexão com o banco de dados devido a mapeamento de portas Docker e variáveis de ambiente incorretas para comandos locais vs. dentro de contêineres.
- Gerenciamento de migrações Prisma em ambientes Docker (aplicando migrações na inicialização do contêiner).
- Problemas de timing na inicialização de contêineres (RabbitMQ não pronto quando o serviço tentava conectar).
- Compreensão do roteamento de mensagens no RabbitMQ (Exchanges, Queues, Bindings).
- Configuração específica do transporte NestJS RabbitMQ para publishers enviando para Exchanges e Consumers ouvindo Filas, incluindo a necessidade de criar ligações manualmente e um comportamento específico observado ao incluir a opção `queue` na configuração do publisher em conjunto com `exchange`.