export type Status = "pendente" | "andamento" | "concluido";

export interface Peg {
  peg: string;
  descricao: string;
  quantidade_itens: number;
  localizacoes: string;
  quantidade_caixa: number | null;
  status: Status;
}

export type Tela =
  | "dashboard"
  | "pendencias"
  | "andamento"
  | "concluidos";