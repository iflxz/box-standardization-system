\# Box Standardization System



Web application developed to support and optimize the box standardization and printing process in a business environment.



The application centralizes the processing of information from Excel spreadsheets, allowing users to track pending and completed items, record the number of boxes, and reduce the possibility of duplicate records during the printing process.



> \*\*Note:\*\* This repository is intended for portfolio and technical demonstration purposes. Company data, files, identifiers, and internal information have been omitted or replaced with fictional data.



\---



\## Features



\* Dashboard for process monitoring

\* Excel spreadsheet import and processing

\* Pending item identification

\* Completed item tracking

\* Box quantity registration

\* Printing workflow

\* PEG duplication prevention

\* Data filtering and validation

\* Completion percentage indicator

\* Processed data updates



\---



\## Technologies



\### Frontend



\* React

\* TypeScript / TSX

\* Vite

\* HTML5

\* CSS



\### Backend



\* Python

\* FastAPI

\* Pandas

\* Regular Expressions



\### Data



\* Microsoft Excel (`.xlsx`)



\### Tools



\* Git

\* GitHub

\* Visual Studio Code



\---



\## Project Structure



box-standardization-system/

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



\## Backend



The backend is responsible for receiving spreadsheets, processing the data, and providing the API used by the frontend.



\### Installation



Navigate to the backend directory:



cd backend



Create a virtual environment:



python -m venv venv



On Windows, activate the virtual environment:



venv\\Scripts\\activate



Install the dependencies:



pip install -r requirements.txt



Start the development server:



python -m uvicorn main:app --reload



The backend will be available at:



http://127.0.0.1:8000



\---



\## Frontend



The frontend was developed using React, TypeScript, and Vite.



Navigate to the frontend directory:



cd frontend



Install the dependencies:



npm install



Start the development server:



npm run

