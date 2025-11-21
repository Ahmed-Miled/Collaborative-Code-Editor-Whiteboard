# Collaborative-Code-Editor-Whiteboard

# Collaborative Code Editor / Whiteboard — System Design & Roadmap

> A high-level, actionable plan and technical design for a real-time collaborative code editor + whiteboard (React + Node/Express + Socket.io + MongoDB).

---

## Summary

This document covers:

* System architecture and component responsibilities
* MongoDB schemas
* REST & WebSocket API design (routes + socket events)
* React component structure and integration notes (Monaco/React-Ace + Canvas)
* Persistence, scaling, and deployment recommendations
* Security, testing, and operational concerns
* A step-by-step roadmap with milestones and acceptance criteria

---

## 1. High-level architecture

**Components**:

* **Client (React)**: authentication, lobby, room UI (code editor, whiteboard, chat, participants, settings)
* **API Server (Express)**: REST endpoints for auth, rooms, document metadata; serves static client in prod
* **Realtime Server (Socket.io attached to Node/Express)**: handles real-time events, presence, and ephemeral state
* **Database (MongoDB)**: persistent storage for users, rooms, documents, snapshots
* **Redis (optional but recommended)**: session store, Socket.io adapter (pub/sub) for multi-instance scaling, ephemeral presence
* **CDN / Nginx**: static asset hosting and TLS termination

Flow: user authenticates → creates/joins room → client fetches latest document state via REST → connects via Socket.io to subscribe to room events → changes are broadcast and periodically persisted.

**Scaling notes**: When scaling Node across many instances, use the Socket.io Redis adapter so events propagate between instances. Use sticky sessions or JWT auth + Redis adapter; best is stateless JWT + Redis pub/sub.

---

## 2. Key design decisions (tradeoffs)

* **Operational model**: Use **Operational Transform (OT)** or **Conflict-free Replicated Data Types (CRDT)** for real-time text-sync. OT is simpler with centralized server; CRDTs give better offline/merge guarantees but are more complex to implement.
* **Choice for project**: Start with a server-mediated OT-like solution (broadcasting deltas) for MVP; add CRDT (e.g., Yjs / Automerge) if you want a robust, battle-tested solution.
* **Editor library**: Monaco Editor (VSCode engine) for a production feel; React-Ace is simpler. Monaco is heavier but worth it.
* **Whiteboard**: Canvas-based drawing (fabric.js or custom canvas); serialize strokes as vector objects (not bitmaps) for small payloads and undo/redo.

---

## 3. MongoDB Schemas (Mongoose-style)

### User

```js
const User = {
  _id: ObjectId,
  username: String,
  email: String,
  passwordHash: String,
  displayName: String,
  avatarUrl: String,
  createdAt: Date,
}
```

### Room

```js
const Room = {
  _id: ObjectId,
  roomId: String, // short unique id used in URLs
  name: String,
  owner: ObjectId (User),
  isPrivate: Boolean,
  passwordHash?: String,
  createdAt: Date,
  lastActivity: Date,
}
```

### Document (Code)

```js
const Document = {
  _id: ObjectId,
  roomId: String,
  language: String, // e.g., 'javascript'
  content: String, // latest plaintext content
  ops: [{ userId, op, ts }], // optional append-only ops log
  version: Number,
  autosaveAt: Date,
  createdAt: Date,
}
```

### Whiteboard (Drawing session)

```js
const Whiteboard = {
  _id: ObjectId,
  roomId: String,
  objects: [ /* vector objects (strokes, shapes) */ ],
  version: Number,
  lastSaved: Date,
}
```

### Presence / Session (ephemeral - Redis preferred)

```
Key: session:{roomId}:{socketId}
Value: { userId, cursor, lastSeen, role }
```

---

## 4. REST API Routes (Express)

### Auth

* `POST /api/auth/register` — body: `{ username, email, password }` → returns `{ token, user }`
* `POST /api/auth/login` — body: `{ email, password }` → returns `{ token, user }`
* `GET /api/auth/me` — header `Authorization: Bearer <token>` → returns user

### Rooms & Documents

