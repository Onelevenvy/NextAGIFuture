## 📃 NextAGIFuture
<p align="center">
  <a href="./README.md">English</a> |
  <a href="./README_cn.md">简体中文</a> |
  <a href="./README_docu.md">Getting Started</a>
</p>

A chatbot, RAG, agent, and multi-agent application project based on LangChain, LangGraph, and other frameworks, open-source, and capable of offline deployment.
<video src="https://private-user-images.githubusercontent.com/49232224/365880079-72564225-6675-4eda-b1c6-c87bb3e4bd24.mp4?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MjU5Mzg2MzksIm5iZiI6MTcyNTkzODMzOSwicGF0aCI6Ii80OTIzMjIyNC8zNjU4ODAwNzktNzI1NjQyMjUtNjY3NS00ZWRhLWIxYzYtYzg3YmIzZTRiZDI0Lm1wND9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA5MTAlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwOTEwVDAzMTg1OVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWVlZTVkZmQxY2YxZDRhMWJmYTY1ZmRjNzAxMzAwODJjNjZiMjQxOGRjMTkzZTlkYTA3ZTRiN2M4OWFhYjM2NDYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.E2MtHMi_cgeo6p7LKdIUj-iJt9JHA2li8pVxbI6Wazc" data-canonical-src="https://private-user-images.githubusercontent.com/49232224/365880079-72564225-6675-4eda-b1c6-c87bb3e4bd24.mp4?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MjU5Mzg2MzksIm5iZiI6MTcyNTkzODMzOSwicGF0aCI6Ii80OTIzMjIyNC8zNjU4ODAwNzktNzI1NjQyMjUtNjY3NS00ZWRhLWIxYzYtYzg3YmIzZTRiZDI0Lm1wND9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA5MTAlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwOTEwVDAzMTg1OVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWVlZTVkZmQxY2YxZDRhMWJmYTY1ZmRjNzAxMzAwODJjNjZiMjQxOGRjMTkzZTlkYTA3ZTRiN2M4OWFhYjM2NDYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.E2MtHMi_cgeo6p7LKdIUj-iJt9JHA2li8pVxbI6Wazc" controls="controls" muted="muted" class="d-block rounded-bottom-2 border-top width-fit" style="max-height:640px; min-height: 200px">
 </video>
### 🤖️ Overview
![image](https://github.com/user-attachments/assets/ff3bdc57-4daa-43e2-aaa3-01432caaddc0)
#### work flow
![image](https://github.com/user-attachments/assets/a4e33565-7acf-45d9-8e82-5a740cd88344)
![image](https://github.com/user-attachments/assets/4d5874f1-aeb0-47c5-b907-21878a2fa4d9)
<p>
  <img src="https://github.com/user-attachments/assets/ec53f7de-10cb-4001-897a-2695da9cf6bf" alt="image" style="width: 49%; display: inline-block;">
  <img src="https://github.com/user-attachments/assets/1c7d383d-e6bf-42b8-94ec-9f0c37be19b8" alt="image" style="width: 49%; display: inline-block;">
</p>
<p>
  <strong>Human in the loop (human approval or let the LLM rethink or ask human for help)</strong>  
</p>


NextAGIFuture aims to be an open-source platform for developing large language model (LLM) applications. It is an LLM-based application utilizing the concepts of
LangChain and LangGraph. The goal is to create a suite of LLMOps solutions that supports chatbots, RAG applications, agents, and multi-agent systems, with the capability for offline operation.

Inspired by the [StreetLamb](https://github.com/StreetLamb) project and its [tribe](https://github.com/StreetLamb/tribe) project , NextAGIFuture adopts much of the approach and code.
Building on this foundation, it introduces some new features and directions of its own.

Some of the layout in this project references [Lobe-chat](https://github.com/lobehub/lobe-chat), [Dify](https://github.com/langgenius/dify), and [fastgpt](https://github.com/labring/FastGPT). 
They are all excellent open-source projects, thanks🙇‍.

### 👨‍💻 Development

Project tech stack: LangChain + LangGraph + React + Next.js + Chakra UI + PostgreSQL

### 💡RoadMap

1 APP

- [x] ChatBot
- [x] SimpleRAG
- [x] Hierarchical Agent
- [x] Sequential Agent
- [ ] More muti-agent

2 Model

- [x] OpenAI
- [x] ZhipuAI
- [x] Siliconflow
- [x] Ollama
- [ ] Qwen
- [ ] Xinference

3 Ohters

- [x] Function call
- [x] I18n
- [ ] workflow
- [ ] CrewAI
- [ ] langflow

### 🏘️Highlights

- Persistent conversations: Save and maintain chat histories, allowing you to continue conversations.
- Observability: Monitor and track your agents’ performance and outputs in real-time using LangSmith to ensure they operate efficiently.
- Tool Calling: Enable your agents to utilize external tools and APIs.
- Retrieval Augmented Generation: Enable your agents to reason with your internal knowledge base.
- Human-In-The-Loop: Enable human approval before tool calling.
- Open Source Models: Use open-source LLM models such as llama, Qwen and Glm.
- Multi-Tenancy: Manage and support multiple users and teams.

### How to get started

#### 1.  Preparation
##### 1.1 Clone the Code
git clone https://github.com/Onelevenvy/NextAGIFuture.git
##### 1.2 Copy Environment Configuration File
```bash
cp .env.example .env
```
##### 1.3 Generate Secret Keys
Some environment variables in the .env file have a default value of changethis.
You have to change them with a secret key, to generate secret keys you can run the following command:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
Copy the content and use that as password / secret key. And run that again to generate another secure key.
##### 1.3 安装 postgres，qdrant,redis

```bash
cd nextagi
docker compose up -d
```

#### 2.Run Backend
##### 2.1  Installation of the basic environment
Server startup requires Python 3.10.x. It is recommended to use pyenv for quick installation of the Python environment.

To install additional Python versions, use pyenv install.
```bash
pyenv install 3.10
```

To switch to the "3.10" Python environment, use the following command:
```bash
pyenv global 3.10
```
Follow these steps :
Navigate to the "backen" directory:
```bash
cd backend
```
activate the environment.
```bash
poetry env use 3.10
poetry install
```
##### 2.2 initiral data 

```bash
# Let the DB start
python /app/app/backend_pre_start.py

# Run migrations
alembic upgrade head

# Create initial data in DB
python /app/app/initial_data.py
```
##### 2.3 run unicorn  

```bash
 uvicorn app.main:app --reload --log-level debug
```
##### 2.4 run celery
```bash
poetry run celery -A app.core.celery_app.celery_app worker --loglevel=debug
```

#### 3.Run Frontend
##### 3.1 Enter the web directory and install the dependencies
```bash
cd web
pnpm install
```
##### 3.2 Start the web service
```bash
cd web
pnpm dev

# or pnpm build then pnpm start
```



### Note: 
This project is developed by simultaneously learning and mastering technologies such as LangGraph, FastAPI, and Next.js, while building LLM applications. This approach helps improve our skills and allows us to experience the enjoyment brought by LLMs. The project code may undergo significant changes and may contain bugs. We also hope that like-minded individuals will join us and grow together.
