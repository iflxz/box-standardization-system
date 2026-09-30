import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";

import {
  Alert,
  Button,
  Card,
  ConfigProvider,
  Empty,
  Input,
  InputNumber,
  Layout,
  Menu,
  Progress,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";

import type { ColumnsType } from "antd/es/table";

import {
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  InboxOutlined,
  PrinterOutlined,
  ReloadOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import antdTheme, { cclogThemeColors } from "./theme";
import "antd/dist/reset.css";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const API = "http://127.0.0.1:8000";

type Status = "pendente" | "andamento" | "concluido";

interface Peg {
  peg: string;
  descricao: string;
  quantidade_itens: number;
  localizacoes: string;
  quantidade_caixa: number | null;
  status: Status;
}

type Tela =
  | "dashboard"
  | "pendencias"
  | "andamento"
  | "concluidos"

function App() {
  const [dados, setDados] = useState<Peg[]>([]);
  const [tela, setTela] = useState<Tela>("dashboard");

  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [quantidadeSelecionar, setQuantidadeSelecionar] =
    useState<number | null>(null);

  const [quantidadesDigitadas, setQuantidadesDigitadas] = useState<
    Record<string, number | null>
  >({});

  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setErro("");

      const resposta = await fetch(`${API}/dados`);

      if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status}`);
      }

      const resultado = await resposta.json();

      if (!Array.isArray(resultado.dados)) {
        throw new Error("A API não retornou uma lista de PEGs.");
      }

      setDados(resultado.dados);
    } catch (erro) {
      console.error(erro);
      setErro("Não foi possível carregar os dados.");
    }
  }

  async function atualizarPlanilhas() {
    try {
      setCarregando(true);
      setErro("");
      setMensagem("");

      const resposta = await fetch(`${API}/atualizar`, {
        method: "POST",
      });

      const resultado = await resposta.json();

      if (!resposta.ok || resultado.erro) {
        throw new Error(
          resultado.erro || "Erro ao atualizar planilhas."
        );
      }

      setDados(resultado.dados);
      setMensagem(
        resultado.mensagem || "Planilhas atualizadas com sucesso."
      );
      setSelecionados([]);
    } catch (erro) {
      console.error(erro);

      setErro(
        erro instanceof Error
          ? erro.message
          : "Erro ao atualizar as planilhas."
      );
    } finally {
      setCarregando(false);
    }
  }

  function alternarSelecao(peg: string) {
    setSelecionados((atual) =>
      atual.includes(peg)
        ? atual.filter((item) => item !== peg)
        : [...atual, peg]
    );
  }

  function selecionarTodosVisiveis() {
    const pegs = dadosFiltrados.map((item) => item.peg);

    setSelecionados((atual) => {
      const todosSelecionados = pegs.every((peg) =>
        atual.includes(peg)
      );

      if (todosSelecionados) {
        return atual.filter((peg) => !pegs.includes(peg));
      }

      return Array.from(new Set([...atual, ...pegs]));
    });
  }

  function selecionarQuantidade() {
    if (!quantidadeSelecionar || quantidadeSelecionar <= 0) {
      setErro("Informe uma quantidade válida de PEGs.");
      return;
    }

    const disponiveis = dadosFiltrados
      .filter((item) => item.status === "pendente")
      .map((item) => item.peg);

    const quantidade = Math.min(
      quantidadeSelecionar,
      disponiveis.length
    );

    setSelecionados(disponiveis.slice(0, quantidade));
    setErro("");
  }

  function limparSelecao() {
    setSelecionados([]);
    setQuantidadeSelecionar(null);
  }

  function escolherEndereco(localizacoes: string) {
    const locais = localizacoes
      .split(",")
      .map((local) => local.trim())
      .filter(Boolean);

    const y01 = locais.find((local) => /Y01/i.test(local));

    if (y01) {
      return y01;
    }

    const y02 = locais.find((local) => /Y02/i.test(local));

    if (y02) {
      return y02;
    }

    return locais[0] || "-";
  }

  async function imprimirSelecionados() {
    if (selecionados.length === 0) {
      setErro("Selecione pelo menos um PEG para imprimir.");
      return;
    }

    try {
      setCarregando(true);
      setErro("");
      setMensagem("");

      const resposta = await fetch(`${API}/iniciar-andamento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pegs: selecionados,
        }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok || resultado.erro) {
        throw new Error(
          resultado.erro || "Erro ao iniciar andamento."
        );
      }

      setDados(resultado.dados);
      setSelecionados([]);

      const itensImpressao = resultado.dados.filter(
        (item: Peg) =>
          selecionados.includes(item.peg) &&
          item.status === "andamento"
      );

      const janela = window.open("", "");

      if (!janela) {
        throw new Error(
          "O navegador bloqueou a janela de impressão. Permita pop-ups para este site."
        );
      }

      const linhas = itensImpressao
        .map(
          (item: Peg) => `
            <tr>
              <td>${escolherEndereco(item.localizacoes)}</td>
              <td>${item.peg}</td>
              <td>${item.descricao}</td>
              <td style="padding: 0;">
                <input
                  type="text"
                  style="
                    width: 100%;
                    height: 42px;
                    box-sizing: border-box;
                    border: none;
                    outline: none;
                    background: transparent;
                    font-size: 18px;
                    text-align: center;
                  "
                />
              </td>
            </tr>
          `
        )
        .join("");

      janela.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <title>Lista de Coleta</title>

            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 30px;
                color: #000;
              }

              h1 {
                text-align: center;
                margin-bottom: 25px;
              }

              table {
                width: 100%;
                border-collapse: collapse;
              }

              th,
              td {
                border: 1px solid #000;
                padding: 10px;
                text-align: left;
                font-size: 13px;
              }

              th {
                background: #eee;
              }

              @media print {
                body {
                  margin: 15px;
                }

              }
            </style>
          </head>

          <body>
            <h1>Lista de Coleta</h1>

            <table>
              <thead>
                <tr>
                  <th>Endereço</th>
                  <th>PEG</th>
                  <th>Descrição</th>
                  <th>Qtd. Caixa</th>
                </tr>
              </thead>

              <tbody>
                ${linhas}
              </tbody>
            </table>
          </body>
        </html>
      `);

      janela.document.close();

      setTimeout(() => {
        janela.focus();
        janela.print();
      }, 300);

      setMensagem(
        `${itensImpressao.length} PEG(s) enviado(s) para impressão e colocado(s) em andamento.`
      );

      setTela("andamento");
    } catch (erro) {
      console.error(erro);

      setErro(
        erro instanceof Error
          ? erro.message
          : "Erro ao imprimir os PEGs."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarQuantidadeCaixa(peg: string) {
    const quantidade = quantidadesDigitadas[peg];

    if (
      quantidade === null ||
      quantidade === undefined ||
      quantidade <= 0
    ) {
      return;
    }

    try {
      setErro("");
      setMensagem("");

      const resposta = await fetch(`${API}/concluir-peg`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          peg,
          quantidade_caixa: quantidade,
        }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok || resultado.erro) {
        throw new Error(
          resultado.erro ||
            "Erro ao atualizar a quantidade da caixa."
        );
      }

      setDados(resultado.dados);

      setQuantidadesDigitadas((anterior) => {
        const novo = { ...anterior };

        delete novo[peg];

        return novo;
      });

      setMensagem(
        `PEG ${peg} concluído com ${quantidade} caixa(s).`
      );
    } catch (erro) {
      console.error(erro);

      setErro(
        erro instanceof Error
          ? erro.message
          : "Erro ao atualizar a quantidade da caixa."
      );
    }
  }

  async function cancelarAndamento(peg: string) {
    try {
      setErro("");
      setMensagem("");

      const resposta = await fetch(
        `${API}/cancelar-andamento`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pegs: [peg],
          }),
        }
      );

      const resultado = await resposta.json();

      if (!resposta.ok || resultado.erro) {
        throw new Error(
          resultado.erro || "Erro ao cancelar andamento."
        );
      }

      setDados(resultado.dados);

      setQuantidadesDigitadas((anterior) => {
        const novo = { ...anterior };

        delete novo[peg];

        return novo;
      });

      setMensagem(
        `PEG ${peg} voltou para pendências.`
      );
    } catch (erro) {
      console.error(erro);

      setErro(
        erro instanceof Error
          ? erro.message
          : "Erro ao cancelar andamento."
      );
    }
  }

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
      ? Math.round(
          (concluidos.length / dados.length) * 100
        )
      : 0;

  const dadosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return pendentes;
    }

    return pendentes.filter(
      (item) =>
        item.peg.toLowerCase().includes(termo) ||
        item.descricao.toLowerCase().includes(termo) ||
        item.localizacoes.toLowerCase().includes(termo)
    );
  }, [pendentes, busca]);

  const colunasPendencias: ColumnsType<Peg> = [
    {
      title: "",
      key: "selecionar",
      width: 55,

      render: (_, item) => (
        <input
          type="checkbox"
          checked={selecionados.includes(item.peg)}
          onChange={() => alternarSelecao(item.peg)}
          style={{
            width: 18,
            height: 18,
            cursor: "pointer",
          }}
        />
      ),
    },

    {
      title: "PEG",
      dataIndex: "peg",
      key: "peg",
      width: 150,
    },

    {
      title: "Descrição",
      dataIndex: "descricao",
      key: "descricao",
    },

    {
      title: "Endereço",
      key: "endereco",
      width: 180,

      render: (_, item) => (
        <Tag color="cyan">
          {escolherEndereco(item.localizacoes)}
        </Tag>
      ),
    },

    {
      title: "Itens",
      dataIndex: "quantidade_itens",
      key: "quantidade_itens",
      width: 80,
      align: "center",
    },
  ];

  const colunasAndamento: ColumnsType<Peg> = [
    {
      title: "PEG",
      dataIndex: "peg",
      key: "peg",
      width: 150,
    },

    {
      title: "Descrição",
      dataIndex: "descricao",
      key: "descricao",
    },

    {
      title: "Endereço",
      key: "endereco",
      width: 180,

      render: (_, item) => (
        <Tag color="cyan">
          {escolherEndereco(item.localizacoes)}
        </Tag>
      ),
    },

    {
      title: "Qtd. Caixa",
      key: "quantidade_caixa",
      width: 150,
      render: (_, record) => (
        <InputNumber
          min={1}
         precision={0}
          value={quantidadesDigitadas[record.peg] ?? null}
          onChange={(value) => {
            setQuantidadesDigitadas((prev) => ({
              ...prev,
              [record.peg]: value,
            }));
          }}
          onPressEnter={() => confirmarQuantidadeCaixa(record.peg)}
          placeholder="Qtd."
          style={{ width: "100%" }}
        />
      ),
    },

    {
      title: "Ação",
      key: "acao",
      width: 120,

      render: (_, item) => (
        <Button
          danger
          type="primary"
          onClick={() => cancelarAndamento(item.peg)}
          style={{
            boxShadow: "0 2px 0 rgba(218, 54, 51, 0.45)",
          }}
        >
          Cancelar
        </Button>
      ),
    },
  ];

  const colunasConcluidos: ColumnsType<Peg> = [
    {
      title: "PEG",
      dataIndex: "peg",
      key: "peg",
      width: 160,
    },

    {
      title: "Descrição",
      dataIndex: "descricao",
      key: "descricao",
    },

    {
      title: "Qtd. Caixa",
      dataIndex: "quantidade_caixa",
      key: "quantidade_caixa",
      width: 130,
      align: "center",
    },
  ];

  const estilosGlobais = (
    <style>
      {`
        .ant-pagination-item {
          background: #161B22 !important;
          border: 1px solid #30363D !important;
          border-radius: 6px !important;
        }

        .ant-pagination-item a {
          color: #E6EDF3 !important;
        }

        .ant-pagination-item:hover {
          background: #161B22 !important;
          border-color: #F59E0B !important;
        }

        .ant-pagination-item:hover a {
          color: #F59E0B !important;
        }

        .ant-pagination-item-active {
          background: #F59E0B !important;
          border-color: #F59E0B !important;
        }

        .ant-pagination-item-active a {
          color: #0D1117 !important;
        }

        .ant-pagination-prev,
        .ant-pagination-next {
          background: #161B22 !important;
          border: 1px solid #30363D !important;
          border-radius: 6px !important;
        }

        .ant-pagination-prev button,
        .ant-pagination-next button {
          background: transparent !important;
          color: #E6EDF3 !important;
          border: none !important;
        }

        .ant-pagination-prev:hover,
        .ant-pagination-next:hover {
          background: #161B22 !important;
          border-color: #F59E0B !important;
        }

        .ant-pagination-prev:hover button,
        .ant-pagination-next:hover button {
          color: #F59E0B !important;
        }

        .ant-pagination-disabled,
        .ant-pagination-disabled:hover {
          background: #161B22 !important;
          border-color: #30363D !important;
        }

        .ant-pagination-disabled button {
          color: #8B949E !important;
        }

        .ant-pagination-options .ant-select-selector {
          background: #161B22 !important;
          border-color: #30363D !important;
          color: #E6EDF3 !important;
        }

        .ant-pagination-options .ant-select-selection-item {
          color: #E6EDF3 !important;
        }

        .dashboard-card {
        transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        border-color 0.2s ease;
        }

        .dashboard-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
        }
      `}
    </style>
  );


  function renderConteudo() {
    if (tela === "dashboard") {
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
                  boxShadow: "0 2px 0 rgba(245, 158, 11, 0.35)",
                }}
              >
                Atualizar planilhas
              </Button>
            </div>
          </Card>
        </Space>
      );
    }

    if (tela === "pendencias") {
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

    if (tela === "andamento") {
      return (
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%" }}
        >
          <div>
            <Title level={2}>Em andamento</Title>

            <Text type="secondary">
              PEGs que já foram impressos e estão sendo
              coletados.
            </Text>
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

    if (tela === "concluidos") {
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

    return (
      <Space
        direction="vertical"
        size="large"
        style={{
          width: "100%",
        }}
      >
        <div>
          <Title level={2}>Atualizar planilhas</Title>

          <Text type="secondary">
            Reprocessa as planilhas e atualiza os dados do sistema.
          </Text>
        </div>

        <Card
          style={{
            minHeight: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: 18,
            }}
          >

            <div>
              <Text
                strong
                style={{
                  display: "block",
                  fontSize: 20,
                  marginBottom: 6,
                }}
              >
                Atualizar dados
              </Text>

              <Text type="secondary">
                Clique no botão abaixo para reprocessar as planilhas.
              </Text>
            </div>

            <Button
              type="primary"
              icon={<ReloadOutlined />}
              loading={carregando}
              onClick={atualizarPlanilhas}
              size="large"
              style={{
                height: 52,
                paddingLeft: 36,
                paddingRight: 36,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Atualizar planilhas
            </Button>
          </div>
        </Card>
      </Space>
    );
  }

  return (
    <>
      {estilosGlobais}

      <Layout
        style={{
          minHeight: "100vh",
        }}
      >
        <Sider width={240}>
          <div
            style={{
              height: 64,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 20px",
              fontWeight: 700,
              fontSize: 20,
              color: "#FFFFFF",
            }}
          >
            <span style={{ color: cclogThemeColors.primary }}>◈</span>
            LOGO
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[tela]}
            onClick={({ key }) => {
              setTela(key as Tela);
              setMensagem("");
              setErro("");
            }}
            items={[
              {
                key: "dashboard",
                icon: <AppstoreOutlined />,
                label: "Dashboard",
              },
              {
                key: "pendencias",
                icon: <UnorderedListOutlined />,
                label: "Pendências",
              },
              {
                key: "andamento",
                icon: <ClockCircleOutlined />,
                label: "Em andamento",
              },
              {
                key: "concluidos",
                icon: <CheckCircleOutlined />,
                label: "Concluídos",
              },
            ]}
          />

          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 0,
              width: "100%",
              padding: "0 20px",
              boxSizing: "border-box",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: cclogThemeColors.textSecondary,
                marginBottom: 4,
              }}
            >
              
            </div>
          </div>
        </Sider>

        <Layout>
          <Header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
              background: cclogThemeColors.secondary,
              borderBottom: `1px solid ${cclogThemeColors.border}`,
            }}
          >
            <Text strong>
              Sistema de Padronização de Caixas
            </Text>

            <Text type="secondary">
              {dados.length} PEGs cadastrados
            </Text>
          </Header>

          <Content
            style={{
              padding: 24,
            }}
          >
            {mensagem && (
              <Alert
                message={mensagem}
                type="success"
                showIcon
                closable
                onClose={() => setMensagem("")}
                style={{
                  marginBottom: 16,
                }}
              />
            )}

            {erro && (
              <Alert
                message={erro}
                type="error"
                showIcon
                closable
                onClose={() => setErro("")}
                style={{
                  marginBottom: 16,
                }}
              />
            )}

            {renderConteudo()}
          </Content>
        </Layout>
      </Layout>
    </>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <ConfigProvider theme={antdTheme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);