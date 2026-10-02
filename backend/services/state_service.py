from pathlib import Path
import json

import pandas as pd

from services.utils import normalizar_peg

def consolidar_pegs(dados):
    mapa = {}

    prioridade = {
        "pendente": 1,
        "andamento": 2,
        "concluido": 3,
    }

    for item in dados:
        peg = normalizar_peg(item.get("peg"))

        if not peg:
            continue

        item["peg"] = peg

        existente = mapa.get(peg)

        if existente is None:
            mapa[peg] = item
            continue

        status_atual = existente.get(
            "status",
            "pendente"
        )

        status_novo = item.get(
            "status",
            "pendente"
        )

        if prioridade.get(status_novo, 0) > prioridade.get(
            status_atual,
            0
        ):
            mapa[peg] = item

        elif (
            status_novo == "concluido"
            and item.get("quantidade_caixa") is not None
        ):
            mapa[peg] = item

    return list(mapa.values())


def carregar_estado(caminho: Path):
    if not caminho.exists():
        return []

    try:
        with open(
            caminho,
            "r",
            encoding="utf-8"
        ) as arquivo:
            dados = json.load(arquivo)

        if not isinstance(dados, list):
            return []

        return consolidar_pegs(dados)

    except (json.JSONDecodeError, OSError):
        return []


def salvar_estado(caminho: Path, dados):
    dados = consolidar_pegs(dados)

    with open(
        caminho,
        "w",
        encoding="utf-8"
    ) as arquivo:
        json.dump(
            dados,
            arquivo,
            ensure_ascii=False,
            indent=2
        )

def aplicar_status_antigo(dados_novos, caminho_estado: Path):
    estado_antigo = carregar_estado(caminho_estado)

    mapa_antigo = {
        item["peg"]: item
        for item in estado_antigo
    }

    for item in dados_novos:
        antigo = mapa_antigo.get(item["peg"])

        if antigo:
            if (
                antigo.get("quantidade_caixa") is not None
                and antigo.get("quantidade_caixa") > 0
            ):
                item["quantidade_caixa"] = antigo["quantidade_caixa"]
                item["status"] = "concluido"
                continue

            if antigo.get("status") == "andamento":
                item["status"] = "andamento"
                continue

        item["status"] = "pendente"

    return dados_novos