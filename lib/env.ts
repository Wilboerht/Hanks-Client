/**
 * Environment variable configuration with validation
 */

// App
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'My Blog App';
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'A modern blog application with Next.js';

// API
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Feature Flags
export const ENABLE_SOCIAL_LOGIN = process.env.NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN === 'true';
export const ENABLE_EMAIL_VERIFICATION = process.env.NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION === 'true';

// Analytics
export const GOOGLE_ANALYTICS_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '';

// Content
export const MAX_COMMENT_LENGTH = parseInt(process.env.NEXT_PUBLIC_MAX_COMMENT_LENGTH || '500', 10);

// Validation
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
];

// Check for missing required environment variables in development
if (process.env.NODE_ENV === 'development') {
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    console.warn(
      `⚠️ Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }
} 