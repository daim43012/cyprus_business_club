import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { OAuth2Client } from 'google-auth-library';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '/opt/cbc/.env' });

const clientId = process.env.GOOGLE_CLIENT_ID!;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
const redirectUri = process.env.GOOGLE_CALLBACK_URL!;

let _client: OAuth2Client | null = null;

export function getGoogleClient(): OAuth2Client {
  if (_client) return _client;
  _client = new OAuth2Client(clientId, clientSecret, redirectUri);
  return _client;
}

export function getGoogleAuthUrl(state?: string): string {
  const client = getGoogleClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['openid', 'email', 'profile'],
    state
  });
}
