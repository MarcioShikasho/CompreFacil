import { Controller } from "@nestjs/common";
import { NotificacaoService } from "./notificacao.service";
import { EventPattern, Payload } from "@nestjs/microservices";

interface PagamentoPayload {
  transacaoId: number;
  status: string;
  mensagem: string;
}

@Controller()
export class NotificacaoController {
  constructor(private readonly notificacaoService: NotificacaoService) {}

  @EventPattern("solicitacao_pagamento_criada")
  async handleSolicitacaoPagamento(@Payload() data: PagamentoPayload) {
    console.log("[NotificacaoController] Evento 'solicitacao_pagamento_criada' recebido:", data);
    this.notificacaoService.processarNotificacaoSolicitacao(data);
  }

  @EventPattern("pagamento_confirmado")
  async handlePagamentoConfirmado(@Payload() data: PagamentoPayload) {
    console.log("[NotificacaoController] Evento 'pagamento_confirmado' recebido:", data);
    this.notificacaoService.processarNotificacaoConfirmacao(data);
  }
}

