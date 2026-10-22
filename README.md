# NoteHub — AI-Powered Academic Notes Sharing & Student Recognition Platform

NoteHub lets students upload academic notes, have them checked by an AI pipeline
(quality, relevance, duplicates), discover and rate other students' notes, and earn
**non-monetary points → badges → leaderboard rank → recognition**.

There is **one user type** (student), **no admin dashboard**, and **no money/payments**
anywhere in the app.

---

## 1. Features implemented

- **Auth**: signup, login, JWT-based sessions, forgot/reset password, protected routes
- **Upload**: PDF/JPG/JPEG/PNG, full metadata form, mandatory originality declaration
- **AI pipeline** (`services/aiService.js`):
  - `MockAIProvider` — works out of the box, no API key needed, clearly labelled as a demo/heuristic provider
  - `RealAIProvider` — optional, swaps in a real AI model call if you add an API key
  - Academic-content check, quality scoring, subject/keyword detection
  - **Exact duplicate detection** via SHA-256 file hashing
  - **Near-duplicate detection** via keyword/tag similarity against other published notes
- **Notes Library**: search (title/subject/topic/tags), filters (subject/semester/branch/college/rating/AI-verified), sorting (newest/most downloaded/top rated/most viewed)
- **Note Details**: metadata, AI status, ratings, reviews, access/download, report
- **Ratings & Reviews**: 1–5 stars + text, one review per user/note, must access note first, cannot review own note
- **Points engine** (`services/pointsService.js`): configurable point values, database-enforced anti-duplicate-award protection
- **Badge engine** (`services/badgeService.js`): 5 badges, auto-checked after every point award
- **Leaderboard**: overall + monthly (contribution-based, not just upload count)
- **Recognition page**: featured contributors, monthly recognition
- **Dashboard**: uploads, views/downloads, points, rank, badges, recent activity
- **My Notes / My Downloads / Notifications / Reports**
- **Security**: bcrypt password hashing, JWT auth, ownership checks on every edit/delete, file-type/size validation, rate limiting, all secrets in `.env`

---

## 2. Technology stack

| Layer     | Technology                         |
|-----------|-------------------------------------|
| Frontend  | React + Vite + Tailwind CSS + React Router |
| Backend   | Node.js + Express                  |
| Database  | MongoDB + Mongoose                 |
| Auth      | JWT + bcrypt                       |
| File storage | Local disk (dev) via Multer, abstracted so it's easy to swap for cloud storage later |
| AI        | Pluggable `AIService` — Mock provider by default, real provider optional |

---

## 3. Folder structure

```
NoteHub/
├── backend/
│   ├── config/db.js
│   ├── models/            # User, Note, Review, NoteAccess, PointTransaction,
│   │                       # PointRule, Badge (embedded in User), Notification, Report
│   ├── middleware/         # auth, upload (multer), errorHandler
│   ├── services/           # aiService, pointsService, badgeService, notificationService
│   ├── controllers/
│   ├── routes/
│   ├── utils/
│   ├── uploads/            # uploaded files live here in development
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   ├── pages/
    │   ├── App.jsx
    │   └── main.jsx
    └── .env.example
```

---

## 4. Installation (local setup, step by step)

### 4.1 Install required software (if you haven't already)

- **Node.js** (v18+): https://nodejs.org — verify with `node --version`
- **Git** (optional but recommended): https://git-scm.com
- **VS Code**: https://code.visualstudio.com
- A **MongoDB Atlas** account (free tier is enough): https://www.mongodb.com/cloud/atlas/register

### 4.2 Get a MongoDB connection string (MongoDB Atlas)

