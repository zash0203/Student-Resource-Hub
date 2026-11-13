# Study Hub

Study Hub is a single Next.js project with a MongoDB-backed API. The website and API can be deployed together to Vercel; MongoDB Atlas stores the data. The App Router pages, API routes, Mongoose models, and database seeder all live in this project.

## Run locally

Use Node.js 20.9 or newer and npm.

1. Create a root-level `.env.local` file with your MongoDB connection string:

   ```text
   MONGODB_URI=mongodb+srv://...
   ```

   Keep this file private; it is ignored by Git.
2. From the repository root, install dependencies and start Next.js:

   ```powershell
   npm install
   npm run dev
   ```
3. Open <http://localhost:3000>.

The app can start without `MONGODB_URI`, but the data endpoints return `503` until a database is configured.
To load the starter categories and resources into MongoDB, run `npm run seed` from the repository root after configuring `.env.local`.

## API

All API routes are served by Next.js from the same origin:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | App and database status |
| GET | `/api/categories` | List categories with resource counts |
| GET | `/api/categories/:id` | Get a category |
| POST | `/api/categories` | Create a category |
| PUT | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete an empty category |
| GET | `/api/resources` | List resources; optionally filter with `?category=courses` or `?q=LeetCode` |
| GET | `/api/resources/:id` | Get a resource |
| POST | `/api/resources` | Create a resource |
| PUT | `/api/resources/:id` | Update a resource |
| DELETE | `/api/resources/:id` | Delete a resource |

## Deploy for free

1. Create a MongoDB Atlas **Free** cluster and copy its connection string.
2. Import this repository into Vercel. Use the repository root as the project root.
3. In Vercel project settings, add `MONGODB_URI` with the Atlas connection string, then deploy.
4. Open `https://YOUR-VERCEL-DOMAIN/api/health` and confirm it reports `"database":"connected"`.

The frontend calls `/api` on the same Vercel deployment, so there is no separate backend service or frontend URL setting.
