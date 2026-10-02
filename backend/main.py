from pathlib import Path
from datetime import datetime

import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.excel_service import (
    atualizar_levantamento,
    processar_estoque,
    processar_levantamento,
    preencher_descricoes_levantamento,
)

from services.state_service import (
    carregar_estado,
    salvar_estado,
    aplicar_status_antigo,
)

from services.utils import normalizar_peg


app = FastAPI(
    title="Sistema de Padronização de Caixas",
    description="API para processamento de planilhas e controle de padronização de caixas.",
    version="1.0.0",
)


BASE_DIR = Path(__file__).resolve().parent

PASTA_BASE_ESTOQUE = Path(
    r"G:\GERENCIA DE LOGISTICA\007 - ESTOQUE\007 - Estoque WMS"
)

ARQUIVO_LEVANTAMENTO = Path(
    r"G:\GERENCIA DE LOGISTICA\001 - LOGÍSTICA ADM\012 - CONSULTAS\Levantamento Padrão de Caixas Fechadas.xlsx"
)

ARQUIVO_ESTADO = BASE_DIR / "estado.json"

NOME_BACKUP = (
    "Levantamento Padrão de Caixas Fechadas - Backup automático.xlsx"
)

def encontrar_estoque_mais_recente():

    agora = datetime.now()

    ano = agora.year
    mes = agora.month

    pasta_mes = (
        PASTA_BASE_ESTOQUE
        / f"{ano}"
        / f"{mes:02d}"
    )

    print("\n==============================")
    print("BUSCANDO ESTOQUE")
    print("==============================")
    print(f"Pasta procurada: {pasta_mes}")

    if not pasta_mes.exists():
        raise FileNotFoundError(
            f"Pasta de estoque do mês atual não encontrada: "
            f"{pasta_mes}"
        )

    arquivos = [
        arquivo
        for arquivo in pasta_mes.glob("*.xlsx")
        if not arquivo.name.startswith("~$")
        and "levantamento" not in arquivo.name.lower()
    ]

    if not arquivos:
        raise FileNotFoundError(
            f"Nenhuma planilha de estoque encontrada em: "
            f"{pasta_mes}"
        )

    arquivo_mais_recente = max(
        arquivos,
        key=lambda arquivo: arquivo.stat().st_mtime
    )

    print(
        f"Planilha selecionada: "
        f"{arquivo_mais_recente.name}"
    )

    return arquivo_mais_recente

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Conclusao(BaseModel):
    peg: str = Field(..., min_length=1)
    quantidade_caixa: int = Field(..., gt=0)


class Andamento(BaseModel):
    pegs: list[str] = Field(..., min_length=1)


class CancelarAndamento(BaseModel):
    pegs: list[str] = Field(..., min_length=1)


