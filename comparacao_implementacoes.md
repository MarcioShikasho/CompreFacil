## Comparação entre Implementação Atual e Repositórios Modelo do Professor

Este documento detalha as principais diferenças entre a implementação do desafio realizada inicialmente e os repositórios modelo (`ms-payment-service` e `ms-notification-service`) fornecidos pelo professor, que utilizam NestJS, TypeScript e Prisma.

### 1. Framework e Arquitetura da Aplicação

*   **Implementação Atual:**
    *   Framework: Express.js.
    *   Arquitetura: Monolítica simples dentro de cada serviço, com lógica concentrada principalmente no arquivo `server.js`.
    *   Estrutura de Rotas/Controllers: Definida manualmente com `app.get()`, `app.post()` etc.
*   **Repositórios Modelo (NestJS):**
    *   Framework: NestJS.
    *   Arquitetura: Modular, baseada em Módulos, Controladores e Serviços (Providers). Clara separação de responsabilidades.
    *   Estrutura de Rotas/Controllers: Utiliza decoradores (`@Controller()`, `@Get()`, `@Post()`) e classes para definir rotas e controladores.

**Impacto da Refatoração:** Será necessário reescrever completamente a lógica de servidor de ambos os microsserviços para adotar a arquitetura e os padrões do NestJS. Isso inclui a criação de módulos, controladores e serviços específicos para cada funcionalidade.

### 2. Linguagem de Programação

*   **Implementação Atual:**
    *   Linguagem: JavaScript (ES6+).
*   **Repositórios Modelo (NestJS):**
    *   Linguagem: TypeScript.

**Impacto da Refatoração:** Todo o código JavaScript existente precisará ser convertido para TypeScript. Isso envolve adicionar tipagem estática para variáveis, parâmetros de função, retornos de função e interfaces/classes para definir estruturas de dados.

### 3. Acesso a Dados (ORM)

*   **Implementação Atual:**
    *   Acesso ao Banco de Dados: Utiliza o cliente `pg` diretamente para executar queries SQL no PostgreSQL.
    *   Gerenciamento de Schema: Criação da tabela `transacoes` feita programaticamente no `server.js` (IF NOT EXISTS).
*   **Repositórios Modelo (NestJS):**
    *   ORM: Prisma.
    *   Gerenciamento de Schema: Utiliza um arquivo `schema.prisma` para definir os modelos de dados e o Prisma Migrate para gerenciar as evoluções do schema do banco de dados.

**Impacto da Refatoração:** A lógica de acesso ao banco de dados será completamente refeita. Será preciso:
    1.  Definir o schema do banco de dados no arquivo `prisma/schema.prisma`.
    2.  Gerar o cliente Prisma.
    3.  Substituir todas as queries SQL diretas por chamadas ao cliente Prisma.
    4.  Configurar e utilizar o Prisma Migrate para criar e gerenciar a tabela `transacoes`.

### 4. Estrutura de Diretórios e Arquivos

*   **Implementação Atual:**
    *   Estrutura simplificada com `servico-pagamento/src/server.js` e `servico-notificacao/src/server.js` contendo a maior parte da lógica.
    *   Diretórios como `routes`, `controllers`, `services`, `config` foram criados, mas não totalmente povoados ou utilizados conforme um framework MVC/modular robusto.
*   **Repositórios Modelo (NestJS):**
    *   Estrutura de projeto padrão do NestJS: `src/` (com `main.ts`, `app.module.ts`, e subdiretórios para módulos, controllers, services), `prisma/`, `docker/`, `test/`.
    *   Diversos arquivos de configuração na raiz do projeto (`.eslintrc.js`, `.prettierrc`, `nest-cli.json`, `tsconfig.json`, etc.).

**Impacto da Refatoração:** Reorganização completa da estrutura de arquivos e diretórios para seguir o padrão dos projetos NestJS modelo. Criação dos arquivos de configuração faltantes.

### 5. Gerenciamento de Dependências e Scripts

*   **Implementação Atual:**
    *   `package.json` simples com dependências básicas (Express, pg, amqplib).
    *   Scripts `start` e `dev` (com nodemon).
*   **Repositórios Modelo (NestJS):**
    *   `package.json` mais complexo com dependências do NestJS, Prisma, TypeScript, ferramentas de linting/formatação e scripts específicos do NestJS (`build`, `start:prod`, `test`, `lint`, etc.).
    *   Uso de `yarn` no `ms-payment-service` e `npm` no `ms-notification-service` (observado nos READMEs e arquivos de lock).

**Impacto da Refatoração:** Atualizar os arquivos `package.json` para incluir todas as dependências necessárias para NestJS, TypeScript e Prisma. Adicionar os scripts de build e execução conforme os modelos. Padronizar o gerenciador de pacotes (provavelmente para `npm` ou `yarn` para ambos os serviços).

### 6. Configuração do Docker

*   **Implementação Atual:**
    *   `Dockerfile`: Configurado para uma aplicação Node.js/JavaScript simples.
    *   `docker-compose.yml`: Orquestra os serviços atuais.
*   **Repositórios Modelo (NestJS):**
    *   Presença de um diretório `docker/` em cada projeto modelo, sugerindo configurações Docker mais específicas ou Dockerfiles multi-stage para otimizar builds de produção (comum em projetos TypeScript/NestJS).
    *   O `docker-compose.yml` precisará ser ajustado para refletir os novos comandos de build e execução das aplicações NestJS.

**Impacto da Refatoração:** Modificar os `Dockerfiles` para compilar o código TypeScript e executar a aplicação NestJS. Ajustar o `docker-compose.yml` para usar os novos Dockerfiles e comandos, e possivelmente incorporar as configurações do diretório `docker/` dos modelos.

### 7. Comunicação Assíncrona (RabbitMQ)

*   **Implementação Atual:**
    *   Utiliza a biblioteca `amqplib` diretamente para publicar e consumir mensagens.
    *   Declaração de exchanges e filas feita programaticamente no início dos serviços.
*   **Repositórios Modelo (NestJS):**
    *   Provavelmente utiliza o módulo `@nestjs/microservices` com o transporter RabbitMQ ou uma integração similar para abstrair a comunicação com `amqplib`, seguindo as práticas do NestJS para microsserviços.

**Impacto da Refatoração:** Adaptar a lógica de comunicação com RabbitMQ para utilizar as abstrações e padrões do NestJS, se disponíveis e utilizadas nos modelos (ex: `@nestjs/microservices`).

### Conclusão da Comparação

A implementação atual está funcionalmente alinhada com os requisitos do fluxo de pagamento e notificação, mas difere substancialmente da arquitetura, tecnologias e padrões de codificação empregados nos repositórios modelo do professor. Uma refatoração significativa será necessária para alinhar a solução. O próximo passo é planejar essa adaptação.