* `POST /api/rooms` — create room → returns `{ roomId }`
* `GET /api/rooms/:roomId` — room metadata
* `POST /api/rooms/:roomId/join` — optional password
* `GET /api/rooms/:roomId/document` — returns latest doc + meta
* `POST /api/rooms/:roomId/document/save` — save snapshot (server-side protection)
* `GET /api/rooms/:roomId/whiteboard` — returns latest whiteboard state
* `POST /api/rooms/:roomId/whiteboard/save` — save whiteboard snapshot

### Admin / Misc

* `GET /api/users/:id` — public profile
* `GET /api/stats/rooms` — usage metrics (admin)

---

## 5. Socket.io Events (Realtime contract)

**Connection flow**:

* Client connects: `socket.auth = { token }` or sends `authenticate` event
* Server verifies token, then joins rooms as requested.

**Events (client -> server)**

* `join_room` `{ roomId }` → server joins socket to that room, returns current state
* `leave_room` `{ roomId }`
* `code_change` `{ roomId, delta, version, cursor }` → server validates, increments version and broadcasts
* `cursor_move` `{ roomId, cursor }` → broadcast to others
* `request_sync` `{ roomId }` → server responds with full state
* `whiteboard_action` `{ roomId, action }` → strokes/shapes added
* `chat_message` `{ roomId, text }`
* `save_snapshot` `{ roomId }` → triggers DB save

**Events (server -> client)**

* `joined` `{ users[] }`
* `user_joined` `{ user }`
* `user_left` `{ userId }`
* `code_update` `{ delta, version, userId }`
* `cursor_update` `{ userId, cursor }`
* `whiteboard_update` `{ action }`
* `sync_state` `{ document, whiteboard, users }`
* `error` `{ code, message }`

**Conflict resolution**: server should reject or transform out-of-order edits. Include `version` and apply OT/CRDT transform before broadcasting.

---

## 6. Client (React) architecture & components

**Libraries**:

* Editor: `@monaco-editor/react` (Monaco) or `react-ace`
* Socket: `socket.io-client`
* Drawing: `fabric.js` or custom Canvas with requestAnimationFrame
* State management: React Context or Zustand/Redux for global state
* Styling: Tailwind or CSS modules

**Component tree (suggested)**

```
App
 ├─ AuthRoute (login/register)
 ├─ Lobby (create/join room + recent rooms)
 └─ Room (roomId)
     ├─ Header (room info, share link, settings)
     ├─ LeftPanel
     │   └─ EditorWrapper (Monaco)  --> handles code deltas, cursors
     ├─ RightPanel
     │   ├─ WhiteboardCanvas (fabric/Canvas) --> actions encoded as vectors
     │   └─ Chat
     ├─ BottomBar (controls: run, format, language, save)
     └─ ParticipantsPanel (avatars, presence, follow mode)
```

**Editor integration notes**:

* Hook into Monaco's `onDidChangeModelContent` to capture deltas and `onDidChangeCursorPosition` for cursor updates.
* Buffer small edits into a debounce (e.g., 50–150ms) then emit `code_change` with delta + local version.
* Render remote cursors by drawing decorations in Monaco.

**Whiteboard integration notes**:

* Serialize strokes as arrays: `{id, type:'stroke', points:[], color, width, userId, ts}`
* Send `whiteboard_action` per stroke completion (or incremental for long strokes)
* Implement client-side undo stack; keep authoritative ops on server for reconciling.

---

## 7. Persistence strategy

* **Autosave**: clients send `save_snapshot` every N seconds (e.g., 5–10s) or when inactivity/leave occurs.
* **Ops log**: optionally store an append-only ops log to allow replay and reconstruct history.
* **Snapshots**: store periodic full snapshots (e.g., every 1 minute or every 100 ops) to avoid replaying long logs.
* **Conflict handling**: use `version` numbers; the server treats incoming ops with older versions by transforming or rejecting with `sync_state`.

---

## 8. Scaling & deployment

* **Single-instance / small scale**: Node + Socket.io, MongoDB, hosted on a single VPS.
* **Multi-instance**: use `socket.io-redis` adapter; host Redis, use JWT for auth; use Kubernetes or Docker Compose.
* **Load balancer**: Nginx or cloud LB with WebSocket support.
* **Storage backups**: daily MongoDB snapshots, scheduled exports for documents.

**Docker Compose example (simplified)**:

```yaml
version: '3'
services:
  app:
    build: .
    ports: ['3000:3000']
    depends_on: ['mongo','redis']
  mongo:
    image: mongo:6
  redis:
    image: redis:7
```

