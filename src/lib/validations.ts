import { z } from 'zod'

// 用户认证验证
export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6位字符'),
})

export const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6位字符'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密码不匹配',
  path: ['confirmPassword'],
})

// 图片生成验证
export const generationSchema = z.object({
  prompt: z.string().min(1, '请输入图片描述').max(500, '描述不能超过500字符'),
  negative_prompt: z.string().max(200, '负面提示不能超过200字符').optional(),
  ai_model: z.enum(['siliconflow', 'replicate'], {
    required_error: '请选择AI模型',
  }),
  width: z.number().min(256).max(2048).optional(),
  height: z.number().min(256).max(2048).optional(),
  steps: z.number().min(1).max(50).optional(),
  guidance_scale: z.number().min(1).max(20).optional(),
})

// 用户资料验证
export const profileSchema = z.object({
  username: z.string().min(2, '用户名至少需要2个字符').max(50, '用户名不能超过50个字符').optional(),
  full_name: z.string().max(100, '姓名不能超过100个字符').optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type GenerationFormData = z.infer<typeof generationSchema>
export type ProfileFormData = z.infer<typeof profileSchema>