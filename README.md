# AI Health Assistant

This learning project contains a React frontend and an Express API with
registration, login, cookie-based authentication, and informational AI symptom
guidance. The symptom result can suggest broad specialist categories that link
to Google Maps searches for a user-selected city.

## Project layout

- `frontend/` — React 19, Vite, React Router, Tailwind CSS v4, and the welcome screen.
- `backend/src/app.js` — Express configuration and route registration.
- `backend/src/server.js` — environment loading, MongoDB connection, and startup.
- `backend/src/config/db.js` — MongoDB connection using `MONGO_URI`.
- `backend/src/models/User.js` — normalized unique user email and password hash.
- `backend/src/controllers/authController.js` and `backend/src/routes/authRoutes.js` —
  registration, login, current-user, and logout APIs.
- `backend/src/controllers/symptomController.js` and
  `backend/src/routes/symptomRoutes.js` — protected symptom analysis endpoint.
- `backend/src/services/geminiService.js` — server-side Google Gemini integration
  and structured response validation.
- `backend/src/controllers/healthHistoryController.js` and
  `backend/src/controllers/healthProfileController.js` — authenticated,
  user-scoped health history and optional profile endpoints.
- `backend/src/models/HealthHistoryRecord.js` and
  `backend/src/models/HealthProfile.js` — MongoDB storage for consented analysis
  records and optional profile fields.
- `backend/src/routes/healthRoutes.js` — `GET /api/health`.
- `backend/tests/` — backend tests using Node's built-in test runner.

During Vite development, `/api` is proxied to `http://localhost:3000`.

## Local setup

Install dependencies in both folders:

```powershell
Set-Location .\frontend
npm install

Set-Location ..\backend
npm install
Copy-Item .env.example .env
```

Set `MONGO_URI`, `JWT_SECRET`, and `PORT` in `backend/.env`. To enable symptom
analysis, also set `GEMINI_API_KEY`; `GEMINI_MODEL` defaults to
`gemini-3.5-flash-lite` and can be changed to a supported model. Keep real values
local; `.env` files are excluded from Git. The backend requires a working
MongoDB connection before it starts listening.

Start the frontend and backend in separate terminals:

```powershell
Set-Location .\frontend
npm run dev
```

```powershell
Set-Location .\backend
npm run dev
```

The backend health endpoint is `GET http://localhost:3000/api/health` and
returns `{"status":"ok"}`.

Authentication endpoints are `POST /api/auth/register`,
`POST /api/auth/login`, `GET /api/auth/me`, and `POST /api/auth/logout`.
Sessions use a short-lived JWT in an HttpOnly, SameSite=Lax cookie; production
cookies are Secure. The cookie is scoped to `/api` for protected API requests.
Set `JWT_SECRET` to a private random value of at least 32 bytes. Never commit
`.env` files.

`POST /api/symptoms/analyze` requires a signed-in session and accepts `symptoms`
(required), `duration`, `severity`, and `additionalContext`. The response is
general information only, not a diagnosis or treatment plan. Non-emergency
submissions are sent to Google Gemini. Emergency warning patterns are handled
before any Gemini request and are not eligible for health-history saving.
Successful non-emergency results are saved only after the user explicitly
consents. The history stores a short summary and validated analysis result, not
the original symptom description. Avoid submitting names, addresses, or other
identifying information. Emergency symptoms require immediate local emergency
care rather than waiting for analysis.

Health History is available at `GET /api/health-history`, with authenticated
record creation, detail, and deletion endpoints under the same path. Creation
requires the user's consent and a short-lived server-signed receipt for a
successful analysis. Health Profile is available through authenticated
`GET /api/health-profile` and `PUT /api/health-profile` endpoints. Profile fields
are optional and can be cleared; only the signed-in user's records and profile
are returned. Health information is sent with no-store cache headers.

The doctor page requires a signed-in session and constructs Google Maps search
links locally from the validated city and allowlisted specialty categories in
the symptom-analysis result. It does not call a doctor-search API or return
provider listings. Google Maps results, credentials, and availability are not
verified by this app; users should confirm provider details directly.

## Validation

```powershell
Set-Location .\frontend
npm run lint
npm run build

Set-Location ..\backend
npm run check
npm test
```
