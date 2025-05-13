import { Controller, Post, Body, Inject } from "@nestjs/common";
import { PagamentoService } from "./pagamento.service";
import { ClientProxy } from "@nestjs/microservices";

export class CreatePagamentoDto {
  valor: number;
  descricao?: string;
}

@Controller("pagamentos")
export class PagamentoController {
  constructor(
    private readonly pagamentoService: PagamentoService,
    @Inject("PAYMENT_RMQ_SERVICE") private readonly client: ClientProxy,
  ) {}

  @Post()
  async create(@Body() createPagamentoDto: CreatePagamentoDto) {
    const pagamento = await this.pagamentoService.createPagamento(createPagamentoDto);

    return pagamento;
  }
}

