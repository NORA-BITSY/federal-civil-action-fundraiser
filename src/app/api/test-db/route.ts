import { NextResponse } from 'next/server';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return NextResponse.json({
      error: 'DATABASE_URL not found',
      env: process.env
    });
  }

  // Mask the password for security
  const maskedUrl = dbUrl.replace(/:([^:@]{4})[^:@]*@/, ':$1****@');

  return NextResponse.json({
    database_url: maskedUrl,
    has_user: dbUrl.includes('://') && dbUrl.split('://')[1].includes(':'),
    has_password: dbUrl.includes(':') && dbUrl.includes('@'),
    has_host: dbUrl.includes('@') && dbUrl.includes('/'),
    database_name: dbUrl.split('/').pop()?.split('?')[0]
  });
}
