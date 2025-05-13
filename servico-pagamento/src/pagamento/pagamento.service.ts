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
    // 1. Armazena dados da transação com status pendente
    const transacao = await this.prisma.transacao.create({
      data: {
        valor: data.valor,
        descricao: data.descricao,
        status: "pendente",
      },
    });
    console.log(`Transação ${transacao.id} criada com status pendente.`);

    // 2. Publica mensagem na fila para sistema de notificação (solicitação)
    const msgSolicitacao = {
      transacaoId: transacao.id,
      status: "pendente",
      mensagem: "Solicitação de pagamento recebida.",
    };
    this.client.emit("solicitacao_pagamento_criada", msgSolicitacao); // Usar um pattern/evento específico
    console.log(
      `Mensagem de solicitação para transação ${transacao.id} publicada.`, 
    );

    // Simulação do processamento e confirmação do pagamento
    setTimeout(async () => {
      try {
        // 4. Atualiza o status para sucesso
        const transacaoAtualizada = await this.prisma.transacao.update({
          where: { id: transacao.id },
          data: { status: "sucesso" },
        });
        console.log(
          `Transação ${transacaoAtualizada.id} atualizada para sucesso.`,
        );

        // 5. Publica mensagem na fila para sistema de notificação (confirmação)
        const msgConfirmacao = {
          transacaoId: transacaoAtualizada.id,
          status: "sucesso",
          mensagem: "Pagamento confirmado com sucesso.",
        };
        this.client.emit("pagamento_confirmado", msgConfirmacao); // Usar um pattern/evento específico
        console.log(
          `Mensagem de confirmação para transação ${transacaoAtualizada.id} publicada.`,
        );
      } catch (err) {
        console.error(
          "Erro ao confirmar pagamento e notificar (simulado):",
          err,
        );
        // Tratar erro de atualização ou publicação, possivelmente atualizando status para 'falha'
        await this.prisma.transacao.update({
            where: { id: transacao.id },
            data: { status: "falha_processamento" },
          });
      }
    }, 5000); // Simula um delay de 5 segundos para confirmação

    return transacao;
  }
  
  // Adicionar outros métodos conforme necessário (ex: buscar pagamento, etc.)
}

