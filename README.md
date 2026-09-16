# NewsShield

NewsShield is a full-stack news-claim verification application. A user submits a headline or claim, the backend gathers recent web evidence with Tavily, and Groq AI produces an evidence-based assessment with a verdict, confidence score, explanation, and source links.

> **Important:** NewsShield is an assistive verification tool, not an absolute source of truth. AI results can be wrong when evidence is incomplete, outdated, satirical, misleading, or contradictory. Always open and evaluate the referenced sources yourself.

## Features

- Search recent news evidence for a claim
- AI-assisted classification as `Real`, `Fake`, or `Unverified`
- Confidence, supporting, and contradicting scores
- Linked source results for further reading
- User registration and login with hashed passwords
- Protected dashboard and verification-history pages
- Expandable history records and delete controls
- Responsive React interface with mobile navigation

## How it works

```text
User claim
	|
	v
Express API (/api/verify)
	|
	+--> Tavily news search
	|       |
	|       +--> Recent source titles, URLs, content, and relevance scores
	|
	+--> Groq AI analysis of the retrieved evidence
			|
			+--> Verdict, reason, confidence, and evidence scores
					|
					+--> React result card
					+--> MongoDB verification history for signed-in users
```

## Technology

| Area | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, Tailwind CSS, Lucide React |
| Backend | Node.js, Express 5, Axios |
| Database | MongoDB with Mongoose |
| Authentication | JWT and bcryptjs |
| News search | Tavily Search API |
| AI analysis | Groq Chat Completions API |

## Repository structure

```text
NewsShield-final/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Verification.js
│   ├── server.js
│   ├── package.json
│   └── .env                 # Local only, never commit
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Requirements

- Node.js 18 or later
- npm
- MongoDB running locally or a MongoDB connection string
- A Tavily API key
- A Groq API key

## Installation

Clone the repository and install each application independently:

```bash
git clone https://github.com/iillimitable/News-Shield-.git
cd News-Shield-

cd backend
npm install

cd ../frontend
npm install
```

## Environment configuration

Create a file named `backend/.env` with your own values:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/newsshield
JWT_SECRET=replace_with_a_long_random_secret
TAVILY_API_KEY=your_tavily_api_key
GROQ_API_KEY=your_groq_api_key
```

The frontend currently calls the backend at `http://localhost:5001`, so keep `PORT=5001` for the default local setup. Never commit `.env`, API keys, database credentials, or generated dependency folders.

## Run the application

Start MongoDB first, then open two terminals.

**Terminal 1: backend**

```bash
cd backend
node server.js
```

The API runs at `http://localhost:5001`.

**Terminal 2: frontend**

```bash
cd frontend
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Available frontend routes

| Route | Purpose | Access |
| --- | --- | --- |
| `/` | Landing page and product overview | Public |
| `/login` | Sign in | Public |
| `/register` | Create an account | Public |
| `/dashboard` | Submit and verify a news claim | Signed in |
| `/history` | Review or delete saved verifications | Signed in |

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | Backend health response |
| `POST` | `/api/auth/register` | Create a user account |
| `POST` | `/api/auth/login` | Authenticate a user |
| `POST` | `/api/search` | Search Tavily for news sources |
| `POST` | `/api/verify` | Search sources and request an AI assessment |
| `POST` | `/api/history` | Save a verification record |
| `GET` | `/api/history/:userId` | Load a user's verification history |
| `DELETE` | `/api/history/:id` | Delete a verification record |

## Useful scripts

From `frontend/`:

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build
npm run preview   # Preview the production build locally
npm run lint      # Run Oxlint
```

From `backend/`:

```bash
node server.js    # Start the Express API
npm test          # Placeholder script; automated tests are not configured yet
```

## Security and production notes

This repository is configured for local development. Before deploying it publicly, address the following:

- Require `JWT_SECRET` instead of relying on a fallback secret.
- Enforce JWT authentication and record ownership in backend history routes; frontend route protection alone is not sufficient.
- Add rate limiting and request-size limits around paid Tavily and Groq operations.
- Validate AI output strictly and fall back to `Unverified` for invalid verdicts or scores.
- Treat retrieved article text as untrusted input and defend against prompt injection.
- Move the frontend API URL into environment configuration instead of hardcoding localhost.
- Use secure, production-appropriate token storage and HTTPS.
- Rotate any API key that has been exposed and remove secrets from Git history if necessary.

## License

No license has been specified for this project yet. Add a license file before distributing or reusing the code publicly.
