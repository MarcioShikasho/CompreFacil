-- CreateTable
CREATE TABLE "Transacao" (
    "id" SERIAL NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT,
    "status" TEXT NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transacao_pkey" PRIMARY KEY ("id")
);
