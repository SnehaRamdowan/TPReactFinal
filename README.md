# TechTrends

A technology shop built with React, TypeScript, Express, PostgreSQL,
Redis, Tailwind CSS, Docker Compose, and nginx.

## Online application

- Website: https://tp-react-plum.vercel.app
- API health: https://techtrends-api.onrender.com/api/health
- Products: https://techtrends-api.onrender.com/api/products
- Orders: https://techtrends-api.onrender.com/api/orders
- Statistics: https://techtrends-api.onrender.com/api/stats
- Service status: https://techtrends-api.onrender.com/api/arch

The frontend is hosted on Vercel.
The API, PostgreSQL, and Redis are hosted on Render.
Local and online databases contain separate data.

## Repositories and folder layout

Clone both repositories into the same parent directory.
Use the folder names below because Docker Compose uses a relative
path to locate the frontend.

```powershell
git clone https://github.com/SnehaRamdowan/TPReactFinal.git TP3
git clone https://github.com/SnehaRamdowan/TPReact.git TPReact
```

Required locations relative to the parent directory:

| Component | Path |
|---|---|
| Root startup scripts | TP3/package.json |
| Docker Compose | TP3/api-produits/docker-compose.yml |
| Backend | TP3/api-produits |
| Frontend | TPReact/techtrends-react |

## Requirements

- Docker Desktop installed and running.
- Node.js and npm installed to run the root startup script.
- Git installed to clone the repositories.
- Ports 3000, 5173, 6379, 8081, and 15432 available.

## Local configuration

Create `TP3/api-produits/.env` with local database credentials:

```dotenv
POSTGRES_DB=techtrends
POSTGRES_USER=techtrends
POSTGRES_PASSWORD=choose_a_local_password
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

Keep `.env` out of Git.

Docker Compose supplies DATABASE_URL and REDIS_URL to the API.
The frontend Docker build uses http://localhost:3000 as its API URL.

## Start the entire application

From the TP3 directory:

```powershell
npm start
```

This builds and starts:

- React frontend served by nginx.
- Express API.
- PostgreSQL database.
- Redis cache and counters.
- Adminer database interface.

The first build requires downloading images and installing dependencies.

Open:

| Service | URL |
|---|---|
| Website | http://localhost:5173 |
| API health | http://localhost:3000/api/health |
| Products | http://localhost:3000/api/products |
| Orders | http://localhost:3000/api/orders |
| Statistics | http://localhost:3000/api/stats |
| Architecture status | http://localhost:3000/api/arch |
| Adminer | http://localhost:8081 |

For Adminer, select PostgreSQL and use server `db`,
with the database name, username, and password from `.env`.

## Stop services and view logs

From TP3:

```powershell
npm stop
npm run logs
```

After modifying frontend source code, run `npm start` again
to rebuild the files served by nginx.

## Database initialization and persistence

The database contains:

- `produits`: product names, prices, stock, and categories.
- `commandes`: customer first names, product references, quantities,
  purchase prices, and creation dates.

Docker initializes a fresh local PostgreSQL volume using `database.sql`.

The API startup also runs the initialization script before Express starts.
This creates missing tables and adds the three starter products only
when the products table is empty.

Existing products, stock, and orders are preserved.

The local PostgreSQL data is stored in the named `pgdata` volume.
Stopping or restarting the API does not remove saved orders.
Removing database volumes deletes their data.

## API routes

| Method | Route | Purpose |
|---|---|---|
| GET | /api/health | Check PostgreSQL connectivity |
| GET | /api/products | List products |
| GET | /api/products/:id | Retrieve one product |
| POST | /api/products | Create a product |
| PUT | /api/products/:id | Replace a product |
| DELETE | /api/products/:id | Delete an unreferenced product |
| POST | /api/orders | Place an order |
| GET | /api/orders | List saved orders, newest first |
| POST | /api/visit | Increment the visit counter |
| GET | /api/visit | Read the visit counter |
| GET | /api/stats | Read visits and Redis/SQL order counters |
| GET | /api/arch | Check API, PostgreSQL, and Redis status |

`/api/produits` is an alias for `/api/products`.
`/api/visites` is an alias for `/api/visit`.

Example order body:

```json
{
  "prenom": "Mokshada",
  "produitId": 2,
  "quantite": 1
}
```

A successful order returns HTTP 201.
Insufficient stock returns HTTP 409.
Invalid order data returns HTTP 400.

## Transactions and stock protection

An order runs inside a PostgreSQL transaction:

1. Decrease stock only if enough units remain.
2. Insert the order.
3. Commit both changes together.

If the transaction fails, the changes are rolled back.

The guarded stock update prevents two customers from buying
the same final unit.

After a successful order, the API invalidates the product cache
and attempts to increment the Redis order counter.

## Redis cache and counters

The product catalogue uses cache-aside with a 30-second TTL.

The `X-Cache` response header reports:

- `hit`: catalogue retrieved from Redis.
- `miss`: catalogue retrieved from PostgreSQL and cached.
- `bypass`: catalogue retrieved from PostgreSQL without using the cache.

Product changes and successful orders invalidate the catalogue cache.

If Redis is unavailable, products can still load from PostgreSQL.
Redis counters become unavailable during the outage.

PostgreSQL is the source of truth for saved orders.
The Redis order counter can differ after outages or resets.
Visits count page loads, not unique visitors.

## CORS

`CORS_ORIGIN` contains the permitted frontend origins,
separated by commas.

The deployed frontend origin is:

```text
https://tp-react-plum.vercel.app
```

`X-Cache` is exposed so React can read it.

CORS controls browser access to responses.
It is not authentication.

## Features

- Technology cards with search and alphabetical sorting.
- Product catalogue and order form.
- Confirmation messages and updated stock.
- Out-of-stock display.
- Visit and order counters.
- Live API, PostgreSQL, and Redis status.
- Catalogue cache-source display.
- Links to real technology buying guides.
- Interactive purchase checklist.
- Responsive Tailwind CSS styling.

## Manual tests completed

- Product listing and order creation locally and online.
- Two concurrent requests for one remaining unit:
  one HTTP 201, one HTTP 409, final stock 0, one saved order.
- Orders preserved after restarting the API.
- Fresh local database initialization:
  two tables and three starter products.
- Redis outage and recovery.
- PostgreSQL outage and recovery without restarting the API,
  after adding the PostgreSQL pool error handler.
- CORS header present for an allowed origin and absent for another origin.
- Catalogue cache sequence: MISS, HIT, then MISS after expiry.
- Product update followed by a catalogue cache MISS.
- nginx frontend confirmed with an HTTP 200 response and Server header.

## Deployment configuration

`render.yaml` describes the Render API, PostgreSQL, and Redis resources.
The file has been checked with WebStorm's Blueprint schema.

The existing Render services were configured through the dashboard.
A fresh deployment through Blueprint management has not been tested.

Vercel builds the frontend from `techtrends-react` in the frontend repository.
Its VITE_API_URL environment variable points to:

```text
https://techtrends-api.onrender.com
```

The frontend nginx Dockerfile is used for local Docker deployment.
Vercel uses its own static hosting.