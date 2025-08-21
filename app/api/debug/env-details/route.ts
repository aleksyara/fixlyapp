import { NextResponse } from 'next/server';

export async function GET() {
  const keyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  
  if (!keyRaw) {
    return NextResponse.json({
      error: 'GOOGLE_SERVICE_ACCOUNT_KEY is not set'
    }, { status: 500 });
  }
  
  // Analyze the key format without exposing the full content
  const analysis = {
    length: keyRaw.length,
    startsWithBegin: keyRaw.includes('-----BEGIN PRIVATE KEY-----'),
    endsWithEnd: keyRaw.includes('-----END PRIVATE KEY-----'),
    hasNewlines: keyRaw.includes('\n'),
    hasEscapedNewlines: keyRaw.includes('\\n'),
    hasQuotes: keyRaw.startsWith('"') || keyRaw.startsWith("'"),
    endsWithQuotes: keyRaw.endsWith('"') || keyRaw.endsWith("'"),
    first50Chars: keyRaw.substring(0, 50),
    last50Chars: keyRaw.substring(keyRaw.length - 50),
    containsSpaces: keyRaw.includes(' '),
    containsTabs: keyRaw.includes('\t'),
    newlineCount: (keyRaw.match(/\\n/g) || []).length,
    actualNewlineCount: (keyRaw.match(/\n/g) || []).length,
    // Show the structure without revealing the key content
    structure: {
      beforeBegin: keyRaw.indexOf('-----BEGIN PRIVATE KEY-----') > 0 ? 'YES' : 'NO',
      afterEnd: keyRaw.indexOf('-----END PRIVATE KEY-----') < keyRaw.length - 25 ? 'YES' : 'NO',
      contentLength: keyRaw.includes('-----BEGIN PRIVATE KEY-----') && keyRaw.includes('-----END PRIVATE KEY-----') 
        ? keyRaw.substring(
            keyRaw.indexOf('-----BEGIN PRIVATE KEY-----') + 27,
            keyRaw.indexOf('-----END PRIVATE KEY-----')
          ).length 
        : 'N/A'
    }
  };
  
  return NextResponse.json({
    message: 'Private key format analysis',
    analysis,
    suggestions: [
      'If hasEscapedNewlines is true but hasNewlines is false, the key needs newline conversion',
      'If startsWithBegin is false, the key might be base64 encoded or corrupted',
      'If containsSpaces is true, there might be extra whitespace',
      'If hasQuotes is true, the quotes need to be removed',
      'The key should start with "-----BEGIN PRIVATE KEY-----" and end with "-----END PRIVATE KEY-----"',
      'The content between headers should be properly formatted with newlines'
    ]
  });
}
