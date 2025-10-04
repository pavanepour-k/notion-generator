import { NextResponse } from "next/server";
import { SYSTEM_PROMPT, userPrompt } from "@/lib/prompt";

export const runtime = "edge";

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Input validation and sanitization
function validatePrompt(prompt: string): { isValid: boolean; error?: string } {
  if (!prompt || typeof prompt !== "string") {
    return { isValid: false, error: "Prompt is required and must be a string" };
  }
  
  if (prompt.length < 3) {
    return { isValid: false, error: "Prompt must be at least 3 characters long" };
  }
  
  if (prompt.length > 1000) {
    return { isValid: false, error: "Prompt must be less than 1000 characters" };
  }
  
  // Check for potentially malicious content
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /function\s*\(/i
  ];
  
  if (dangerousPatterns.some(pattern => pattern.test(prompt))) {
    return { isValid: false, error: "Invalid characters detected in prompt" };
  }
  
  return { isValid: true };
}

// Rate limiting function
function checkRateLimit(ip: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, error: "Rate limit exceeded. Please try again later." };
  }
  
  userLimit.count++;
  return { allowed: true };
}

// Get client IP for rate limiting
function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");
  return forwarded?.split(",")[0] || realIP || "unknown";
}

// Secure JSON parsing with error handling
function safeJSONParse(text: string): any {
  try {
    // Remove any potential script tags or dangerous content
    const cleanedText = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Extract JSON from the text more robustly
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("JSON parsing error:", error);
    return { 
      title: "Template Generation Error", 
      sections: [], 
      properties: [], 
      notes: "Failed to parse AI response. Please try again." 
    };
  }
}

export async function POST(req: Request) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(req);
    
    // Check rate limit
    const rateLimitCheck = checkRateLimit(clientIP);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: rateLimitCheck.error }, 
        { status: 429 }
      );
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON in request body" }, 
        { status: 400 }
      );
    }

    const { prompt } = requestBody;
    
    // Validate prompt
    const validation = validatePrompt(prompt);
    if (!validation.isValid) {
      return NextResponse.json(
        { ok: false, error: validation.error }, 
        { status: 400 }
      );
    }

    // Check for API key
    const HF_API_KEY = process.env.HF_API_KEY;
    if (!HF_API_KEY) {
      console.error("Missing HF_API_KEY environment variable");
      return NextResponse.json(
        { ok: false, error: "Service temporarily unavailable" }, 
        { status: 500 }
      );
    }

    // Use more reliable models with fallback options
    const models = [
      "microsoft/DialoGPT-medium",
      "gpt2",
      "distilbert-base-uncased"
    ];
    
    const model = models[0]; // Primary model

    // Prepare request body with timeout
    const hfRequestBody = {
      inputs: `${SYSTEM_PROMPT}\n\n${userPrompt(prompt)}`,
      options: { 
        wait_for_model: true,
        max_new_tokens: 500, // Limit output length
        temperature: 0.7,
        do_sample: true
      }
    };

    // Make request with timeout and proper error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
        "User-Agent": "Notionify/1.0"
      },
      body: JSON.stringify(hfRequestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hugging Face API error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return NextResponse.json(
          { ok: false, error: "AI service is busy. Please try again in a moment." }, 
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { ok: false, error: "AI service temporarily unavailable" }, 
        { status: 503 }
      );
    }

    const data = await response.json();

    // Handle different response formats from Hugging Face
    let generatedText: string;
    
    if (Array.isArray(data) && data[0]?.generated_text) {
      generatedText = data[0].generated_text;
    } else if (typeof data === "string") {
      generatedText = data;
    } else if (data.error) {
      console.error("Hugging Face API error:", data.error);
      return NextResponse.json(
        { ok: false, error: "AI service error. Please try again." }, 
        { status: 503 }
      );
    } else {
      generatedText = JSON.stringify(data);
    }

    // Safely parse the JSON response
    const template = safeJSONParse(generatedText);

    // Validate the template structure
    if (!template.title || !Array.isArray(template.sections) || !Array.isArray(template.properties)) {
      console.warn("Invalid template structure received:", template);
      return NextResponse.json(
        { ok: false, error: "Invalid template generated. Please try again." }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, template });
    
  } catch (error: any) {
    console.error("API error:", error);
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { ok: false, error: "Request timeout. Please try again." }, 
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { ok: false, error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
