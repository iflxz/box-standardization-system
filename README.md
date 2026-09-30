# Sistema de Padronização de Caixas

Sistema web desenvolvido para apoiar e otimizar o processo de
padronização e impressão de caixas em um ambiente empresarial.

A aplicação centraliza o processamento das informações provenientes de
planilhas Excel, permitindo acompanhar itens pendentes e concluídos,
registrar a quantidade de caixas e reduzir a possibilidade de
duplicidade durante o processo de impressão.

> \*\*Nota:\*\* Este repositório é destinado a portfólio e demonstração
> técnica. Dados, arquivos, identificadores e informações internas da
> empresa foram omitidos ou substituídos por dados fictícios.

\---

## Funcionalidades

* Dashboard para acompanhamento do processo
* Importação e processamento de planilhas Excel
* Identificação de itens pendentes
* Controle de itens concluídos
* Registro da quantidade de caixas
* Fluxo de impressão
* Prevenção de duplicidade de PEGs
* Filtragem e validação dos dados
* Indicador percentual de conclusão
* Atualização dos dados processados

\---

## Tecnologias utilizadas

### Frontend

* React
* TypeScript / TSX
* Vite
* HTML5
* CSS

### Backend

* Python
* FastAPI
* Pandas
* Regular Expressions

### Dados

* Microsoft Excel (`.xlsx`)

### Ferramentas

* Git
* GitHub
* Visual Studio Code

\---

## Estrutura do projeto


Sistema-Padronizacao-Caixas/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   └── ...
│   │
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md


\---

## Backend

O backend é responsável pelo recebimento das planilhas, processamento
dos dados e disponibilização da API utilizada pelo frontend.

### Instalação



Entre na pasta do backend:



bash
cd backend



Crie um ambiente virtual:



bash
python -m venv venv


No Windows, ative o ambiente:



powershell
venv\\Scripts\\activate


Instale as dependências:



bash
pip install -r requirements.txt


Execute o servidor:



bash
python -m uvicorn main:app --reload


O backend estará disponível em:



text
http://127.0.0.1:8000


\---

## Frontend

O frontend foi desenvolvido utilizando React, TypeScript e Vite.



Entre na pasta:



bash
cd frontend


Instale as dependências:



bash
npm install


Execute o projeto:



bash
npm run dev


O frontend estará disponível normalmente em:


http://localhost:5173


\---

## Processamento da planilha

A aplicação utiliza informações específicas da planilha para realizar o
processamento.

Informação    Coluna

\---

Localização   D
PEG           H
Descrição     K

Após o upload, os dados são processados e filtrados pelo backend antes
de serem disponibilizados para a interface.

Os critérios de filtragem e validação são aplicados de acordo com as
regras definidas para o processo.

\---

## Fluxo da aplicação


Planilha Excel
      |
      v
    Upload
      |
      v
    FastAPI
      |
      v
    Pandas
      |
      v
Processamento e validação
      |
      +-------------------+
      |                   |
      v                   v
 Pendências          Concluídos
      |                   |
      +---------+---------+
                |
                v
            Dashboard
                |
                v
             Impressão


\---

## API

Endpoint principal utilizado pelo frontend:


POST /processar-planilha


O endpoint recebe a planilha enviada pelo usuário e realiza o
processamento necessário para disponibilizar os dados para a aplicação.

\---

## Controle de duplicidade

Um dos principais objetivos do sistema é evitar que um mesmo PEG seja
processado ou impresso mais de uma vez.

Durante o fluxo de trabalho, os registros já processados são
considerados para impedir sua duplicação na lista de pendências e no
processo de impressão.

Essa validação contribui para maior controle e consistência das
informações utilizadas no processo.

\---

## Dados e segurança

A versão disponibilizada neste repositório foi preparada para fins de
portfólio e demonstração técnica.

Não devem ser incluídos no repositório:

* Planilhas reais da empresa
* PEGs reais
* Descrições reais de produtos
* Informações de estoque
* Dados de funcionários
* Caminhos de servidores internos
* Credenciais ou tokens
* Arquivos ou documentos confidenciais

Arquivos de dados locais e informações sensíveis devem ser protegidos
por meio do `.gitignore` e, quando necessário, de variáveis de ambiente.

\---

## Status do projeto

Em desenvolvimento.

O projeto pode receber novas funcionalidades, melhorias de interface,
validações adicionais e futuras integrações com banco de dados.

\---

## Objetivos do projeto

* Reduzir atividades manuais no processo
* Centralizar informações em uma aplicação web
* Facilitar o acompanhamento das pendências
* Reduzir erros relacionados à duplicidade
* Melhorar a visualização do andamento do processo
* Criar uma base para futuras automações

\---

## Autor

**Vinicius**

FullStack Developer

[GitHub](https://github.com/iflxz)  
[LinkedIn](https://www.linkedin.com/in/vinicius-eduardo-medeiros)

