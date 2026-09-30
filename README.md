# Box Standardization System

![Python](https://img.shields.io/badge/Python-3.x-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-API-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-TS-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite)
![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)

Web application developed to support and optimize the box standardization and printing process in a business environment.

The system centralizes spreadsheet processing, identifies pending and completed items, records box quantities, and applies validation rules to help prevent duplicate records during the printing workflow.

> **Note:** This repository is intended for portfolio and technical demonstration purposes. Company data, files, identifiers, and internal information have been omitted or replaced with fictional data.

---

## Overview

The Box Standardization System was created to reduce manual work involved in processing spreadsheet data and tracking the progress of a box standardization process.

The application combines a React and TypeScript frontend with a Python and FastAPI backend. Spreadsheet data is processed using Pandas and OpenPyXL before being presented through the web interface.

The system provides a centralized workflow for:

* Importing spreadsheet data
* Processing and validating records
* Identifying pending items
* Tracking completed items
* Recording the quantity of boxes
* Monitoring process progress
* Reducing duplicate PEG records
* Supporting the printing workflow

---

## Features

* Dashboard for process monitoring
* Excel spreadsheet import and processing
* Pending item identification
* Completed item tracking
* Box quantity registration
* Printing workflow
* PEG duplication prevention
* Data filtering and validation
* Completion percentage indicator
* Processed data updates
* Separation between pending and completed records

---

## Screenshots

Screenshots can be added to this section as the project interface evolves.

### Dashboard

*Add screenshot here.*

### Pending Items

*Add screenshot here.*

### Completed Items

*Add screenshot here.*

---

## Architecture

The application follows a frontend/backend architecture.

┌──────────────────────────┐
│        React UI          │
│    TypeScript / TSX      │
└────────────┬─────────────┘
             │
             │ HTTP Request
             ▼
┌──────────────────────────┐
│        FastAPI           │
│       Python API         │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Pandas / OpenPyXL / re   │
│ Data Processing &        │
│ Validation               │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Excel / JSON Data        │
└──────────────────────────┘

The frontend is responsible for the user interface and interaction with the system, while the backend handles spreadsheet processing, validation, and data management.

---

## Application Flow

Excel Spreadsheet
        │
        ▼
      Upload
        │
        ▼
      FastAPI
        │
        ▼
 Data Processing
        │
        ▼
 Validation & Filtering
        │
   ┌────┴────┐
   ▼         ▼
Pending   Completed
Items       Items
   │         │
   └────┬────┘
        ▼
    Dashboard
        │
        ▼
     Printing

---

## Technologies

### Frontend

* React
* TypeScript
* TSX
* Vite
* HTML5
* CSS

### Backend

* Python
* FastAPI
* Pandas
* OpenPyXL
* Regular Expressions

### Data

* Microsoft Excel (`.xlsx`)
* JSON

### Development Tools

* Git
* GitHub
* Visual Studio Code

---

## Project Structure

box-standardization-system/
│
├── backend/
│   ├── main.py
│   ├── concluidos.json
│   ├── estado.json
│   ├── estoque.xlsx
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── styles.css
│   │   └── theme.ts
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vite-env.d.ts
│
├── planilhas/
│   ├── estoque.xlsx
│   └── levantamento.xlsx
│
├── .gitignore
├── README.md
├── package.json
└── package-lock.json

---

## Spreadsheet Processing

The application processes spreadsheet data using predefined columns.

| Information | Column |
| ----------- | ------ |
| Location    | D      |
| PEG         | H      |
| Description | K      |

After the spreadsheet is uploaded, the backend processes the information and applies the required filtering and validation rules before returning the data to the frontend.

The processing workflow is designed to separate records that still require action from those that have already been completed.

---

## API

The main endpoint used by the frontend is:

POST /processar-planilha

This endpoint receives an uploaded spreadsheet and processes its contents using the backend data-processing pipeline.

The backend is powered by FastAPI and can also be accessed through its automatically generated API documentation when running in development mode.

http://127.0.0.1:8000/docs

---

## Duplicate Prevention

One of the main objectives of the system is to prevent the same PEG from being processed or printed more than once.

During the workflow, previously processed records are considered when generating the pending list.

This helps prevent duplicate entries from being displayed as pending and provides greater consistency during the printing process.

The validation layer also allows the system to apply filtering rules before the information reaches the frontend.

---

## Getting Started

### Prerequisites

Before running the project, make sure you have installed:

* Python
* Node.js
* npm
* Git

---

### Backend Setup

Navigate to the backend directory:

cd backend

Create a Python virtual environment:

python -m venv venv

On Windows, activate the virtual environment:

venv\Scripts\activate

Install the required dependencies:

pip install -r requirements.txt

Start the development server:

python -m uvicorn main:app --reload

The backend will be available at:

http://127.0.0.1:8000

FastAPI documentation:

http://127.0.0.1:8000/docs

---

### Frontend Setup

Open another terminal and navigate to the frontend directory:

cd frontend

Install the dependencies:

npm install

Start the development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173


---

## Data and Security

The version available in this repository has been prepared for portfolio and technical demonstration purposes.

Real company information should not be included in a public repository.

The following types of information should remain private:

* Real company spreadsheets
* Real PEG identifiers
* Real product descriptions
* Inventory information
* Employee data
* Internal server paths
* Credentials
* Authentication tokens
* Confidential documents

The repository uses fictional or generic data for demonstration purposes.

Sensitive configuration values should be stored using environment variables rather than being committed directly to the repository.

---

## Future Improvements

Possible improvements for future versions include:

* Database integration
* User authentication and authorization
* More advanced reporting
* Improved spreadsheet validation
* Detailed process history
* Search and filtering improvements
* Exportable reports
* Automated deployment
* Automated testing
* Expanded API functionality
* Improved responsive design

---

## Project Status

**In development**

The current version provides the core workflow for spreadsheet processing, pending and completed item tracking, validation, and printing support.

The project may receive additional features, interface improvements, validations, and infrastructure changes in future versions.

---

## Project Goals

The main goals of the project are to:

* Reduce repetitive manual activities
* Centralize process information
* Simplify pending item tracking
* Reduce duplicate processing
* Improve process visibility
* Make spreadsheet-based workflows easier to manage
* Provide a foundation for future automation

---

## Author

**Vinicius**

Full Stack Developer

GitHub:
https://github.com/iflxz

LinkedIn:
https://www.linkedin.com/in/vinicius-eduardo-medeiros

---

## License

This project is intended for portfolio and educational purposes.

The data included in the repository is fictional and does not represent real company information.
