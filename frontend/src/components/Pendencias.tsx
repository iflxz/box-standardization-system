import {
  Button,
  Card,
  Empty,
  Input,
  InputNumber,
  Space,
  Table,
  Typography,
} from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Peg } from "../types";

const { Title, Text } = Typography;

interface PendenciasProps {
  pendentes: Peg[];
  dadosFiltrados: Peg[];
  selecionados: string[];
  quantidadeSelecionar: number | null;
  busca: string;
  carregando: boolean;
  colunasPendencias: ColumnsType<Peg>;
  selecionarQuantidade: () => void;
  selecionarTodosVisiveis: () => void;
  limparSelecao: () => void;
  imprimirSelecionados: () => void;
  setQuantidadeSelecionar: (valor: number | null) => void;
  setBusca: (valor: string) => void;
}

export default function Pendencias({
  pendentes,
  dadosFiltrados,
  selecionados,
  quantidadeSelecionar,
  busca,
  carregando,
  colunasPendencias,
  selecionarQuantidade,
  selecionarTodosVisiveis,
  limparSelecao,
  imprimirSelecionados,
  setQuantidadeSelecionar,
  setBusca,
}: PendenciasProps) {
  return (
    <Space
      direction="vertical"
      size="large"
      style={{ width: "100%" }}
    >
      <div>
        <Title level={2}>Pendências</Title>

        <Text type="secondary">
          Selecione os PEGs que deseja imprimir.
        </Text>
      </div>

      <Card>
        <Space wrap>
          <InputNumber
            min={1}
            max={pendentes.length}
            value={quantidadeSelecionar}
            placeholder="Qtd. PEGs"
            onChange={(valor) =>
              setQuantidadeSelecionar(valor)
            }
            style={{
              width: 140,
            }}
          />

          <Button onClick={selecionarQuantidade}>
            Selecionar quantidade
          </Button>

          <Button onClick={selecionarTodosVisiveis}>
            Selecionar todos
          </Button>

          <Button onClick={limparSelecao}>
            Limpar seleção
          </Button>

          <Button
            type="primary"
            icon={<PrinterOutlined />}
            disabled={selecionados.length === 0}
            loading={carregando}
            onClick={imprimirSelecionados}
            style={{
              boxShadow:
                selecionados.length > 0
                  ? "0 2px 0 rgba(245, 158, 11, 0.35)"
                  : "none",
            }}
          >
            Imprimir ({selecionados.length})
          </Button>
        </Space>
      </Card>

      <Card>
        <Input
          placeholder="Buscar por PEG, descrição ou endereço..."
          value={busca}
          onChange={(evento) =>
            setBusca(evento.target.value)
          }
          allowClear
          style={{
            marginBottom: 16,
          }}
        />

        <Table
          rowKey="peg"
          columns={colunasPendencias}
          dataSource={dadosFiltrados}
          pagination={{
            pageSize: 15,
            showSizeChanger: false,
            position: ["bottomCenter"],
          }}
          locale={{
            emptyText: (
              <Empty description="Nenhuma pendência encontrada" />
            ),
          }}
        />
      </Card>
    </Space>
  );
}