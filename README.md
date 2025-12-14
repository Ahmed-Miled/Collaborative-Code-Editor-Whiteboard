# 🚀 Collaborative Code Editor

A real-time collaborative code editing platform built with React, Node.js, Express, Socket.io, and MongoDB. Edit code together in real-time with your team, track active users, and manage multiple documents across different rooms.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.2.0-blue.svg)

---

## ✨ Features

### Currently Implemented

- **Real-time Collaboration**: Multiple users can edit the same document simultaneously with instant synchronization
- **Monaco Editor Integration**: Professional code editing experience powered by VS Code's Monaco Editor
- **Multi-language Support**: Syntax highlighting for JavaScript, TypeScript, Python, HTML, CSS, Java, C++, Go, Rust, and more
- **Room Management**: Create and manage collaborative workspaces
- **Document Management**: Create, edit, rename, and delete documents within rooms
- **User Invitations**: Invite collaborators to your rooms via user ID
- **Active User Tracking**: See how many users are actively viewing each document in real-time
- **Auto-save Functionality**: Changes are automatically saved to the database
- **Authentication & Authorization**: Secure JWT-based authentication system
- **Responsive UI**: Clean, modern interface with smooth animations

### 🔜 Coming Soon

- **Whiteboard Feature**: Visual collaboration canvas for diagrams and sketches
- **Chat System**: Real-time messaging between collaborators
- **AI Chat Assistant**: Intelligent chatbot for answering user questions and providing coding assistance
- **Code Execution**: Run code directly in the browser
- **Version History**: Track and restore previous document versions
- **Video/Audio Chat**: Built-in communication tools

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Monaco Editor** - Code editor component
- **Socket.io Client** - Real-time communication
- **CSS3** - Styling with modern animations

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **Socket.io** - WebSocket server for real-time features
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (v6 or higher)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Ahmed-Miled/Collaborative-Code-Editor-Whiteboard.git
cd collaborative-code-editor-Whiteboard
```

### 2. Install Dependencies

#### Install Server Dependencies
```bash
cd server
npm install
```

#### Install Client Dependencies
```bash
cd ../client
npm install
```

### 3. Environment Configuration

#### Server Environment Variables
Create a `.env` file in the `server` directory:

```env
JWT_SECRET=your_jwt_secret_key_here
PORT=3001
MONGO_URI=mongodb://localhost:27017/collab_editor
```

#### Client Environment Variables
Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://127.0.0.1:3001
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On macOS (using Homebrew)
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### 5. Run the Application

#### Start the Backend Server
```bash
cd server
npm run dev
```
The server will start on `http://localhost:3001`

#### Start the Frontend Client
Open a new terminal:
```bash
cd client
npm run dev
```
The client will start on `http://localhost:5173`

---

## 📁 Project Structure

```
collaborative-code-editor/
├── client/                      # React frontend
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── api/                 # API service functions
│   │   │   ├── api.js           # User and room APIs
│   │   │   └── documents.js     # Document APIs
│   │   ├── components/          # React components
│   │   │   ├── CollaboratorsSection.jsx
│   │   │   ├── DocumentEditor.jsx
│   │   │   ├── DocumentsSection.jsx
│   │   │   ├── NavBar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RoomDetails.jsx
│   │   │   ├── RoomHeader.jsx
│   │   │   ├── RoomModal.jsx
│   │   │   ├── SideBar.jsx
│   │   │   └── Workspace.jsx
│   │   ├── context/             # React context providers
│   │   │   └── UserContext.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── App.jsx              # Main app component
│   │   └── main.jsx             # Entry point
│   ├── styles/                  # CSS stylesheets
│   └── package.json
│
├── server/                      # Node.js backend
│   ├── config/
│   │   └── db.js                # Database configuration
│   ├── controllers/             # Route controllers
│   │   ├── authController.js
│   │   ├── documentController.js
│   │   ├── roomController.js
│   │   └── usersController.js
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/                  # Mongoose schemas
│   │   ├── Document.js
│   │   ├── Room.js
│   │   └── User.js
│   ├── routes/                  # API routes
│   │   ├── auth.js
│   │   ├── document.js
│   │   ├── rooms.js
│   │   └── userRoutes.js
│   ├── socketHandlers.js        # Socket.io event handlers
│   ├── index.js                 # Server entry point
│   └── package.json
│
└── README.md                    # Project documentation
```

