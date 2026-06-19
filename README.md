# TribeTalk

Discord-inspired MERN chat app built with JavaScript ES Modules.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Create `server/.env` from `server/.env.example`.

3. Make sure MongoDB and Redis are running locally, or update the connection URLs in `server/.env`.

4. Start both apps:

```bash
npm run dev
```

Client: http://localhost:5173  
Server: http://localhost:5000

Health check includes Redis status:

```bash
curl http://localhost:5000/health
```

## Architecture

Backend follows:

```txt
routes -> controllers -> services -> repositories -> models
```

Frontend follows:

```txt
App -> Pages -> Widgets -> Features -> Entities -> Shared
```

## Software Architecture

TribeTalk uses a layered MERN architecture designed to keep business rules, database access, and UI state clearly separated.

### High-Level System

```mermaid
flowchart LR
  User[User Browser] --> React[React Vite Client]
  React --> Router[React Router]
  React --> Redux[Redux Toolkit]
  Redux --> RTK[RTK Query API Layer]
  RTK --> REST[Express REST API]
  React --> SocketClient[Socket.IO Client]
  SocketClient <--> SocketServer[Socket.IO Server]
  REST --> Controllers[Controllers]
  Controllers --> Services[Services]
  Services --> Repositories[Repositories]
  Repositories --> Mongo[(MongoDB)]
  Services --> Redis[(Redis)]
  SocketServer --> Redis
  SocketServer --> Services
```

### Backend Request Flow

```mermaid
flowchart TD
  Route[Route] --> Controller[Controller]
  Controller --> Service[Service]
  Service --> Repository[Repository]
  Repository --> Model[Mongoose Model]
  Model --> MongoDB[(MongoDB)]
  Service --> Cache[(Redis Cache / Presence / Rate Limit)]
```

Responsibilities:

- Routes define API endpoints and attach middleware.
- Controllers read request data and send responses.
- Services contain validation, permissions, and business rules.
- Repositories contain database queries only.
- Models define MongoDB schemas only.
- Redis handles temporary distributed state, not permanent records.

### Frontend Structure

```mermaid
flowchart TD
  App[App] --> Pages[Pages]
  Pages --> Widgets[Widgets]
  Widgets --> Features[Features]
  Features --> Entities[Entities]
  Entities --> Shared[Shared]
```

Responsibilities:

- Pages represent route-level screens.
- Widgets compose larger UI regions such as sidebars and chat area.
- Features own user actions like auth, creating servers, and creating channels.
- Entities own domain API slices for servers, channels, and messages.
- Shared contains reusable UI, API clients, routing helpers, sockets, and utilities.

### Realtime Architecture

```mermaid
sequenceDiagram
  participant Client as React Client
  participant Socket as Socket.IO Server
  participant Redis as Redis
  participant Service as Message Service
  participant Mongo as MongoDB

  Client->>Socket: connect with JWT cookie
  Socket->>Redis: map userId to socketId
  Client->>Socket: join channel room
  Client->>Socket: message:create
  Socket->>Service: createMessage(userId, channelId, content)
  Service->>Mongo: save message
  Service-->>Socket: created message
  Socket-->>Client: broadcast message:created to channel room
```

Socket.IO is used only for realtime behavior:

- New messages
- Typing indicators
- Presence updates
- Notifications later

REST is still used for initial data loading:

- Authentication
- Server list
- Channel list
- Message history

## Redis Usage

Redis is used for API rate limiting, short-lived server/channel cache entries, Socket.IO scaling through the Redis adapter, and online presence socket mapping.

## Entity Relationship Diagram

```mermaid
erDiagram
  USER ||--o{ SERVER_MEMBER : joins
  SERVER ||--o{ SERVER_MEMBER : has
  USER ||--o{ SERVER : owns
  SERVER ||--o{ CHANNEL : contains
  CHANNEL ||--o{ MESSAGE : has
  USER ||--o{ MESSAGE : sends
  MESSAGE ||--o{ REACTION : has
  USER }o--o{ REACTION : reacts

  USER {
    ObjectId _id
    string username
    string email
    string passwordHash
    string avatarUrl
    date createdAt
    date updatedAt
  }

  SERVER {
    ObjectId _id
    string name
    string iconUrl
    ObjectId owner
    date createdAt
    date updatedAt
  }

  SERVER_MEMBER {
    ObjectId user
    string role
  }

  CHANNEL {
    ObjectId _id
    ObjectId server
    string name
    string type
    number position
    date createdAt
    date updatedAt
  }

  MESSAGE {
    ObjectId _id
    ObjectId channel
    ObjectId author
    string content
    date editedAt
    date createdAt
    date updatedAt
  }

  REACTION {
    string emoji
    ObjectIdArray users
  }
```

## Interview Talking Points

- The backend follows strict layered architecture to prevent controllers from becoming business-logic files.
- JWT is stored in HttpOnly cookies to reduce token exposure in browser JavaScript.
- RTK Query is the primary API layer, while Axios is only used as the configured HTTP client.
- Socket.IO handles realtime events, but REST handles initial data loading and pagination.
- Redis supports distributed concerns: presence, socket scaling, cache, and rate limiting.
- MongoDB remains the source of truth for users, servers, channels, and messages.
- RBAC lives in the service layer so every entry point enforces the same permissions.
- The frontend avoids prop drilling by storing app-level selections in Redux.