@app.post("/atualizar")
def atualizar_planilhas():

    try:

        if not ARQUIVO_LEVANTAMENTO.exists():
            raise ValueError(
                f"Planilha de levantamento não encontrada: "
                f"{ARQUIVO_LEVANTAMENTO}"
            )

        estoque_path = encontrar_estoque_mais_recente()

        levantamento_path = ARQUIVO_LEVANTAMENTO

        print("\n==============================")
        print("ATUALIZANDO PLANILHAS")
        print("==============================")

        print(
            f"Estoque: {estoque_path}"
        )

        print(
            f"Levantamento: {levantamento_path}"
        )

        estoque = processar_estoque(
            estoque_path
        )

        descricoes_preenchidas = (
            preencher_descricoes_levantamento(
                levantamento_path,
                estoque_path
            )
        )

        print(
            f"Descrições preenchidas no levantamento:  "
            f"{descricoes_preenchidas}"
        )

        levantamento = processar_levantamento(
            levantamento_path,
            estoque
        )

        print(
            f"PEGs encontrados no estoque: "
            f"{len(estoque)}"
        )

        print(
            f"PEGs concluídos no levantamento: "
            f"{len(levantamento)}"
        )

        print(
            "\n--- EXEMPLO DE PEGs DO ESTOQUE ---"
        )

        print(
            estoque["peg"].head(10).tolist()
        )

        print(
            "\n--- EXEMPLO DE CÓDIGOS DO LEVANTAMENTO ---"
        )

        print(
            levantamento["peg"].head(10).tolist()
        )

        estoque["peg"] = (
            estoque["peg"]
            .apply(normalizar_peg)
        )

        levantamento["peg"] = (
            levantamento["peg"]
            .apply(normalizar_peg)
        )

        quantidades = dict(
            zip(
                levantamento["peg"],
                levantamento["quantidade_caixa"],
            )
        )

        dados = []

        concluidos_importados = 0

        estoque_por_peg = {
            normalizar_peg(item["peg"]): item
            for item in estoque.to_dict(
                orient="records"
            )
        }
    
        levantamento_por_peg = {
            normalizar_peg(item["peg"]): item
            for item in levantamento.to_dict(
                orient="records"
            )
        }

        for peg, item in estoque_por_peg.items():
            levantamento_item = levantamento_por_peg.get(
                peg
            )

            quantidade = None

            if levantamento_item is not None:
                quantidade = levantamento_item[
                    "quantidade_caixa"
                ]
                concluidos_importados += 1

            dados.append(
                {
                    "peg": peg,
                    "descricao": (
                        item["descricao"]
                        if item["descricao"]
                        else (
                            levantamento_item["descricao"]
                            if levantamento_item is not None
                            else ""
                        )
                    ),
                    "quantidade_itens": item[
                        "quantidade_itens"
                    ],
                    "localizacoes": item[
                        "localizacoes"
                    ],
                    "quantidade_caixa": (
                        int(quantidade)
                        if pd.notna(quantidade)
                        else None
                    ),
                    "status": (
                        "concluido"
                        if quantidade is not None
                        else "pendente"
                    ),
                }
            )

        for peg, item in levantamento_por_peg.items():

            if peg in estoque_por_peg:
                continue

            quantidade = item[
                "quantidade_caixa"
            ]

            dados.append(
                {
                    "peg": peg,
                    "descricao": item[
                        "descricao"
                    ],
                    "quantidade_itens": 0,
                    "localizacoes": "",
                    "quantidade_caixa": (
                        int(quantidade)
                        if pd.notna(quantidade)
                        else None
                    ),
                    "status": "concluido",
                }
            )

            concluidos_importados += 1


        dados = aplicar_status_antigo(
            dados,
            ARQUIVO_ESTADO,
        )

        for item in dados:

            quantidade = quantidades.get(
                item["peg"]
            )

            if quantidade is not None:

                item["quantidade_caixa"] = (
                    int(quantidade)
                )

                item["status"] = "concluido"

        print(
            f"PEGs concluídos cruzados: "
            f"{concluidos_importados}"
        )

        salvar_estado(
            ARQUIVO_ESTADO,
            dados,
        )

        return {
            "mensagem":
                "Planilhas atualizadas com sucesso.",

            "estoque":
                estoque_path.name,

            "levantamento":
                levantamento_path.name,

            "total_pegs":
                len(dados),

            "concluidos_importados":
                concluidos_importados,

            "dados":
                dados,
        }

    except Exception as erro:

        print(
            f"\nERRO AO ATUALIZAR: {erro}"
        )

        return {
            "erro": str(erro)
        }

@app.get("/dados")
def obter_dados():

    return {
        "dados":
            carregar_estado(
                ARQUIVO_ESTADO
            )
    }


@app.post("/iniciar-andamento")
def iniciar_andamento(
    andamento: Andamento,
):

    try:

        estado = carregar_estado(
            ARQUIVO_ESTADO
        )

        pegs_selecionados = {
            normalizar_peg(peg)
            for peg in andamento.pegs
        }

        enviados = 0

        ignorados = []

        for item in estado:

            peg_atual = normalizar_peg(
                item["peg"]
            )

            if peg_atual not in pegs_selecionados:
                continue

            if item.get("status") == "pendente":

                item["status"] = "andamento"

                enviados += 1

            else:

                ignorados.append(
                    {
                        "peg": item["peg"],
                        "status": item.get("status"),
                    }
                )

        salvar_estado(
            ARQUIVO_ESTADO,
            estado,
        )

        return {
            "mensagem":
                f"{enviados} PEG(s) enviados para andamento.",

            "enviados":
                enviados,

            "ignorados":
                ignorados,

            "dados":
                estado,
        }

    except Exception as erro:

        return {
            "erro": str(erro)
        }

