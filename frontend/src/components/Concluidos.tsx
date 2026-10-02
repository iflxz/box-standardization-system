import {
  Card,
  Empty,
  Space,
  Table,
  Typography,
} from "antd";

import type { ColumnsType } from "antd/es/table";
import type { Peg } from "../types";

const { Title, Text } = Typography;

interface ConcluidosProps {
  concluidos: Peg[];
  colunasConcluidos: ColumnsType<Peg>;
  voltarParaPendente: (peg: string) => void;
}

export default function Concluidos({
  concluidos,
  colunasConcluidos,
  voltarParaPendente,
}: ConcluidosProps) {
  return (
    <Space
      direction="vertical"
      size="large"
      style={{ width: "100%" }}
    >
      <div>
        <Title level={2}>Concluídos</Title>

        <Text type="secondary">
          PEGs já finalizados e suas respectivas
          quantidades por caixas.
        </Text>
      </div>

      <Card>
        <Table
          rowKey="peg"
          columns={colunasConcluidos}
          dataSource={concluidos}
          pagination={{
            pageSize: 15,
            showSizeChanger: false,
            position: ["bottomCenter"],
          }}
          locale={{
            emptyText: (
              <Empty description="Nenhum PEG concluído" />
            ),
          }}
        />
      </Card>
    </Space>
  );
}