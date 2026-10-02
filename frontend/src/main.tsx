import React, { useEffect, useMemo, useState } from "react";

import ReactDOM from "react-dom/client";

import {
  Alert,
  App as AntApp,
  Button,
  Card,
  ConfigProvider,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Space,
  Tag,
  Typography,
} from "antd";

import type { ColumnsType } from "antd/es/table";

import type { Peg, Tela } from "./types";

import {
  buscarDados,
  atualizarPlanilhas as atualizarPlanilhasApi,
  iniciarAndamento,
  concluirPeg,
  cancelarAndamento as cancelarAndamentoApi,
  cancelarTodosAndamento as cancelarTodosAndamentoApi,
  voltarParaPendente,
} from "./services/api";

import Dashboard from "./components/Dashboard";
import Pendencias from "./components/Pendencias";
import Andamento from "./components/Andamento";
import Concluidos from "./components/Concluidos";

import {
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import antdTheme, { cclogThemeColors } from "./theme";

import "antd/dist/reset.css";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

function App() {
  const { notification } = AntApp.useApp();
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
    if (mensagem) {
      notification.success({
        message: "Sucesso",
        description: mensagem,
        placement: "bottomRight",
        duration: 5,
      });

      setMensagem("");
    }
  }, [mensagem, notification]);

  useEffect(() => {
    if (erro) {
      notification.error({
        message: "Erro",
        description: erro,
        placement: "bottomRight",
        duration: 5,
      });

      setErro("");
    }
  }, [erro, notification]);


  const [modalVoltarAberto, setModalVoltarAberto] = useState(false);
  const [pegParaVoltar, setPegParaVoltar] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setErro("");

      const resultado = await buscarDados();

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

      const resultado = await atualizarPlanilhasApi();

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

      const resultado = await iniciarAndamento(selecionados);

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

      const resultado = await concluirPeg(peg, quantidade);

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

      const resultado = await cancelarAndamentoApi(peg);

      setDados(resultado.dados);

      setQuantidadesDigitadas((anterior) => {
        const novo = { ...anterior };

        delete novo[peg];

        return novo;
      });

      setMensagem(`PEG ${peg} voltou para pendências.`);
    } catch (erro) {
      console.error(erro);

      setErro(
        erro instanceof Error
          ? erro.message
          : "Erro ao cancelar andamento."
      );
    }
  }

  async function cancelarTodosAndamento() {
    if (andamento.length === 0) {
      setErro("Não há PEGs em andamento para cancelar.");
      return;
    }

    try {
      setCarregando(true);
      setErro("");
      setMensagem("");

      const resultado = await cancelarTodosAndamentoApi();

      setDados(resultado.dados);
      setQuantidadesDigitadas({});

      setMensagem(
        resultado.mensagem ||
          `${resultado.quantidade_cancelada} PEG(s) voltaram para pendências.`
      );
    } catch (erro) {
      console.error(erro);

      setErro(
        erro instanceof Error
          ? erro.message
          : "Erro ao cancelar todos os PEGs."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function handleVoltarParaPendente(peg: string) {
    try {
      setCarregando(true);
      setErro("");
      setMensagem("");

      const resultado = await voltarParaPendente(peg);

      setDados(resultado.dados);

      setMensagem(
        resultado.mensagem ||
          `PEG ${peg} voltou para pendências.`
      );
    } catch (erro) {
      console.error(erro);

      setErro(
        erro instanceof Error
          ? erro.message
          : "Erro ao voltar o PEG para pendências."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarVoltarParaPendente() {
    if (!pegParaVoltar) {
      return;
    }

    const peg = pegParaVoltar;

    await handleVoltarParaPendente(peg);

    setModalVoltarAberto(false);
    setPegParaVoltar(null);
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
          onPressEnter={() =>
            confirmarQuantidadeCaixa(record.peg)
          }
          placeholder="Qtd."
          style={{
            width: "100%",
          }}
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
            boxShadow:
              "0 2px 0 rgba(218, 54, 51, 0.45)",
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

    {
      title: "Ação",
      key: "acao",
      width: 190,

      render: (_, item) => (
        <Button
          type="primary"
          onClick={() => {
            setPegParaVoltar(item.peg);
            setModalVoltarAberto(true);
          }}
          loading={carregando}
          style={{
            fontWeight: 600,
            backgroundColor: "#F59E0B",
            borderColor: "#F59E0B",
            color: "#FFFFFF",
            boxShadow: "0 2px 0 #B76E00",
          }}
        >
          Voltar para pendentes
        </Button>
      ),
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

        .modal-voltar-pendente .ant-modal-content {
          background: #161B22 !important;
          border: 1px solid #30363D !important;
        }

        .modal-voltar-pendente .ant-modal-header {
          background: #161B22 !important;
          border-bottom: 1px solid #30363D !important;
        }

        .modal-voltar-pendente .ant-modal-title {
          color: #E6EDF3 !important;
        }

        .modal-voltar-pendente .ant-modal-body {
          background: #161B22 !important;
          color: #E6EDF3 !important;
        }

        .modal-voltar-pendente .ant-modal-footer {
          background: #161B22 !important;
          border-top: 1px solid #30363D !important;
        }

        .modal-voltar-pendente .ant-modal-close {
          color: #8B949E !important;
        }

        .modal-voltar-pendente .ant-modal-close:hover {
          color: #E6EDF3 !important;
        }
      `}
    </style>
  );

  function renderConteudo() {
    if (tela === "dashboard") {
      return (
        <Dashboard
          dados={dados}
          carregando={carregando}
          atualizarPlanilhas={atualizarPlanilhas}
        />
      );
    }

    if (tela === "pendencias") {
      return (
        <Pendencias
          pendentes={pendentes}
          dadosFiltrados={dadosFiltrados}
          selecionados={selecionados}
          quantidadeSelecionar={quantidadeSelecionar}
          busca={busca}
          carregando={carregando}
          colunasPendencias={colunasPendencias}
          selecionarQuantidade={selecionarQuantidade}
          selecionarTodosVisiveis={selecionarTodosVisiveis}
          limparSelecao={limparSelecao}
          imprimirSelecionados={imprimirSelecionados}
          setQuantidadeSelecionar={setQuantidadeSelecionar}
          setBusca={setBusca}
        />
      );
    }

    if (tela === "andamento") {
      return (
        <Andamento
          andamento={andamento}
          carregando={carregando}
          colunasAndamento={colunasAndamento}
          cancelarTodosAndamento={cancelarTodosAndamento}
        />
      );
    }

    if (tela === "concluidos") {
      return (
        <Concluidos
          concluidos={concluidos}
          colunasConcluidos={colunasConcluidos}
          voltarParaPendente={handleVoltarParaPendente}
        />
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

      <Modal
        open={modalVoltarAberto}
        centered
        title="Voltar PEG para pendentes?"
        className="modal-voltar-pendente"
        onCancel={() => {
          setModalVoltarAberto(false);
          setPegParaVoltar(null);
        }}
        footer={[
          <Button
            key="cancelar"
            onClick={() => {
              setModalVoltarAberto(false);
              setPegParaVoltar(null);
            }}
            style={{
              marginTop: 12,
              backgroundColor: "#DA3633",
              borderColor: "#DA3633",
              color: "#FFFFFF",
              fontWeight: 600,
              boxShadow: "0 2px 0 #8B1E1B",
            }}
          >
            Cancelar
          </Button>,

          <Button
            key="confirmar"
            type="primary"
            loading={carregando}
            onClick={confirmarVoltarParaPendente}
            style={{
              marginTop: 12,
              backgroundColor: "#F59E0B",
              borderColor: "#F59E0B",
              color: "#FFFFFF",
              fontWeight: 600,
              boxShadow: "0 2px 0 #B76E00",
            }}
          >
            Sim, voltar
          </Button>,
        ]}
      >
        <div
          style={{
            color: "#E6EDF3",
            fontSize: 15,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        >
          O PEG{" "}
          <strong
            style={{
              color: "#F59E0B",
              fontSize: 17,
            }}
          >
            {pegParaVoltar}
          </strong>{" "}
          será retirado de concluídos e voltará para a lista de
          pendências.
        </div>
      </Modal>

      <Layout
        style={{
          minHeight: "100vh",
        }}
      >
        <Sider
          width={240}
          style={{
            height: "100vh",
            position: "sticky",
            top: 0,
            left: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
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
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: cclogThemeColors.primary,
                }}
              >
                ◈
              </span>

              CCLOG
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
              className="sidebar-footer"
              style={{
                marginTop: "auto",
                padding: "20px",
                fontSize: 12,
                color: "#8B949E",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              © Posigraf 2026. Todos os direitos reservados.
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
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>
);
