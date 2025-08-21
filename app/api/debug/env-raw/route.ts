import { NextResponse } from 'next/server';

export async function GET() {
  const keyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  
  if (!keyRaw) {
    return NextResponse.json({
      error: 'GOOGLE_SERVICE_ACCOUNT_KEY is not set'
    }, { status: 500 });
  }
  
  // Check key format without exposing the full key
  const keyInfo = {
    length: keyRaw.length,
    startsWithBegin: keyRaw.includes('-----BEGIN PRIVATE KEY-----'),
    endsWithEnd: keyRaw.includes('-----END PRIVATE KEY-----'),
    hasNewlines: keyRaw.includes('\n'),
    hasEscapedNewlines: keyRaw.includes('\\n'),
    first50Chars: keyRaw.substring(0, 50),
    last50Chars: keyRaw.substring(keyRaw.length - 50),
    containsSpaces: keyRaw.includes(' '),
    containsTabs: keyRaw.includes('\t'),
  };
  
  return NextResponse.json({
    message: 'Private key format analysis',
    keyInfo,
    suggestions: [
      'If hasEscapedNewlines is true but hasNewlines is false, the key needs newline conversion',
      'If startsWithBegin is false, the key might be base64 encoded or corrupted',
      'If containsSpaces is true, there might be extra whitespace',
      'The key should start with "-----BEGIN PRIVATE KEY-----" and end with "-----END PRIVATE KEY-----"'
    ]
  });
}
