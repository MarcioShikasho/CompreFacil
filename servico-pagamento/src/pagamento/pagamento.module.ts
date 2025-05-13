import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PagamentoService } from './pagamento.service';
import { PagamentoController } from './pagamento.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'PAYMENT_RMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq_server:5672'],
          exchange: 'pagamentos_exchange',
          exchangeType: 'direct' 
        },
      },
    ]),
  ],
  controllers: [PagamentoController],
  providers: [PagamentoService],
  exports: [PagamentoService],
})
export class PagamentoModule {}