---

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /users/me` - Get current user info

### Rooms
- `POST /rooms/create` - Create a new room
- `GET /rooms/getRooms` - Get all user's rooms
- `GET /rooms/:id` - Get specific room
- `POST /rooms/:roomId/invite` - Invite user to room
- `POST /rooms/:roomId/updateRoomName` - Update room name
- `DELETE /rooms/:roomId/remove/:userId` - Remove user from room

### Documents
- `POST /documents/rooms/:roomId` - Create document in room
- `GET /documents/rooms/:roomId` - Get all room documents
- `GET /documents/:documentId` - Get specific document
- `PUT /documents/:documentId` - Update document
- `DELETE /documents/:documentId` - Delete document

### User Management
- `GET /users/me/getInvitations` - Get user invitations
- `PUT /users/me/invitations/:roomId/accept` - Accept invitation
- `PUT /users/me/invitations/:roomId/reject` - Reject invitation

---

## 🔗 Socket.io Events

### Client → Server
- `join-document` - Join a document editing session
- `leave-document` - Leave a document session
- `document-edit` - Send document changes
- `document-language-change` - Change code language

### Server → Client
- `document-loaded` - Receive document content on join
- `document-change` - Receive real-time changes from other users
- `document-auto-saved` - Notification of auto-save completion
- `document-language-updated` - Language change notification
- `active-users-update` - Real-time count of active document viewers
- `error` - Error notifications

---

## 👤 User Guide

### Creating an Account
1. Navigate to the registration page
2. Enter username, email, and password
3. Click "Register"
4. You'll be automatically logged in

### Creating a Room
1. After logging in, click "Create Room"
2. Enter a room name
3. The room will appear in your sidebar

### Inviting Collaborators
1. Select a room
2. Click "Invite" in the Members section
3. Enter the user's ID (they can find it in the navbar)
4. The invited user will receive a notification

### Creating Documents
1. Select a room
2. Click "+ Add Document"
3. Enter document name and select language
4. Start coding!

### Real-time Collaboration
1. Open a document
2. Other users in the room can open the same document
3. All changes sync in real-time
4. See active viewer count in the navbar

---

## 🎨 Customization

### Changing Editor Theme
Edit `client/src/components/DocumentEditor.jsx`:
```javascript
<Editor
  theme="vs-dark" // Change to "vs-light" or "hc-black"
  // ... other props
/>
```

### Adding New Languages
Update the language dropdown in `DocumentEditor.jsx` and `RoomModal.jsx`:
```javascript
<option value="rust">Rust</option>
<option value="kotlin">Kotlin</option>
// Add more languages
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# If connection fails, restart MongoDB service
sudo systemctl restart mongod
```

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Socket Connection Issues
- Ensure backend is running on port 3001
- Check CORS configuration in `server/index.js`
- Verify `VITE_API_URL` in client `.env`

---

## 🔐 Security Considerations

- JWT tokens expire after 1 day
- Passwords are hashed using bcrypt with 10 salt rounds
- Authentication required for all protected routes
- Input validation on all API endpoints
- CORS configured for allowed origins only

---

## 🚧 Planned Features & Roadmap

### Phase 2: Enhanced Collaboration (Q1 2025)
- [ ] Whiteboard integration with real-time drawing
- [ ] In-app chat messaging system
- [ ] User presence indicators (typing, viewing)
- [ ] Cursor tracking and multi-user cursors

### Phase 3: AI Integration (Q2 2025)
- [ ] AI-powered code suggestions
- [ ] Chatbot assistant for coding help
- [ ] Automated code review
- [ ] Smart code completion

### Phase 4: Advanced Features (Q3 2025)
- [ ] Video/audio conferencing
- [ ] Code execution sandbox
- [ ] Version control integration (Git)
- [ ] Document version history
- [ ] Code snippets library
- [ ] Team analytics dashboard

### Phase 5: Enterprise Features (Q4 2025)
- [ ] Custom branding
- [ ] SSO integration
- [ ] Advanced permissions system
- [ ] Audit logs
- [ ] Self-hosted deployment options

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting PR

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@Ahmed-Miled](https://github.com/Ahmed-Miled/)
- Email: contact.ahmedmiled@gmail.com

---

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code's editor
- [Socket.io](https://socket.io/) - Real-time communication
- [Express](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [React](https://react.dev/) - UI framework

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: contact.ahmedmiled@gmail.com

---

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

---

**Built with ❤️ by developer, for developers**