@app.post("/concluir-peg")
def concluir_peg(
    conclusao: Conclusao,
):

    try:

        estado = carregar_estado(
            ARQUIVO_ESTADO
        )

        peg_alvo = normalizar_peg(
            conclusao.peg
        )

        encontrado = False

        for item in estado:

            peg_atual = normalizar_peg(
                item["peg"]
            )

            if peg_atual != peg_alvo:
                continue

            encontrado = True

            if item.get("status") != "andamento":

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "O PEG precisa estar em andamento "
                        "para ser concluído."
                    ),
                )

            item["quantidade_caixa"] = (
                conclusao.quantidade_caixa
            )

            item["status"] = "concluido"

            break

        if not encontrado:

            raise HTTPException(
                status_code=404,
                detail="PEG não encontrado.",
            )

        print(
            "PEG A CONCLUIR:",
            peg_alvo,
        )

        print(
            "QUANTIDADE:",
            conclusao.quantidade_caixa,
        )

        print(
            "ARQUIVO:",
            ARQUIVO_LEVANTAMENTO,
        )

        resultado_planilha = atualizar_levantamento(
            ARQUIVO_LEVANTAMENTO,
            peg_alvo,
            item["descricao"],
            conclusao.quantidade_caixa,
            NOME_BACKUP,
        )

        salvar_estado(
            ARQUIVO_ESTADO,
            estado,
        )

        return {
            "mensagem": (
                f"PEG {conclusao.peg} concluído "
                "e planilha atualizada."
            ),

            "dados":
                estado,

            "planilha":
                resultado_planilha,
        }

    except HTTPException:

        raise

    except Exception as erro:

        return {
            "erro": str(erro)
        }

@app.get("/")
def inicio():

    return {
        "mensagem":
            "API funcionando"
    }

@app.post("/cancelar-andamento")
def cancelar_andamento(
    cancelamento: CancelarAndamento,
):

    try:

        estado = carregar_estado(
            ARQUIVO_ESTADO
        )

        pegs_selecionados = set(
            cancelamento.pegs
        )

        encontrados = 0

        for item in estado:

            if (
                item["peg"] in pegs_selecionados
                and
                item.get("status") == "andamento"
            ):

                item["status"] = "pendente"

                item["quantidade_caixa"] = None

                encontrados += 1

        salvar_estado(
            ARQUIVO_ESTADO,
            estado,
        )

        return {
            "mensagem":
                f"{encontrados} PEG(s) voltaram para pendências.",

            "dados":
                estado,
        }

    except Exception as erro:

        return {
            "erro": str(erro)
        }

@app.post("/cancelar-todos-andamento")
def cancelar_todos_andamento():

    try:

        estado = carregar_estado(
            ARQUIVO_ESTADO
        )

        quantidade_cancelada = 0

        for item in estado:

            if item.get("status") == "andamento":

                item["status"] = "pendente"

                item["quantidade_caixa"] = None

                quantidade_cancelada += 1

        salvar_estado(
            ARQUIVO_ESTADO,
            estado,
        )

        return {
            "mensagem":
                f"{quantidade_cancelada} PEG(s) cancelado(s).",

            "quantidade_cancelada":
                quantidade_cancelada,

            "dados":
                estado,
        }

    except Exception as erro:

        return {
            "erro": str(erro)
        }

@app.post("/voltar-para-pendente/{peg}")
def voltar_para_pendente(
    peg: str,
):

    try:

        dados = carregar_estado(
            ARQUIVO_ESTADO
        )

        peg_alvo = normalizar_peg(
            peg
        )

        encontrado = False

        for item in dados:

            if normalizar_peg(
                item["peg"]
            ) == peg_alvo:

                if item["status"] != "concluido":

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            "Apenas PEGs concluídos "
                            "podem voltar para pendentes."
                        ),
                    )

                item["status"] = "pendente"

                item["quantidade_caixa"] = None

                encontrado = True

                break

        if not encontrado:

            raise HTTPException(
                status_code=404,
                detail="PEG não encontrado.",
            )

        salvar_estado(
            ARQUIVO_ESTADO,
            dados,
        )

        return {
            "mensagem":
                "PEG voltou para pendentes.",

            "peg":
                peg_alvo,

            "dados":
                dados,
        }

    except HTTPException:

        raise

    except Exception as erro:

        print(
            f"\nERRO AO VOLTAR PEG PARA PENDENTES: {erro}"
        )

        raise HTTPException(
            status_code=500,
            detail=str(erro),
        )