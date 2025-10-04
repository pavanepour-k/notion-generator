// Comprehensive validation utilities for the Notionify application

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Input validation for prompts
export function validatePrompt(prompt: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!prompt || typeof prompt !== 'string') {
    errors.push('Prompt is required and must be a string');
    return { isValid: false, errors, warnings };
  }

  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length < 3) {
    errors.push('Prompt must be at least 3 characters long');
  }

  if (trimmedPrompt.length > 1000) {
    errors.push('Prompt must be less than 1000 characters');
  }

  if (trimmedPrompt.length > 500) {
    warnings.push('Long prompts may take longer to process');
  }

  // Check for potentially malicious content
  const dangerousPatterns = [
    { pattern: /<script/i, message: 'Script tags are not allowed' },
    { pattern: /javascript:/i, message: 'JavaScript URLs are not allowed' },
    { pattern: /on\w+\s*=/i, message: 'Event handlers are not allowed' },
    { pattern: /eval\s*\(/i, message: 'Eval functions are not allowed' },
    { pattern: /function\s*\(/i, message: 'Function definitions are not allowed' },
    { pattern: /import\s+/i, message: 'Import statements are not allowed' },
    { pattern: /require\s*\(/i, message: 'Require statements are not allowed' }
  ];

  for (const { pattern, message } of dangerousPatterns) {
    if (pattern.test(trimmedPrompt)) {
      errors.push(message);
    }
  }

  // Check for spam-like patterns
  const spamPatterns = [
    { pattern: /(.)\1{10,}/, message: 'Repeated characters detected' },
    { pattern: /\b(viagra|casino|poker|lottery)\b/i, message: 'Spam-like content detected' }
  ];

  for (const { pattern, message } of spamPatterns) {
    if (pattern.test(trimmedPrompt)) {
      warnings.push(message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Template structure validation
export function validateTemplateStructure(template: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!template || typeof template !== 'object') {
    errors.push('Template must be an object');
    return { isValid: false, errors, warnings };
  }

  // Validate title
  if (!template.title || typeof template.title !== 'string') {
    errors.push('Title is required and must be a string');
  } else if (template.title.trim().length === 0) {
    errors.push('Title cannot be empty');
  } else if (template.title.length > 200) {
    warnings.push('Title is quite long, consider shortening it');
  }

  // Validate sections
  if (!Array.isArray(template.sections)) {
    errors.push('Sections must be an array');
  } else {
    if (template.sections.length === 0) {
      warnings.push('No sections defined');
    } else if (template.sections.length > 20) {
      warnings.push('Many sections defined, consider simplifying');
    }

    template.sections.forEach((section: any, index: number) => {
      if (!section || typeof section !== 'object') {
        errors.push(`Section ${index + 1} must be an object`);
        return;
      }

      if (!section.name || typeof section.name !== 'string') {
        errors.push(`Section ${index + 1}: name is required and must be a string`);
      } else if (section.name.trim().length === 0) {
        errors.push(`Section ${index + 1}: name cannot be empty`);
      }

      if (!section.description || typeof section.description !== 'string') {
        errors.push(`Section ${index + 1}: description is required and must be a string`);
      } else if (section.description.trim().length === 0) {
        errors.push(`Section ${index + 1}: description cannot be empty`);
      } else if (section.description.length > 500) {
        warnings.push(`Section ${index + 1}: description is quite long`);
      }
    });
  }

  // Validate properties
  if (!Array.isArray(template.properties)) {
    errors.push('Properties must be an array');
  } else {
    if (template.properties.length === 0) {
      warnings.push('No properties defined');
    } else if (template.properties.length > 50) {
      warnings.push('Many properties defined, consider simplifying');
    }

    const validPropertyTypes = [
      'text', 'select', 'multi-select', 'number', 'date', 'checkbox', 'url',
      'email', 'phone', 'formula', 'relation', 'rollup', 'created_time',
      'created_by', 'last_edited_time', 'last_edited_by', 'files', 'status'
    ];

    template.properties.forEach((property: any, index: number) => {
      if (!property || typeof property !== 'object') {
        errors.push(`Property ${index + 1} must be an object`);
        return;
      }

      if (!property.name || typeof property.name !== 'string') {
        errors.push(`Property ${index + 1}: name is required and must be a string`);
      } else if (property.name.trim().length === 0) {
        errors.push(`Property ${index + 1}: name cannot be empty`);
      }

      if (!property.type || typeof property.type !== 'string') {
        errors.push(`Property ${index + 1}: type is required and must be a string`);
      } else if (!validPropertyTypes.includes(property.type)) {
        errors.push(`Property ${index + 1}: type must be one of: ${validPropertyTypes.join(', ')}`);
      }

      if (!property.description || typeof property.description !== 'string') {
        errors.push(`Property ${index + 1}: description is required and must be a string`);
      } else if (property.description.trim().length === 0) {
        errors.push(`Property ${index + 1}: description cannot be empty`);
      } else if (property.description.length > 300) {
        warnings.push(`Property ${index + 1}: description is quite long`);
      }
    });
  }

  // Validate notes (optional)
  if (template.notes !== undefined) {
    if (typeof template.notes !== 'string') {
      errors.push('Notes must be a string if provided');
    } else if (template.notes.length > 1000) {
      warnings.push('Notes are quite long');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Environment validation
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  const requiredEnvVars = ['HF_API_KEY'];
  const optionalEnvVars = ['GITHUB_TOKEN'];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`Required environment variable ${envVar} is not set`);
    }
  }

  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(`Optional environment variable ${envVar} is not set`);
    }
  }

  // Validate API key format
  if (process.env.HF_API_KEY) {
    if (!process.env.HF_API_KEY.startsWith('hf_')) {
      errors.push('HF_API_KEY should start with "hf_"');
    }
    if (process.env.HF_API_KEY.length < 20) {
      warnings.push('HF_API_KEY seems too short');
    }
  }

  if (process.env.GITHUB_TOKEN) {
    if (!process.env.GITHUB_TOKEN.startsWith('ghp_') && !process.env.GITHUB_TOKEN.startsWith('gho_')) {
      warnings.push('GITHUB_TOKEN should start with "ghp_" or "gho_"');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Rate limiting validation
export function validateRateLimit(
  ip: string,
  requestCount: number,
  windowMs: number,
  maxRequests: number
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!ip || ip === 'unknown') {
    warnings.push('Unable to determine client IP for rate limiting');
  }

  if (requestCount > maxRequests) {
    errors.push(`Rate limit exceeded: ${requestCount}/${maxRequests} requests in ${windowMs}ms`);
  } else if (requestCount > maxRequests * 0.8) {
    warnings.push(`Approaching rate limit: ${requestCount}/${maxRequests} requests`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Content sanitization
export function sanitizeContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/eval\s*\(/gi, '')
    .replace(/function\s*\(/gi, '')
    .replace(/import\s+/gi, '')
    .replace(/require\s*\(/gi, '')
    .trim();
}

// JSON validation with detailed error reporting
export function validateJSON(jsonString: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const parsed = JSON.parse(jsonString);
    
    if (typeof parsed !== 'object' || parsed === null) {
      errors.push('JSON must be an object');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    errors.push(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      isValid: false,
      errors,
      warnings
    };
  }
}
