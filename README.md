# Desafio de Microsserviços - Aplicação de Pagamento (NestJS)

Este projeto implementa uma solução para o desafio da faculdade que consiste na criação de uma aplicação de pagamento utilizando arquitetura de microsserviços com NestJS, TypeScript, RabbitMQ e PostgreSQL, orquestrados com Docker Compose. Esta versão foi refatorada para seguir os padrões dos repositórios modelo fornecidos.

## Visão Geral da Arquitetura

A solução é composta por:

*   **Serviço de Pagamento (`servico-pagamento`):** Aplicação NestJS com API REST para receber solicitações de pagamento, armazenar transações no PostgreSQL (via Prisma) e publicar eventos no RabbitMQ.
*   **Serviço de Notificação (`servico-notificacao`):** Aplicação NestJS que consome eventos do RabbitMQ para simular o envio de notificações sobre o status das transações e pode persistir dados de notificação (via Prisma).
*   **PostgreSQL (`postgres_db_nest`):** Banco de dados para persistir as transações e notificações.
*   **RabbitMQ (`rabbitmq_server_nest`):** Sistema de mensageria para comunicação assíncrona.

## Estrutura do Projeto (Simplificada)

```
.
├── docker-compose.yml
├── servico-pagamento
│   ├── Dockerfile
│   ├── package.json
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── prisma/ (PrismaModule, PrismaService)
│       └── pagamento/ (PagamentoModule, PagamentoController, PagamentoService)
├── servico-notificacao
│   ├── Dockerfile
│   ├── package.json
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── prisma/ (PrismaModule, PrismaService)
│       └── notificacao/ (NotificacaoModule, NotificacaoController, NotificacaoService)
└── README.md (este arquivo)
```

## Pré-requisitos