---

## 9. Security & privacy

* Use HTTPS/TLS everywhere.
* Authenticate APIs with JWT; verify tokens on socket connection.
* Access control: room roles (owner/moderator/participant), room invite tokens for private rooms.
* Rate-limiting for important endpoints and socket events.
* Sanitize text and chat messages to avoid XSS when rendering HTML (escape and render plain text or sanitized markdown).
* Limit file upload size if you support attachments.
* Store passwords hashed (bcrypt / argon2).

---

## 10. Testing & monitoring

* **Unit tests** for critical transformations (OT/CRDT), and for REST endpoints.
* **Integration tests** for socket flows: simulate multiple clients and assert final state equality.
* **E2E tests** (Cypress or Playwright) to verify join/save flows and basic editing sync.
* **Monitoring**: Prometheus/Grafana or cloud metrics; track active connections, ops/sec, errors.
* **Logging**: structured logs (JSON) with correlation id (roomId + requestId).

---

## 11. Roadmap — milestones (concrete tasks)

### MVP (Core, 2–4 weeks realistically if experienced)

1. **Project skeleton**: Create monorepo (client, server), basic auth, and room creation. (Acceptance: register/login + create room works)
2. **Editor only**: Integrate Monaco editor; implement simple server-mediated broadcast (no OT). (Acceptance: multiple clients see text typed by one)
3. **Persistence**: Save/load document from MongoDB on join. (Acceptance: reload shows last saved content)
4. **Basic cursors & presence**: Show who is connected and simple cursor positions. (Acceptance: participant list updates)

### V1 (Stability & features, 2–6 weeks)

5. **Whiteboard**: Add canvas, stroke sync, and persistence. (Acceptance: strokes sync across clients and persist)
6. **Ops/Versioning**: Add version numbers and basic transform; handle out-of-order edits. (Acceptance: edits don't clobber each other in simple concurrent scenarios)
7. **UI polish**: Room sharing links, editable room names, theme, basic permissions.

### V2 (Scale & polish, 4–8+ weeks)

8. **CRDT/OT**: Replace simple model with Yjs or robust OT implementation. (Acceptance: offline edits merge correctly)
9. **Scaling**: Add Redis adapter, Docker/K8s deploy, performance tuning. (Acceptance: multi-instance sockets work without lost messages)
10. **Extras**: Code execution sandbox (run code safely in container), file attachments, recording/replay, session playback.

---

## 12. Implementation tips & code snippets

**Socket connection (client)**

```js
import { io } from 'socket.io-client';
const socket = io('/', { auth: { token } });

socket.emit('join_room', { roomId });
socket.on('sync_state', data => {
  // apply document + whiteboard
});
```

**Apply delta pattern (server)**

```js
socket.on('code_change', ({roomId, delta, version, userId}) => {
  // 1. validate version
  // 2. apply transform if needed
  // 3. increment server version
  // 4. broadcast to room
});
```

**Autosave approach**

* Client: every 5–10s call `save_snapshot` with current content.
* Server: persist snapshot and trim ops log older than last snapshot.

---

## 13. Acceptance tests (examples)

* Two clients join same room and type simultaneously for 60s → final document equal across clients and server.
* Client disconnects and reconnects → receives latest state and can continue editing without data loss.
* Whiteboard actions recorded → after refresh, whiteboard restored to last snapshot.

---

## 14. Extensions & bonus ideas

* **Live code execution** with sandboxed containers (e.g., Firecracker, gVisor) for limited languages.
* **Collaborative debugging**: Share breakpoints and call stacks.
* **Session recording**: Replay code and whiteboard timeline.
* **Pair-programming features**: Follow mode, remote control, audio/video integration.

---

## 15. Final notes

* Start small: get a two-client sync working first (no OT), then iterate.
* Consider using Yjs (CRDT) or ShareDB (OT) libraries to avoid reinventing complex sync algorithms.
* Keep ops/messages compact: encode strokes and text diffs, avoid sending full document on every keystroke.

---

If you want, I can also:

* produce `Mongoose` model files and example Express route handlers,
* provide a ready-to-run minimal repo skeleton (client + server) with Docker Compose,
* or generate the exact React component code for the EditorWrapper with Monaco integration.