1. Go to https://cloud.mongodb.com and create a free account.
2. Click **"Build a Database"** → choose the **free (M0) shared cluster**.
3. Under **Database Access**, create a database user with a username and password (save these — you'll need them).
4. Under **Network Access**, click **"Add IP Address"** → choose **"Allow access from anywhere"** (0.0.0.0/0) for local development.
5. Go back to your cluster → click **"Connect"** → **"Drivers"** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your real values, and add a database name before the `?`, e.g.:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/notehub?retryWrites=true&w=majority
   ```

### 4.3 Backend setup

Open a terminal in the `backend/` folder:

```bash
cd NoteHub/backend
npm install
```

Copy the example environment file and edit it:

```bash
cp .env.example .env
```

Open `backend/.env` in VS Code and fill in:

```env
MONGODB_URI=<paste your Atlas connection string here>
JWT_SECRET=<a long random string>
PORT=5000
CLIENT_URL=http://localhost:5173
AI_PROVIDER=mock
AI_API_KEY=
```

> To generate a random `JWT_SECRET`, run:
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Then seed the default point values and start the server:

```bash
npm run seed
npm run dev
```

**Expected result:** you should see:
```
✅ MongoDB connected
🚀 NoteHub backend running at http://localhost:5000
```

Test it works by opening http://localhost:5000/api/health in your browser — you should see `{"status":"ok", ...}`.

### 4.4 Frontend setup

Open a **second terminal** in the `frontend/` folder:

```bash
cd NoteHub/frontend
npm install
npm run dev
```

**Expected result:** Vite will print a local URL, usually `http://localhost:5173`. Open it in your browser — you should see the NoteHub home page.

---

## 5. Environment variables reference

### backend/.env
| Variable | Meaning |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Random secret used to sign login tokens |
| `PORT` | Port the backend listens on (default 5000) |
| `CLIENT_URL` | Your frontend's URL, used for CORS |
| `AI_PROVIDER` | `mock` (default, no key needed) or `openai` (real AI) |
| `AI_API_KEY` | Only needed if `AI_PROVIDER=openai` |

### frontend/.env
| Variable | Meaning |
|---|---|
| `VITE_API_URL` | Where the frontend sends API requests (default `http://localhost:5000/api`) |

**Never commit your real `.env` file to Git** — only `.env.example` should be committed.

---

## 6. About the AI system (Mock vs Real)

By default, `AI_PROVIDER=mock` — NoteHub uses a **clearly-labelled demo/heuristic AI provider**
(`MockAIProvider` in `backend/services/aiService.js`). It scores notes using explainable,
deterministic rules (description length, tags, file size, subject-keyword matching) so the
whole app works immediately with zero setup and zero cost.

If you want to plug in a real AI model later:
1. Set `AI_PROVIDER=openai` and `AI_API_KEY=<your key>` in `backend/.env`.
2. The `RealAIProvider` in `aiService.js` will then be used instead — it sends the note's
   metadata to a real AI model and parses a structured JSON verdict.
3. The rest of the app (points, badges, publish/needs-improvement logic) doesn't change at all —
   this is the point of the `AIService` abstraction.

---

## 7. API overview (backend routes, prefixed with `/api`)

| Method | Route | Purpose |
|---|---|---|
| POST | `/auth/signup` | Create account |
| POST | `/auth/login` | Log in |
| GET | `/auth/me` | Current user (requires token) |
| POST | `/auth/forgot-password` / `/auth/reset-password` | Password reset |
| GET | `/notes` | Search/filter/sort published notes |
| POST | `/notes` | Upload a note (multipart form + file) |
| GET | `/notes/:id` | Note details |
| GET | `/notes/:id/access` | Download a note (records access, increments downloads) |
| PUT | `/notes/:id` | Edit your own note |
| POST | `/notes/:id/unpublish` / DELETE `/notes/:id` | Unpublish / delete your own note |
| POST | `/notes/:id/reviews` | Rate/review a note (must have accessed it) |
| POST | `/notes/:id/report` | Report a note |
| GET | `/notes/mine/list` / `/notes/mine/downloads` | My Notes / My Downloads |
| GET | `/leaderboard/overall` / `/leaderboard/monthly` | Leaderboard |
| GET | `/dashboard` | Dashboard stats |
| GET | `/notifications` | Notifications |

---

## 8. Testing the app as a real student

1. Sign up → log in.
2. Go to **Upload**, fill the form, attach a PDF/JPG/PNG, accept the declaration, submit.
3. Watch the AI result — published / needs improvement / rejected, with reasons & suggestions.
4. Go to **Browse Notes**, search/filter, open a note, click **Access/Download**.
5. Rate & review it (only works after you've downloaded it, and not on your own notes).
6. Check **Dashboard** — points, rank, and recent activity should update.
7. Check **Badges** and **Leaderboard** — badges unlock automatically as you meet criteria.
8. Try editing/deleting another account's note directly via the API — it should be blocked with a 403.

---

## 9. Deployment (beginner-friendly options)

A simple, free-tier-friendly setup:
- **Frontend** → deploy the `frontend/` folder to **Vercel** or **Netlify** (both auto-detect Vite).
- **Backend** → deploy the `backend/` folder to **Render** (free web service tier) or **Railway**.
- **Database** → you're already using **MongoDB Atlas**, so no change needed — just make sure Atlas's Network Access allows your backend host's IP (or 0.0.0.0/0).

General steps:
1. Push the project to a GitHub repository.
2. On Render/Railway: create a new Web Service pointing at `backend/`, set the **Start Command** to `npm start`, and add all the `backend/.env` variables in their dashboard's environment variables section (never commit `.env`).
3. On Vercel/Netlify: import the same repo, set the **root directory** to `frontend/`, build command `npm run build`, output directory `dist`. Add `VITE_API_URL` pointing to your deployed backend's URL (e.g. `https://your-backend.onrender.com/api`).
4. Update `CLIENT_URL` in your backend's environment variables to your deployed frontend URL (for CORS).
5. Redeploy both, then test the full flow again on the live URLs.

Note: local file storage (`backend/uploads/`) does **not** persist across redeploys on most free hosts. For a production deployment you'd swap `FileService` for a cloud storage provider (e.g. S3, Cloudinary) — the codebase already isolates file handling in `middleware/upload.js` and the `fileName`/`fileType` fields on the `Note` model, so this swap doesn't require restructuring anything else.

---

## 10. If something breaks

- **"MONGODB_URI is missing"** → you haven't created/filled `backend/.env`. See section 4.3.
- **"MongoDB connection failed"** → check your Atlas username/password and that Network Access allows your IP.
- **CORS error in browser console** → make sure `CLIENT_URL` in `backend/.env` exactly matches the URL your frontend is running on.
- **File upload fails** → check the file is PDF/JPG/JPEG/PNG and under 20MB.
- For anything else: copy the exact error message and the file/line it points to — that's the fastest way to debug it.
