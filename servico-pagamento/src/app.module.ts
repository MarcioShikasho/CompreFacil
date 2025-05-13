import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { PagamentoModule } from "./pagamento/pagamento.module";

@Module({
  imports: [
    PrismaModule,
    PagamentoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

