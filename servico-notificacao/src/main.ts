import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672"],
      queue: "notificacoes_queue",
      exchange: "pagamentos_exchange", 
      exchangeType: "direct",
      noAck: false, 
      queueOptions: {
        durable: true,
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

