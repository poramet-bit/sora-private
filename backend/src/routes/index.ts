import { Hono } from 'hono'
import type { AppEnv } from '../index'
import { UserController } from '../controllers/user-controller'
import { HealthController } from '../controllers/health-controller'
import { validateBody, validateQuery, validateParams } from '../validations/middleware'
import {
  CreateUserSchema,
  LoginSchema,
  UpdateUserSchema,
  CreateHealthRecordSchema,
  HistoryQuerySchema,
  UserIdParamSchema,
  AnalysisIdParamSchema,
} from '../validations/schemas'

export const apiRoutes = new Hono<AppEnv>()

// User / Profile routes
apiRoutes.post('/login', validateBody(LoginSchema), (c) => new UserController(c).loginByEmail(c))
apiRoutes.get('/profile/:userId', validateParams(UserIdParamSchema), (c) => new UserController(c).getProfile(c))
apiRoutes.post('/profile', validateBody(CreateUserSchema), (c) => new UserController(c).createProfile(c))
apiRoutes.patch('/profile/:userId', validateParams(UserIdParamSchema), validateBody(UpdateUserSchema), (c) => new UserController(c).updateProfile(c))

// Upload route — NO validation middleware (multipart, not JSON)
apiRoutes.post('/upload', (c) => new HealthController(c).upload(c))

// Analyze route
apiRoutes.post('/analyze', validateBody(CreateHealthRecordSchema), (c) => new HealthController(c).analyze(c))

// History routes
apiRoutes.get('/history', validateQuery(HistoryQuerySchema), (c) => new HealthController(c).getHistory(c))

// Analysis detail
apiRoutes.get('/analysis/:id', validateParams(AnalysisIdParamSchema), (c) => new HealthController(c).getAnalysis(c))
