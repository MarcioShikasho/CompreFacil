import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { NotificacaoModule } from "./notificacao/notificacao.module"; // Import NotificacaoModule
// No ClientsModule needed here if it only consumes messages

@Module({
  imports: [
    PrismaModule,
    NotificacaoModule, // Add NotificacaoModule to imports
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

