// Vercel Serverless Function: /api/config
// Serves Firebase configuration from environment variables.
// The actual keys are stored in Vercel Dashboard → Settings → Environment Variables.
// They are NEVER exposed in source code or git history.

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Security: Never cache this response
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Build config from environment variables (set in Vercel Dashboard)
  const config = {
    apiKey:            process.env.FIREBASE_API_KEY,
    authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.FIREBASE_PROJECT_ID,
    storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.FIREBASE_APP_ID,
    measurementId:     process.env.FIREBASE_MEASUREMENT_ID,
  };

  // Validate required fields are present
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing  = required.filter(k => !config[k]);

  if (missing.length > 0) {
    console.error('Missing Firebase env vars:', missing);
    return res.status(500).json({
      error: 'Firebase configuration is incomplete. Set environment variables in Vercel Dashboard.',
      missing,
    });
  }

  return res.status(200).json(config);
}
