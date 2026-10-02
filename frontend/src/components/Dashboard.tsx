import {
  Button,
  Card,
  Progress,
  Space,
  Statistic,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  InboxOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { Peg } from "../types";
import { cclogThemeColors } from "../theme";

const { Title, Text } = Typography;

interface DashboardProps {
  dados: Peg[];
  carregando: boolean;
  atualizarPlanilhas: () => void;
}

export default function Dashboard({
  dados,
  carregando,
  atualizarPlanilhas,
}: DashboardProps) {
  const pendentes = dados.filter(
    (item) => item.status === "pendente"
  );

  const andamento = dados.filter(
    (item) => item.status === "andamento"
  );

  const concluidos = dados.filter(
    (item) => item.status === "concluido"
  );

  const progresso =
    dados.length > 0
      ? Math.round((concluidos.length / dados.length) * 100)
      : 0;

  return (
    <Space
      direction="vertical"
      size="large"
      style={{ width: "100%" }}
    >
      <Title level={2}>Dashboard</Title>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 16,
        }}
      >
        <Card
          className="dashboard-card"
          style={{
            borderLeft: `4px solid ${cclogThemeColors.cyan}`,
          }}
        >
          <Statistic
            title={
              <span
                style={{
                  color: cclogThemeColors.text,
                }}
              >
                Total de PEGs
              </span>
            }
            value={dados.length}
            prefix={
              <DatabaseOutlined
                style={{
                  color: cclogThemeColors.cyan,
                }}
              />
            }
            valueStyle={{
              color: cclogThemeColors.text,
              fontWeight: 700,
            }}
          />
        </Card>

        <Card
          className="dashboard-card"
          style={{
            borderLeft: `4px solid ${cclogThemeColors.red}`,
          }}
        >
          <Statistic
            title={
              <span
                style={{
                  color: cclogThemeColors.text,
                }}
              >
                Pendentes
              </span>
            }
            value={pendentes.length}
            prefix={
              <InboxOutlined
                style={{
                  color: cclogThemeColors.red,
                }}
              />
            }
            valueStyle={{
              color: cclogThemeColors.text,
              fontWeight: 700,
            }}
          />
        </Card>

        <Card
          className="dashboard-card"
          style={{
            borderLeft: `4px solid ${cclogThemeColors.primary}`,
          }}
        >
          <Statistic
            title={
              <span
                style={{
                  color: cclogThemeColors.text,
                }}
              >
                Em andamento
              </span>
            }
            value={andamento.length}
            prefix={
              <ClockCircleOutlined
                style={{
                  color: cclogThemeColors.primary,
                }}
              />
            }
            valueStyle={{
              color: cclogThemeColors.text,
              fontWeight: 700,
            }}
          />
        </Card>

        <Card
          className="dashboard-card"
          style={{
            borderLeft: `4px solid ${cclogThemeColors.green}`,
          }}
        >
          <Statistic
            title={
              <span
                style={{
                  color: cclogThemeColors.text,
                }}
              >
                Concluídos
              </span>
            }
            value={concluidos.length}
            prefix={
              <CheckCircleOutlined
                style={{
                  color: cclogThemeColors.green,
                }}
              />
            }
            valueStyle={{
              color: cclogThemeColors.text,
              fontWeight: 700,
            }}
          />
        </Card>
      </div>

      <Card title="Progresso">
        <Progress
          percent={progresso}
          status={
            progresso === 100
              ? "success"
              : "active"
          }
        />
      </Card>

      <Card
        title="Atualização dos dados"
        style={{
          marginTop: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Text
              strong
              style={{
                display: "block",
                fontSize: 16,
                marginBottom: 6,
              }}
            >
              Atualizar planilhas
            </Text>

            <Text type="secondary">
              Reprocesse as planilhas para atualizar os PEGs
              disponíveis no sistema.
            </Text>
          </div>

          <Button
            type="primary"
            icon={<ReloadOutlined />}
            loading={carregando}
            onClick={atualizarPlanilhas}
            size="large"
            style={{
              height: 48,
              paddingLeft: 28,
              paddingRight: 28,
              fontWeight: 600,
              boxShadow:
                "0 2px 0 rgba(245, 158, 11, 0.35)",
            }}
          >
            Atualizar planilhas
          </Button>
        </div>
      </Card>
    </Space>
  );
}