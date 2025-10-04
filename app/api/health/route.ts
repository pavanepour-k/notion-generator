import { NextResponse } from "next/server";
import { validateEnvironment } from "@/lib/validation";

export const runtime = "edge";

// Edge-compatible uptime tracking
let startTime = Date.now();

export async function GET() {
  try {
    const envValidation = validateEnvironment();

    // Check external dependencies
    const dependencies = {
      huggingFace: await checkHuggingFaceHealth(),
      github: await checkGitHubHealth()
    };

    const overallStatus = envValidation.isValid && 
                         dependencies.huggingFace && 
                         dependencies.github ? 'healthy' : 'degraded';

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - startTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: {
        isValid: envValidation.isValid,
        errors: envValidation.errors,
        warnings: envValidation.warnings
      },
      dependencies
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 500 });
  }
}

async function checkHuggingFaceHealth(): Promise<boolean> {
  try {
    const response = await fetch('https://api-inference.huggingface.co/status', {
      method: 'GET',
      headers: {
        'User-Agent': 'Notionify/1.0'
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function checkGitHubHealth(): Promise<boolean> {
  try {
    const response = await fetch('https://api.github.com/zen', {
      method: 'GET',
      headers: {
        'User-Agent': 'Notionify/1.0'
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}
