import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";

async function bootstrap() {
  // Criar uma aplicação NestJS híbrida (HTTP + Microserviço)
  // A parte HTTP pode ser usada para health checks ou APIs de gerenciamento, se necessário.
  const app = await NestFactory.create(AppModule);

  // Configurar o microserviço para escutar mensagens do RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672"],
      queue: "notificacoes_queue", // Nome da fila que este serviço irá consumir
      exchange: "pagamentos_exchange", // Nome da exchange à qual a fila está ligada
      exchangeType: "direct", // Tipo da exchange, deve corresponder ao que o publisher usa
      noAck: false, // Garante que as mensagens sejam confirmadas após o processamento
      queueOptions: {
        durable: true, // Fila durável
      },
    },
  });

  await new Promise(resolve => setTimeout(resolve, 15000));

  await app.startAllMicroservices();
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Serviço de Notificação rodando na porta ${port} e escutando RabbitMQ`);
}
bootstrap();