*   Docker: [https://www.docker.com/get-started](https://www.docker.com/get-started)
*   Docker Compose: (geralmente incluído na instalação do Docker Desktop)
*   Node.js e npm (para desenvolvimento local e instalação inicial de dependências se não usar apenas Docker)

## Como Configurar e Executar com Docker Compose

1.  **Clone o repositório (após ser criado e o código enviado):**
    ```bash
    git clone <URL_DO_REPOSITORIO_AQUI>
    cd <NOME_DO_DIRETORIO_DO_REPOSITORIO>
    ```

2.  **Variáveis de Ambiente:**
    Os arquivos `.env` dentro de `servico-pagamento` e `servico-notificacao` são cruciais para o Prisma e outras configurações. Eles são referenciados no `docker-compose.yml` e nos schemas Prisma.

    **Exemplo de `.env` para `servico-pagamento` e `servico-notificacao`:**
    (Crie este arquivo em `servico-pagamento/.env` e `servico-notificacao/.env` se não estiverem presentes ou se precisar ajustar)
    ```env
    # PostgreSQL
    DATABASE_URL="postgresql://nestuser:nestpassword@postgres_db_nest:5432/nest_payment_db"

    # RabbitMQ
    RABBITMQ_URL="amqp://guest:guest@rabbitmq_server_nest:5672"

    # Service Port (opcional, pode ser pego do docker-compose)
    PORT=3000 # Para servico-pagamento
    # PORT=3001 # Para servico-notificacao
    ```
    *Nota: No `docker-compose.yml` fornecido, as URLs do banco e RabbitMQ já usam os nomes dos serviços da rede Docker, o que é o correto para comunicação entre contêineres.* 

3.  **Construa e inicie os contêineres:**
    No diretório raiz do projeto (onde o `docker-compose.yml` está localizado), execute:
    ```bash
    docker-compose up --build -d
    ```
    O comando `-d` executa os contêineres em segundo plano.
    *A primeira execução pode levar alguns minutos para construir as imagens e baixar as dependências.*

4.  **Aplicar Migrações Prisma (após os contêineres estarem rodando):**
    Você precisará executar os comandos de migração do Prisma dentro dos contêineres dos serviços após o banco de dados estar pronto.
    ```bash
    docker-compose exec servico-pagamento npx prisma migrate dev --name init
    # Se o servico-notificacao também tiver seu próprio schema/migrações independentes:
    # docker-compose exec servico-notificacao npx prisma migrate dev --name init
    ```
    *Isso criará as tabelas no banco de dados `nest_payment_db`.*

5.  **Verifique os logs (opcional):**
    Para acompanhar os logs dos serviços:
    ```bash
    docker-compose logs -f servico-pagamento servico-notificacao
    ```
    Você deverá ver mensagens indicando que os serviços NestJS iniciaram, conectaram-se ao RabbitMQ e ao PostgreSQL.

## Como Testar a Aplicação

1.  **Envie uma Solicitação de Pagamento:**
    Use uma ferramenta como `curl` ou Postman para enviar uma requisição POST para o serviço de pagamento. A porta exposta no host para o `servico-pagamento` é `4000` conforme o `docker-compose.yml`.

    Exemplo com `curl`:
    ```bash
    curl -X POST -H "Content-Type: application/json" -d \
    '{ "valor": 250.99, "descricao": "Compra de Produto NestJS" }' \
    http://localhost:4000/pagamentos
    ```

2.  **Observe os Logs:**
    Acompanhe os logs dos contêineres `servico-pagamento` e `servico-notificacao`.

    *   **Serviço de Pagamento:**
        *   Registrará a criação da transação com status "pendente".
        *   Publicará uma mensagem de "solicitação de pagamento criada".
        *   Após um delay simulado (5 segundos), atualizará a transação para "sucesso".
        *   Publicará uma mensagem de "pagamento confirmado".

    *   **Serviço de Notificação:**
        *   Receberá e registrará o evento de "solicitação de pagamento criada" e simulará uma notificação.
        *   Receberá e registrará o evento de "pagamento confirmado" e simulará uma notificação.

3.  **Verifique o Banco de Dados (Opcional):**
    Conecte-se ao contêiner do PostgreSQL para verificar os dados.
    ```bash
    docker-compose exec postgres_db_nest psql -U nestuser -d nest_payment_db
    ```
    Dentro do psql, execute:
    ```sql
    SELECT * FROM "Transacao";
    SELECT * FROM "Notificacao"; -- Se a tabela de notificação foi criada e usada
    ```

4.  **Acesse a Interface de Gerenciamento do RabbitMQ (Opcional):**
    Abra seu navegador e acesse `http://localhost:15673` (porta definida no `docker-compose.yml`).
    *   Usuário: `guest`
    *   Senha: `guest`
    Você poderá ver as exchanges, filas e o fluxo de mensagens.

## Parando os Serviços

Para parar e remover os contêineres, redes e volumes (exceto o volume nomeado `postgres_nest_data` para persistência do banco), execute:
```bash
docker-compose down
```
Para remover também o volume de dados do Postgres (cuidado, isso apagará os dados do banco):
```bash
docker-compose down -v
```

## Desenvolvimento Local (Fora do Docker)

1.  Navegue até `servico-pagamento` ou `servico-notificacao`.
2.  Copie `.env.example` para `.env` e configure `DATABASE_URL` e `RABBITMQ_URL` para apontar para instâncias locais do Postgres e RabbitMQ.
3.  Instale dependências: `npm install`.
4.  Gere o cliente Prisma: `npx prisma generate`.
5.  Aplique migrações: `npx prisma migrate dev --name init`.
6.  Inicie em modo de desenvolvimento: `npm run start:dev`.

## Considerações

*   Esta implementação busca alinhar-se com os padrões NestJS, TypeScript e Prisma observados nos repositórios modelo.
*   Tratamento de erros, validações de entrada (DTOs podem ser melhorados com `class-validator`), segurança e outras funcionalidades de produção foram simplificados para o escopo do desafio.

## Repositório do Projeto

O link para o repositório GitHub contendo este código será fornecido na entrega do desafio.

