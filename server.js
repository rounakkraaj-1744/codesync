const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const prisma = new PrismaClient();
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store recording events in memory before persisting
const sessionRecordings = new Map();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket.io logic
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-session', async ({ sessionId, user }) => {
      console.log(`User ${user.name} joining session ${sessionId}`);
      socket.join(sessionId);
      
      socket.data.user = user;
      socket.data.sessionId = sessionId;

      // Ensure session exists in DB or create it
      try {
        const session = await prisma.session.upsert({
          where: { id: sessionId },
          update: {},
          create: { 
            id: sessionId,
            language: 'javascript',
            mode: 'pair-programming',
            code: '// Start coding...',
          }
        });
        
        // Push initial state to joining user
        socket.emit('code-update', { code: session.code });
        socket.emit('language-updated', session.language);
        socket.emit('mode-updated', session.mode);
      } catch (err) {
        console.error('Error upserting session:', err);
      }

      socket.to(sessionId).emit('user-joined', user);
    });

    socket.on('code-change', async ({ sessionId, code, userId }) => {
      socket.to(sessionId).emit('code-update', { code, userId });
      
      // Save code change to database (debounced via setTimeout logically or just save periodically)
      // For MVP, we save it directly but could optimize
      try {
        await prisma.session.update({
          where: { id: sessionId },
          data: { code }
        });
        
        // Record event
        if (!sessionRecordings.has(sessionId)) sessionRecordings.set(sessionId, []);
        sessionRecordings.get(sessionId).push({ 
          type: 'code', 
          userId, 
          data: code, 
          timestamp: Date.now() 
        });
      } catch (err) {
        console.error('Database Error:', err);
      }
    });

    socket.on('cursor-move', ({ sessionId, position, userId, name, color }) => {
      socket.to(sessionId).emit('cursor-update', { position, userId, name, color });
      
      // Record cursor movement
      if (sessionRecordings.has(sessionId)) {
        sessionRecordings.get(sessionId).push({ 
          type: 'cursor', 
          userId, 
          data: position, 
          timestamp: Date.now() 
        });
      }
    });

    socket.on('language-change', async ({ sessionId, language }) => {
      socket.to(sessionId).emit('language-updated', language);
      await prisma.session.update({
        where: { id: sessionId },
        data: { language }
      });
    });

    socket.on('mode-change', async ({ sessionId, mode }) => {
      socket.to(sessionId).emit('mode-updated', mode);
      await prisma.session.update({
        where: { id: sessionId },
        data: { mode }
      });
    });

    socket.on('chat-message', ({ sessionId, message }) => {
      socket.to(sessionId).emit('chat-message-received', message);
    });

    socket.on('start-recording', (sessionId) => {
      console.log('Recording started for session:', sessionId);
      sessionRecordings.set(sessionId, []);
      socket.to(sessionId).emit('recording-started');
    });

    socket.on('stop-recording', async (sessionId) => {
      console.log('Recording stopped for session:', sessionId);
      const events = sessionRecordings.get(sessionId) || [];
      
      if (events.length > 0) {
        try {
          await prisma.recording.create({
            data: {
              sessionId,
              recordingData: events,
              duration: Math.floor((events[events.length - 1].timestamp - events[0].timestamp) / 1000)
            }
          });
        } catch (err) {
          console.error('Recording Persistence Error:', err);
        }
      }
      
      sessionRecordings.delete(sessionId);
      socket.to(sessionId).emit('recording-stopped');
    });

    socket.on('disconnect', () => {
      const { sessionId, user } = socket.data;
      if (sessionId && user) {
        socket.to(sessionId).emit('user-left', user);
      }
      console.log('User disconnected:', socket.id);
    });
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
