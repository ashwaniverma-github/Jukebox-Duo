# JukeboxDuo - Frontend

A Next.js frontend for JukeboxDuo, a real-time synchronized music listening application.

## 🎵 Features

- **Real-time synchronization** - Listen to music in perfect sync with friends
- **Room-based listening** - Create and join music rooms
- **Queue management** - Add, remove, and reorder songs
- **YouTube integration** - Search and play YouTube videos
- **Responsive design** - Works on desktop and mobile

All these features are powered by the WebSocket server for real-time communication and synchronization.

## 🏗️ Architecture

This repository contains the **frontend only**. The WebSocket server is in a separate repository for better scalability and deployment flexibility.

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and Socket.IO client
- **WebSocket Server**: [JukeboxDuo-Websocket](https://github.com/ashwaniverma-github/Music-Duo-Websocket) - Separate repository with TypeScript and Socket.IO server
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database
- YouTube API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/jukebox-duo.git
   cd jukebox-duo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://..."
   
   # Authentication
   NEXTAUTH_SECRET="your-secret"
   NEXTAUTH_URL="http://localhost:3000"
   
   # YouTube API
   YOUTUBE_API_KEY="your-youtube-api-key"
   
   # WebSocket Server (for production)
   NEXT_PUBLIC_SOCKET_URL="https://your-websocket-server.com"
   ```

4. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### WebSocket Server

For local development, you'll need to run the WebSocket server separately:

1. **Clone the WebSocket server repository:**
   ```bash
   git clone https://github.com/ashwaniverma-github/Music-Duo-Websocket.git
   ```
2. **Follow its setup instructions**
3. **Set `NEXT_PUBLIC_SOCKET_URL=http://localhost:3001` in your `.env.local`**

## 🚀 Deployment

### Frontend (Vercel)

1. **Deploy to Vercel:**
   ```bash
   npx vercel
   ```

2. **Set environment variables** in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `YOUTUBE_API_KEY`
   - `NEXT_PUBLIC_SOCKET_URL` (your deployed WebSocket server URL)

### WebSocket Server

Deploy the WebSocket server to Railway, Render, or DigitalOcean following the instructions in the [JukeboxDuo-Websocket repository](https://github.com/ashwaniverma-github/Music-Duo-Websocket).

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard page
│   └── room/           # Room pages
├── components/         # React components
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
└── types/             # TypeScript type definitions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License
