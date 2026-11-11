# CareFlow AI

CareFlow AI is an AI-assisted patient enquiry management platform designed to help healthcare teams organize incoming patient messages, review AI-generated analysis, and prepare responses from one dashboard.

## Features

- **Dashboard:** View enquiry activity and workflow summaries.
- **Patient Enquiry Management:** Create, view, update, and manage patient enquiries.
- **AI-Powered Analysis:** Use Google Gemini to analyze enquiry messages and generate suggested response drafts.
- **Response Review:** Allow staff to review and approve AI-generated drafts.
- **AI Chatbot:** Send questions through the in-app chatbot.
- **Authentication:** User registration and login with password hashing and JWT token generation.
- **Email Notifications:** Send an email during the registration flow.

> AI-generated content is intended to assist staff. It should be reviewed by an authorized healthcare team member before being sent to a patient. CareFlow AI is an administrative support tool, not a diagnostic system.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| UI and Icons | Bootstrap, CSS, Lucide React |
| 3D Visuals | Three.js, React Three Fiber, Drei |
| HTTP Client | Axios |
| Backend | Java 21, Spring Boot |
| Data Access | Spring Data JPA, Hibernate |
| Database | MySQL |
| Authentication | Spring Security, JWT |
| AI Integration | Google Gemini API |
| Email | Spring Boot Mail |
| Build Tool | Maven |

## Project Structure

```text
CareFlow-AI/
├── backend/
│   ├── src/
│   │   └── main/
│   ├── pom.xml
│   └── mvnw.cmd
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
└── .gitignore
```

## Prerequisites

Install the following before running the application:

- Java Development Kit (JDK) 21
- Node.js and npm
- MySQL Server
- Git

You will also need a Google Gemini API key and the credentials/settings required by your chosen email provider.

## Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/suha0/CareFlow-AI.git
cd CareFlow-AI
```

### 2. Configure the Database and Backend

1. Start MySQL and create a database for CareFlow AI.
2. In `backend/src/main/resources/`, create your local `application.properties` file.
3. Add the database connection, JPA, Gemini API, JWT, and email settings required by the backend.
4. Supply your own credentials and API keys through local configuration or environment variables.

The local `application.properties` file is intentionally excluded from Git. Never commit database passwords, email credentials, JWT secrets, or API keys.

### 3. Start the Backend

Open a terminal in the `backend` directory.

**Windows PowerShell:**

```powershell
.\mvnw.cmd spring-boot:run
```

The backend is configured to run at:

```text
http://localhost:8080
```

### 4. Start the Frontend

Open another terminal in the `frontend` directory:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal (typically):

```text
http://localhost:5173
```

Keep both the backend and frontend terminals running while using the application.

## Main API Routes

The backend exposes REST endpoints under `/api`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in a user |
| GET / POST / PATCH / DELETE | `/api/enquiries` | Manage patient enquiries |
| POST | `/api/ai/analyze` | Analyze an enquiry with AI |
| POST | `/api/chatbot/message` | Send a message to the chatbot |

Some enquiry operations use additional path parameters or request bodies.

## Frontend Scripts

Run these commands from the `frontend` directory:

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Security Notes

- Keep API keys, passwords, mail credentials, and JWT secrets private.
- Use a strong, unique JWT signing secret in local configuration.
- Do not commit `application.properties` or real environment files.
- Review AI-generated content before using it in patient communication.
- Configure and verify authentication and authorization policies before deploying the application for real users or handling real patient information.

## Project Status

CareFlow AI is an ongoing project. Features and setup details may evolve as development continues.
