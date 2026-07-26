import { z } from 'zod'

const GenderEnum = z.enum(['male', 'female', 'other'])

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  age: z.number().int().min(1).max(150),
  gender: GenderEnum,
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(1, 'Password is required'),
})

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  age: z.number().int().min(1).max(150).optional(),
  gender: GenderEnum.optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
})

export const CreateHealthRecordSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  imageUrl: z.string().optional(),
  age: z.number().int().min(0).max(150),
  gender: GenderEnum,
  weight: z.number().positive('Weight must be positive').max(500),
  height: z.number().positive('Height must be positive').max(300),
  bloodPressureSystolic: z.number().int().min(50).max(300).optional(),
  bloodPressureDiastolic: z.number().int().min(30).max(200).optional(),
  heartRate: z.number().int().min(30).max(300).optional(),
  bodyTemperature: z.number().min(30).max(45).optional(),
  symptoms: z.string().min(1, 'Symptoms are required').max(2000),
  medicalHistory: z.string().max(2000).optional(),
})

export const HistoryQuerySchema = z.object({
  userId: z.string().optional(),
})

export const AnalysisIdParamSchema = z.object({
  id: z.string().min(1, 'Invalid analysis ID'),
})

export const UserIdParamSchema = z.object({
  userId: z.string().min(1, 'Invalid user ID'),
})

export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type CreateHealthRecordInput = z.infer<typeof CreateHealthRecordSchema>
export type HistoryQueryInput = z.infer<typeof HistoryQuerySchema>
