// src/server.js
const { createServer } = require('http')
const next = require('next')
const { parse } = require('url')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const PORT = 3001

let io
app.prepare().then(() => {
  // 1) Create HTTP server for Next.js pages
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  // 2) Mount Socket.IO on that same server
  const io = new Server(server, {
    path: '/api/socket',
    cors: {
      origin: 'http://localhost:3000',   // your frontend
      methods: ['GET', 'POST']
    },
    transports: ['websocket']            // optional: enforce websocket
  })

  io.on('connection', (socket) => {
    console.log('🔌 client connected', socket.id)

    socket.on('join-room', (roomId) => {
      console.log(`👥 ${socket.id} joined room ${roomId}`)
      socket.join(roomId)
    })

    socket.on('sync-ping', (t0) => {
      socket.emit('sync-pong', Date.now())
    })

    socket.on('sync-command', ({ roomId, cmd, timestamp, seekTime }) => {
      console.log(`📡 sync-command → room:${roomId} cmd:${cmd} seek:${seekTime}`)
      socket.to(roomId).emit('sync-command', { cmd, timestamp, seekTime })
    })

    // ─── NEW: relay change-video to all clients in room ───
    socket.on('change-video', ({ roomId, videoId }) => {
      console.log(`🎬 change-video → room:${roomId} videoId:${videoId}`)
      socket.to(roomId).emit('change-video', { roomId, videoId })
    })

    socket.on('disconnect', () => {
      console.log('❌ client disconnected', socket.id)
    })
  })

  // 3) Start listening
  server.listen(PORT, () => {
    console.log(`🚀 Next+Socket.IO server listening on http://localhost:${PORT}`)
    console.log(`   Socket.IO path: http://localhost:${PORT}/api/socket`)
  })
})

module.exports.getSocketIOInstance = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized yet')
  }
  return io
}