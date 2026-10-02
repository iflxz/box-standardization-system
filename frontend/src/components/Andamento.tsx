import {
  Button,
  Card,
  Empty,
  Space,
  Table,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Peg } from "../types";

const { Title, Text } = Typography;

interface AndamentoProps {
  andamento: Peg[];
  carregando: boolean;
  colunasAndamento: ColumnsType<Peg>;
  cancelarTodosAndamento: () => void;
}

export default function Andamento({
  andamento,
  carregando,
  colunasAndamento,
  cancelarTodosAndamento,
}: AndamentoProps) {
  return (
    <Space
      direction="vertical"
      size="large"
      style={{ width: "100%" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>
            Em andamento
          </Title>

          <Text type="secondary">
            PEGs que já foram processados e estão sendo coletados.
          </Text>
        </div>

        <Button
          danger
          type="primary"
          onClick={cancelarTodosAndamento}
          loading={carregando}
          disabled={andamento.length === 0}
          style={{
            height: 40,
            fontWeight: 600,
            boxShadow:
              andamento.length > 0
                ? "0 2px 0 rgba(218, 54, 51, 0.35)"
                : "none",
          }}
        >
          Cancelar todos ({andamento.length})
        </Button>
      </div>

      <Card>
        <Table
          rowKey="peg"
          columns={colunasAndamento}
          dataSource={andamento}
          pagination={{
            pageSize: 15,
            position: ["bottomCenter"],
          }}
          locale={{
            emptyText: (
              <Empty description="Nenhum PEG em andamento" />
            ),
          }}
        />
      </Card>
    </Space>
  );
}