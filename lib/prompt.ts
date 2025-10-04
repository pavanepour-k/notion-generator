export const SYSTEM_PROMPT = `You are an expert Notion template architect with deep knowledge of productivity systems, project management, and organizational structures. Your task is to create comprehensive, practical Notion page templates that users can immediately implement.

CRITICAL REQUIREMENTS:
1. Output ONLY valid JSON - no explanations, no markdown, no additional text
2. Create templates that are immediately actionable and practical
3. Consider real-world use cases and workflows
4. Include relevant properties and sections that enhance productivity

JSON STRUCTURE (STRICT FORMAT):
{
  "title": "Clear, descriptive template name",
  "sections": [
    {
      "name": "Section name",
      "description": "Detailed description of what this section contains and how to use it"
    }
  ],
  "properties": [
    {
      "name": "Property name",
      "type": "Notion property type (text, select, multi-select, number, date, checkbox, url, email, phone, formula, relation, rollup, created_time, created_by, last_edited_time, last_edited_by, files, status)",
      "description": "Clear explanation of this property's purpose and usage"
    }
  ],
  "notes": "Optional implementation tips, best practices, or additional context"
}

GUIDELINES:
- Use appropriate Notion property types
- Include 3-8 sections that logically organize the content
- Include 5-15 properties that capture essential data
- Make descriptions actionable and specific
- Consider different user skill levels
- Focus on templates that solve real problems

EXAMPLES OF GOOD PROPERTY TYPES:
- "status" for task/project status
- "select" for categories with predefined options
- "multi-select" for tags
- "date" for deadlines, start dates
- "number" for priorities, scores, quantities
- "checkbox" for completion status
- "url" for links to external resources
- "relation" for connecting to other databases

Remember: Output ONLY the JSON object, nothing else.`;

export function userPrompt(purpose: string): string {
  return `Create a comprehensive Notion template for: "${purpose}"

Requirements:
- Make it practical and immediately usable
- Include all necessary sections and properties
- Consider different use cases and workflows
- Provide clear, actionable descriptions
- Use appropriate Notion property types

Output only the JSON template structure.`;
}

// Enhanced prompt for specific template types
export function getEnhancedPrompt(purpose: string, templateType?: string): string {
  const basePrompt = userPrompt(purpose);
  
  if (templateType) {
    const typeSpecificGuidance = getTypeSpecificGuidance(templateType);
    return `${basePrompt}\n\nTemplate Type: ${templateType}\n${typeSpecificGuidance}`;
  }
  
  return basePrompt;
}

function getTypeSpecificGuidance(templateType: string): string {
  const guidanceMap: Record<string, string> = {
    'project-management': 'Focus on task tracking, deadlines, team collaboration, and progress monitoring. Include status tracking, priority levels, and resource allocation.',
    'personal-productivity': 'Emphasize goal setting, habit tracking, time management, and personal organization. Include daily/weekly/monthly views.',
    'content-creation': 'Include content planning, publishing schedules, idea capture, and performance tracking. Consider different content types and platforms.',
    'learning-education': 'Focus on course tracking, note-taking, progress monitoring, and knowledge organization. Include study schedules and resource management.',
    'finance-budgeting': 'Include expense tracking, budget categories, financial goals, and investment monitoring. Consider different account types and currencies.',
    'health-fitness': 'Focus on workout tracking, nutrition logging, health metrics, and goal setting. Include progress visualization and habit formation.',
    'business-entrepreneur': 'Include customer management, sales tracking, business metrics, and growth planning. Consider different business models and stages.',
    'event-planning': 'Focus on timeline management, vendor coordination, guest management, and budget tracking. Include checklist and communication tools.',
    'research-knowledge': 'Emphasize source tracking, note organization, citation management, and knowledge synthesis. Include different research methodologies.',
    'creative-writing': 'Include idea capture, character development, plot tracking, and publishing workflow. Consider different writing stages and formats.'
  };
  
  return guidanceMap[templateType] || 'Create a comprehensive template that addresses the specific needs and workflows for this use case.';
}

// Template validation function
export function validateTemplate(template: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!template || typeof template !== 'object') {
    errors.push('Template must be an object');
    return { isValid: false, errors };
  }
  
  if (!template.title || typeof template.title !== 'string' || template.title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  }
  
  if (!Array.isArray(template.sections)) {
    errors.push('Sections must be an array');
  } else {
    template.sections.forEach((section: any, index: number) => {
      if (!section.name || typeof section.name !== 'string') {
        errors.push(`Section ${index + 1}: name is required and must be a string`);
      }
      if (!section.description || typeof section.description !== 'string') {
        errors.push(`Section ${index + 1}: description is required and must be a string`);
      }
    });
  }
  
  if (!Array.isArray(template.properties)) {
    errors.push('Properties must be an array');
  } else {
    const validPropertyTypes = [
      'text', 'select', 'multi-select', 'number', 'date', 'checkbox', 'url', 
      'email', 'phone', 'formula', 'relation', 'rollup', 'created_time', 
      'created_by', 'last_edited_time', 'last_edited_by', 'files', 'status'
    ];
    
    template.properties.forEach((property: any, index: number) => {
      if (!property.name || typeof property.name !== 'string') {
        errors.push(`Property ${index + 1}: name is required and must be a string`);
      }
      if (!property.type || typeof property.type !== 'string') {
        errors.push(`Property ${index + 1}: type is required and must be a string`);
      } else if (!validPropertyTypes.includes(property.type)) {
        errors.push(`Property ${index + 1}: type must be one of: ${validPropertyTypes.join(', ')}`);
      }
      if (!property.description || typeof property.description !== 'string') {
        errors.push(`Property ${index + 1}: description is required and must be a string`);
      }
    });
  }
  
  if (template.notes && typeof template.notes !== 'string') {
    errors.push('Notes must be a string if provided');
  }
  
  return { isValid: errors.length === 0, errors };
}
