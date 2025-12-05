# Flight-Management-System

Tech Stack:
- Python3
- FastAPI
- MySQL
- MySQL-Python Connector
- React.js


## Backend Setup Instruction
1) Create virtual environment (to avoid dependency issues)
python3 -m venv venv
source venv/bin/activate # Mac

2) Install the required dependencies
pip install -r requirements.txt
(also pip install whatever else is necessary if it comes up)

3) Create a .env (NEVER COMMIT THIS .env FILE BACK TO GITHUB, ITS A SECURITY ISSUE)
cp .env.example .env
(edit .env with your own MySQL password)

4) Create the database locally
mysql -u root -p < schema.sql

5) Run the backend
navigate to where backend is stored in your terminal
uvicorn main:app --reload

## Frontend Setup Instruction
1) Run the frontend
navigate to where the frontend is stored in your terminal
npm start

