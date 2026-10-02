const API = "http://127.0.0.1:8000";

export async function buscarDados() {
  const resposta = await fetch(`${API}/dados`);

  if (!resposta.ok) {
    throw new Error(`Erro HTTP ${resposta.status}`);
  }

  const resultado = await resposta.json();

  if (!Array.isArray(resultado.dados)) {
    throw new Error("A API não retornou uma lista de PEGs.");
  }

  return resultado;
}

export async function atualizarPlanilhas() {
  const resposta = await fetch(`${API}/atualizar`, {
    method: "POST",
  });

  const resultado = await resposta.json();

  if (!resposta.ok || resultado.erro) {
    throw new Error(
      resultado.erro || "Erro ao atualizar planilhas."
    );
  }

  return resultado;
}

export async function iniciarAndamento(pegs: string[]) {
  const resposta = await fetch(`${API}/iniciar-andamento`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pegs,
    }),
  });

  const resultado = await resposta.json();

  if (!resposta.ok || resultado.erro) {
    throw new Error(
      resultado.erro || "Erro ao iniciar andamento."
    );
  }

  return resultado;
}

export async function concluirPeg(
  peg: string,
  quantidade_caixa: number
) {
  const resposta = await fetch(`${API}/concluir-peg`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      peg,
      quantidade_caixa,
    }),
  });

  const resultado = await resposta.json();

  if (!resposta.ok || resultado.erro) {
    throw new Error(
      resultado.erro ||
        "Erro ao atualizar a quantidade da caixa."
    );
  }

  return resultado;
}

export async function cancelarAndamento(peg: string) {
  const resposta = await fetch(`${API}/cancelar-andamento`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pegs: [peg],
    }),
  });

  const resultado = await resposta.json();

  if (!resposta.ok || resultado.erro) {
    throw new Error(
      resultado.erro || "Erro ao cancelar andamento."
    );
  }

  return resultado;
}

export async function cancelarTodosAndamento() {
  const resposta = await fetch(
    `${API}/cancelar-todos-andamento`,
    {
      method: "POST",
    }
  );

  const resultado = await resposta.json();

  if (!resposta.ok || resultado.erro) {
    throw new Error(
      resultado.erro || "Erro ao cancelar todos os PEGs."
    );
  }

  return resultado;
}

export async function voltarParaPendente(peg: string) {
  const resposta = await fetch(
    `http://127.0.0.1:8000/voltar-para-pendente/${encodeURIComponent(peg)}`,
    {
      method: "POST",
    }
  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.detail || "Erro ao voltar PEG para pendentes.");
  }

  return dados;
}