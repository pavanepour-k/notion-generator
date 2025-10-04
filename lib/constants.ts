// Application constants and configuration

export const APP_CONFIG = {
  name: 'Notionify',
  version: '1.0.0',
  description: 'AI-powered Notion template generator',
  author: 'Notionify Team',
  url: 'https://notionify.app', // Update with your actual domain
} as const;

export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
} as const;

export const RATE_LIMITS = {
  generate: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },
  save: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
  },
} as const;

export const VALIDATION_LIMITS = {
  prompt: {
    minLength: 3,
    maxLength: 1000,
  },
  template: {
    maxSections: 20,
    maxProperties: 50,
    maxTitleLength: 200,
    maxDescriptionLength: 500,
    maxNotesLength: 1000,
  },
  content: {
    maxSize: 1024 * 1024, // 1MB
  },
} as const;

export const NOTION_PROPERTY_TYPES = [
  'text',
  'select',
  'multi-select',
  'number',
  'date',
  'checkbox',
  'url',
  'email',
  'phone',
  'formula',
  'relation',
  'rollup',
  'created_time',
  'created_by',
  'last_edited_time',
  'last_edited_by',
  'files',
  'status',
] as const;

export const TEMPLATE_TYPES = [
  'project-management',
  'personal-productivity',
  'content-creation',
  'learning-education',
  'finance-budgeting',
  'health-fitness',
  'business-entrepreneur',
  'event-planning',
  'research-knowledge',
  'creative-writing',
] as const;

export const EXAMPLE_PROMPTS = [
  '사이드프로젝트 관리 보드',
  '독서 기록 템플릿',
  '일일 계획 템플릿',
  '학습 진도 추적',
  '비용 관리 시트',
  '운동 일지',
  '여행 계획서',
  '회의록 템플릿',
  '고객 관리 시스템',
  '콘텐츠 제작 플래너',
  '스터디 그룹 관리',
  '이벤트 기획 템플릿',
  '창작 작업 관리',
  '연구 노트 템플릿',
  '비즈니스 메트릭 대시보드',
] as const;

export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection and try again.',
  TIMEOUT: 'Request timeout. Please try again.',
  RATE_LIMIT: 'Rate limit exceeded. Please try again later.',
  INVALID_INPUT: 'Invalid input provided.',
  MISSING_API_KEY: 'API key is missing or invalid.',
  TEMPLATE_GENERATION_FAILED: 'Failed to generate template. Please try again.',
  SAVE_FAILED: 'Failed to save template. Please try again.',
  COPY_FAILED: 'Failed to copy to clipboard. Please copy manually.',
} as const;

export const SUCCESS_MESSAGES = {
  TEMPLATE_GENERATED: 'Template generated successfully!',
  TEMPLATE_SAVED: 'Template saved and shared successfully!',
  COPIED_TO_CLIPBOARD: 'Copied to clipboard!',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

export const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.buymeacoffee.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://cdn.buymeacoffee.com",
  "connect-src 'self' https://api-inference.huggingface.co https://api.github.com",
  "frame-src https://www.buymeacoffee.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'"
] as const;
