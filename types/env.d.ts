declare namespace NodeJS {
  interface ProcessEnv {
    // App
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_APP_NAME: string;
    NEXT_PUBLIC_APP_DESCRIPTION: string;

    // Authentication
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;

    // API
    NEXT_PUBLIC_API_URL: string;

    // Feature Flags
    NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN: string;
    NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION: string;

    // Analytics (optional)
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?: string;

    // Content
    NEXT_PUBLIC_MAX_COMMENT_LENGTH: string;
  }
} 