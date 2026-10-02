import pandas as pd


def normalizar_peg(valor):
    if pd.isna(valor):
        return ""

    texto = str(valor).strip().upper()

    if texto.endswith(".0") and texto[:-2].isdigit():
        texto = texto[:-2]

    texto = texto.replace(".", "")

    return texto