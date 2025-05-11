import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do Microserviço para o RabbitMQ (se este serviço também escutar eventos)
  // Se for apenas um publicador, esta parte não é estritamente necessária aqui,
  // pois o ClientsModule em AppModule já configura o cliente para publicar.
  // No entanto, os modelos do professor podem ter uma abordagem diferente.
  // Por ora, vamos focar em ser um publicador via ClientsModule e um servidor HTTP.

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Serviço de Pagamento rodando na porta ${port} e publicando no RabbitMQ`);

  // Se o serviço de pagamento também precisasse OUVIR eventos de outras filas (não é o caso no desafio)
  // const microservice = app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: [process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672"],
  //     queue: "outra_fila_pagamento_escuta", // Fila que o serviço de pagamento escutaria
  //     queueOptions: {
  //       durable: true,
  //     },
  //   },
  // });
  // await microservice.listen();
}
bootstrap();

