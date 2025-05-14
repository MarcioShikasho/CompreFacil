import { Injectable, Inject } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePagamentoDto } from "./pagamento.controller";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class PagamentoService {
  constructor(
    private prisma: PrismaService,
    @Inject("PAYMENT_RMQ_SERVICE") private client: ClientProxy,
  ) {}

  async createPagamento(data: CreatePagamentoDto) {
    const transacao = await this.prisma.transacao.create({
      data: {
        valor: data.valor,
        descricao: data.descricao,
        status: "pendente",
      },
    });
    console.log(`Transação ${transacao.id} criada com status pendente.`);
    const msgSolicitacao = {
      transacaoId: transacao.id,
      status: "pendente",
      mensagem: "Solicitação de pagamento recebida.",
    };
    this.client.emit("solicitacao_pagamento_criada", msgSolicitacao); 
    console.log(
      `Mensagem de solicitação para transação ${transacao.id} publicada.`, 
    );

    setTimeout(async () => {
      try {
        const transacaoAtualizada = await this.prisma.transacao.update({
          where: { id: transacao.id },
          data: { status: "sucesso" },
        });
        console.log(
          `Transação ${transacaoAtualizada.id} atualizada para sucesso.`,
        );

        const msgConfirmacao = {
          transacaoId: transacaoAtualizada.id,
          status: "sucesso",
          mensagem: "Pagamento confirmado com sucesso.",
        };
        this.client.emit("pagamento_confirmado", msgConfirmacao);
        console.log(
          `Mensagem de confirmação para transação ${transacaoAtualizada.id} publicada.`,
        );
      } catch (err) {
        console.error(
          "Erro ao confirmar pagamento e notificar (simulado):",
          err,
        );
        await this.prisma.transacao.update({
            where: { id: transacao.id },
            data: { status: "falha_processamento" },
          });
      }
    }, 5000);
    return transacao;
  }
}

