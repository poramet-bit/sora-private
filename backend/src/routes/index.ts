import { Hono } from 'hono'
import type { Env } from '../index'
import { UserController } from '../controllers/user-controller'
import { HealthController } from '../controllers/health-controller'

export const apiRoutes = new Hono<{ Bindings: Env }>()

// User / Profile routes
apiRoutes.post('/login', (c) => new UserController(c).loginByEmail(c))
apiRoutes.get('/profile/:userId', (c) => new UserController(c).getProfile(c))
apiRoutes.post('/profile', (c) => new UserController(c).createProfile(c))
apiRoutes.patch('/profile/:userId', (c) => new UserController(c).updateProfile(c))

// Upload route
apiRoutes.post('/upload', (c) => new HealthController(c).upload(c))

// Analyze route
apiRoutes.post('/analyze', (c) => new HealthController(c).analyze(c))

// History routes
apiRoutes.get('/history', (c) => new HealthController(c).getHistory(c))

// Analysis detail
apiRoutes.get('/analysis/:id', (c) => new HealthController(c).getAnalysis(c))
