## Análise dos Repositórios Modelo do Professor

Esta análise detalha a estrutura e os padrões observados nos repositórios modelo fornecidos pelo professor para o desafio de microsserviços: `ms-payment-service` e `ms-notification-service`.

### Observações Gerais (Comuns a Ambos os Repositórios):

1.  **Framework:** Ambos os projetos são desenvolvidos utilizando o framework **NestJS**.
    *   Evidências: README descreve como um "progressive Node.js framework", presença de `nest-cli.json`, `tsconfig.json`, e comandos de execução típicos do NestJS (`start:dev`, `start:prod`).
2.  **Linguagem:** Utilizam **TypeScript** como linguagem principal.
    *   Evidências: Arquivos `tsconfig.json`, `tsconfig.build.json`, e a predominância de TypeScript (aproximadamente 90%) nas estatísticas de linguagem do GitHub.
3.  **ORM:** Utilizam **Prisma** para a camada de acesso a dados.
    *   Evidências: Presença de um diretório `prisma/` contendo o schema e migrações (provavelmente).
4.  **Estrutura de Diretórios Principal:**
    *   `docker/`: Contém configurações relacionadas ao Docker, possivelmente Dockerfiles específicos ou scripts.
    *   `prisma/`: Arquivos de schema e migrações do Prisma.
    *   `src/`: Código-fonte da aplicação, seguindo a estrutura modular do NestJS (modules, controllers, services).
    *   `test/`: Testes unitários e e2e.
5.  **Arquivos de Configuração na Raiz:**
    *   `.env`: Para variáveis de ambiente.
    *   `.eslintrc.js`: Configuração do ESLint para linting de código.
    *   `.gitignore`: Especifica arquivos e diretórios a serem ignorados pelo Git.
    *   `.prettierrc`: Configuração do Prettier para formatação de código.
    *   `nest-cli.json`: Arquivo de configuração do NestJS CLI.
    *   `package.json`: Define metadados do projeto, dependências e scripts.
    *   `package-lock.json` ou `yarn.lock`: Arquivos de lock do gerenciador de pacotes.
    *   `README.md`: Documentação do projeto.
    *   `tsconfig.json` e `tsconfig.build.json`: Arquivos de configuração do TypeScript.
6.  **Mensageria:** Ambos os serviços se conectam ao RabbitMQ.
    *   Evidências: Commits como "chore: add connection to rabbitmq".
7.  **Gerenciador de Pacotes:**
    *   `ms-payment-service`: Utiliza `yarn` (indicado no README e `yarn.lock` provavelmente presente).
    *   `ms-notification-service`: Utiliza `npm` (indicado no README e `package-lock.json` presente).

### Observações Específicas:

*   **ms-payment-service:**
    *   Responsável pelo processamento de pagamentos e interação com o banco de dados (via Prisma) para armazenar transações.
    *   Publica mensagens no RabbitMQ.
*   **ms-notification-service:**
    *   Consome mensagens do RabbitMQ.
    *   O commit "chore: adjusts to save notification" sugere que este serviço também pode persistir dados (ex: status de notificações enviadas), provavelmente utilizando Prisma.

### Implicações para a Implementação Atual:

A implementação realizada anteriormente (usando Express.js e JavaScript) difere significativamente dos modelos do professor. Será necessário um refatoramento considerável para alinhar a solução, incluindo:

1.  **Adoção do NestJS:** Reestruturar ambos os serviços como aplicações NestJS.
2.  **Migração para TypeScript:** Converter o código JavaScript para TypeScript.
3.  **Integração do Prisma:** Substituir a lógica de acesso direto ao `pg` pelo Prisma ORM, incluindo a definição de schemas e migrações.
4.  **Reorganização da Estrutura de Arquivos:** Adotar a estrutura de diretórios e arquivos de configuração dos projetos modelo.
5.  **Adaptação da Lógica de Negócio:** Manter a funcionalidade principal do fluxo de pagamento e notificação, mas implementá-la dentro da arquitetura NestJS (controllers, services, modules).
6.  **Atualização do Docker:** Modificar os `Dockerfiles` e o `docker-compose.yml` para acomodar as mudanças de framework, linguagem e dependências.

Este planejamento servirá de base para a etapa de comparação e adaptação da implementação existente.
