import { NextResponse } from "next/server";

export const runtime = "edge";

// Rate limiting for save endpoint
const SAVE_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const SAVE_RATE_LIMIT_MAX_REQUESTS = 5; // Lower limit for save operations
const saveRateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Validate and sanitize content
function validateContent(content: any): { isValid: boolean; sanitized?: string; error?: string } {
  if (!content) {
    return { isValid: false, error: "Content is required" };
  }

  let contentString: string;
  
  if (typeof content === "string") {
    contentString = content;
  } else if (typeof content === "object") {
    try {
      contentString = JSON.stringify(content, null, 2);
    } catch (error) {
      return { isValid: false, error: "Invalid content format" };
    }
  } else {
    return { isValid: false, error: "Content must be a string or object" };
  }

  // Size limit (1MB max)
  if (contentString.length > 1024 * 1024) {
    return { isValid: false, error: "Content too large (max 1MB)" };
  }

  // Validate it's valid JSON if it looks like JSON
  if (contentString.trim().startsWith('{') || contentString.trim().startsWith('[')) {
    try {
      JSON.parse(contentString);
    } catch (error) {
      return { isValid: false, error: "Invalid JSON format" };
    }
  }

  // Sanitize content - remove potentially dangerous content
  const sanitized = contentString
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/eval\s*\(/gi, '')
    .replace(/function\s*\(/gi, '');

  return { isValid: true, sanitized };
}

// Rate limiting function for save operations
function checkSaveRateLimit(ip: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  const userLimit = saveRateLimitMap.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    saveRateLimitMap.set(ip, { count: 1, resetTime: now + SAVE_RATE_LIMIT_WINDOW });
    return { allowed: true };
  }
  
  if (userLimit.count >= SAVE_RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, error: "Save rate limit exceeded. Please try again later." };
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

export async function POST(req: Request) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(req);
    
    // Check rate limit
    const rateLimitCheck = checkSaveRateLimit(clientIP);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: rateLimitCheck.error }, 
        { status: 429 }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON in request body" }, 
        { status: 400 }
      );
    }

    const { content } = requestBody;

    // Validate and sanitize content
    const validation = validateContent(content);
    if (!validation.isValid) {
      return NextResponse.json(
        { ok: false, error: validation.error }, 
        { status: 400 }
      );
    }

    // Check for GitHub token
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      console.error("Missing GITHUB_TOKEN environment variable");
      return NextResponse.json(
        { ok: false, error: "Save service temporarily unavailable" }, 
        { status: 503 }
      );
    }

    // Generate secure filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const filename = `notion-template-${timestamp}-${randomId}.json`;

    // Prepare gist data
    const gistData = {
      description: `Notionify Template - ${new Date().toISOString()}`,
      public: true,
      files: {
        [filename]: {
          content: validation.sanitized
        }
      }
    };

    // Create gist with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "Notionify/1.0",
        "Accept": "application/vnd.github.v3+json"
      },
      body: JSON.stringify(gistData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GitHub API error: ${response.status} - ${errorText}`);
      
      if (response.status === 401) {
        return NextResponse.json(
          { ok: false, error: "Authentication failed" }, 
          { status: 401 }
        );
      }
      
      if (response.status === 403) {
        return NextResponse.json(
          { ok: false, error: "Rate limit exceeded for save service" }, 
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { ok: false, error: "Save service temporarily unavailable" }, 
        { status: 503 }
      );
    }

    const data = await response.json();
    
    if (!data.html_url) {
      console.error("Unexpected response from GitHub API:", data);
      return NextResponse.json(
        { ok: false, error: "Failed to create shareable link" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      url: data.html_url,
      id: data.id 
    });
    
  } catch (error: any) {
    console.error("Save API error:", error);
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { ok: false, error: "Save request timeout. Please try again." }, 
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { ok: false, error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
