# Deploy TribeTalk

## Local Docker environment

Install Docker Desktop, then run:

```bash
docker compose up --build
```

Open `http://localhost:5173`. The API is available at `http://localhost:5000`.

Docker starts seven services: the React client, API, email worker, search worker, MongoDB, Redis, and Elasticsearch. Email processing requires SMTP variables in your terminal environment; without them, the email worker retries safely while the rest of the app remains available.

Stop the environment with:

```bash
docker compose down
```

To remove local database data as well:

```bash
docker compose down -v
```

## Free cloud deployment

### 1. Create managed services

- Create a MongoDB Atlas database and copy its connection URI.
- Create an Upstash Redis database and copy its `rediss://` connection URI.
- Create a Cloudinary account before hosting file uploads. Do not use the Render local filesystem for persistent uploads.

Elasticsearch is disabled in `render.yaml` because Elastic Cloud provides only a time-limited trial. The app continues working; only advanced message search is unavailable.

### 2. Deploy the API to Render

1. Create a Render account and connect this GitHub repository.
2. Choose **New > Blueprint** and select this repository. Render reads `render.yaml`.
3. Add these environment variables to the `tribetalk-api` service:

```env
MONGODB_URI=<Atlas connection URI>
REDIS_URL=<Upstash rediss URI>
CLIENT_URL=<Vercel frontend URL, after step 3>
```

4. Deploy and copy the Render service URL, for example `https://tribetalk-api.onrender.com`.

### 3. Deploy the frontend to Vercel

1. Import the same GitHub repository into Vercel.
2. Set **Root Directory** to `client`.
3. Set the build command to `npm run build` and output directory to `dist`.
4. Add these environment variables:

```env
VITE_API_URL=https://tribetalk-api.onrender.com/api
VITE_SOCKET_URL=https://tribetalk-api.onrender.com
```

5. Deploy. Copy the Vercel URL and set it as `CLIENT_URL` in Render, then redeploy the Render service.

## Production notes

- Keep `COOKIE_SAME_SITE=none` and `NODE_ENV=production` in Render so the HTTPS frontend can authenticate with the API cookie.
- Do not expose any server secret through a `VITE_` variable.
- Free Render web services sleep after inactivity. The first request after sleep can be slow.
- The free Render service cannot host separate long-running workers. Keep `RUN_WORKERS_IN_API=false` for the basic free deployment. When using a paid worker, run `npm run worker:email` and `npm run worker:search` as separate services.
