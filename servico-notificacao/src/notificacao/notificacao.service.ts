import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

interface PagamentoPayload {
  transacaoId: number;
  status: string;
  mensagem: string;
}

@Injectable()
export class NotificacaoService {
  constructor(private prisma: PrismaService) {}

  async processarNotificacaoSolicitacao(data: PagamentoPayload) {
    console.log(
      `[NotificacaoService] Processando notificação de solicitação para transação ${data.transacaoId}: ${data.mensagem}`,
    );
    try {
      await this.prisma.notificacao.create({
        data: {
          transacaoId: data.transacaoId,
          mensagem: `Solicitação: ${data.mensagem}`,
          statusEnvio: "processada",
        },
      });
      console.log(`Notificação de solicitação para transação ${data.transacaoId} registrada no DB.`);
    } catch (error) {
      console.error("Erro ao salvar notificação de solicitação no DB:", error);
    }
    console.log(`Simulando envio de notificação (solicitação) para usuário sobre transação ${data.transacaoId}.`);
  }

  async processarNotificacaoConfirmacao(data: PagamentoPayload) {
    console.log(
      `[NotificacaoService] Processando notificação de confirmação para transação ${data.transacaoId}: ${data.mensagem}`,
    );
    try {
      await this.prisma.notificacao.create({
        data: {
          transacaoId: data.transacaoId,
          mensagem: `Confirmação: ${data.mensagem}`,
          statusEnvio: "processada", 
        },
      });
      console.log(`Notificação de confirmação para transação ${data.transacaoId} registrada no DB.`);
    } catch (error) {
      console.error("Erro ao salvar notificação de confirmação no DB:", error);
    }
    console.log(`Simulando envio de notificação (confirmação) para usuário sobre transação ${data.transacaoId}.`);
  }
}

