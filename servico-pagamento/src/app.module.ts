import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { PagamentoModule } from "./pagamento/pagamento.module"; // Corrected import path

@Module({
  imports: [
    PrismaModule,
    PagamentoModule, // Import PagamentoModule
    ClientsModule.register([
      {
        name: "PAYMENT_RMQ_SERVICE", // Ensure this name matches the one used in @Inject
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672"],
          queue: "pagamentos_exchange", // This is the exchange name
          // The client will publish to this exchange. Routing keys will be specified in emit()
          queueOptions: {
            durable: true, // Exchange durable
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

