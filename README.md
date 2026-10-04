# Study Hub

The project is split into two independent apps:

- `front end/` — React + Vite student resource directory
- `backend/` — Express API with resource/category routes and MongoDB models ready for later

The Express server and React frontend can run now. MongoDB is intentionally not configured yet; resource and category API requests return `503` until a database is connected.

## Run locally

Use Node.js 20 or newer and npm. Open two terminals in the project folder.

**Terminal 1 — backend**

```powershell
cd backend
npm install
npm run dev
```

The API starts at <http://localhost:5000>. Check <http://localhost:5000/api/health> for its status.

**Terminal 2 — frontend**

```powershell
cd "front end"
npm install
npm run dev
```

Open the local URL printed by Vite (usually <http://localhost:5173>).

## API

All endpoints are under `/api`. The health endpoint is available before MongoDB is configured; data endpoints return `503` until connected.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | API and database configuration status |
| GET | `/api/categories` | List categories with resource counts |
| GET | `/api/categories/:id` | Get a category |
| POST | `/api/categories` | Create a category (`name`, `slug`, optional `description`, `emoji`) |
| PUT | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete an empty category |
| GET | `/api/resources` | List resources; optionally filter with `?category=courses` or `?q=LeetCode` |
| GET | `/api/resources/:id` | Get a resource |
| POST | `/api/resources` | Create a resource (`name`, HTTP(S) `url`, `category` id, optional `description`, `tag`) |
| PUT | `/api/resources/:id` | Update a resource |
| DELETE | `/api/resources/:id` | Delete a resource |

## Remaining for database-backed data

1. Choose a MongoDB host (local MongoDB or MongoDB Atlas).
2. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`.
3. Restart the backend and run `npm run seed` from `backend/` to load the starter categories/resources.
4. Verify `/api/health` reports `"database":"connected"` and test the data endpoints.

Never commit `backend/.env` or put database credentials in source control.
