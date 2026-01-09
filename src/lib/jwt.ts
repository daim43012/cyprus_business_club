import { SignJWT, jwtVerify  } from 'jose';
import "dotenv/config";

const AUTH_SECRET = new TextEncoder().encode(process.env.AUTH_JWT_SECRET!);

export async function signJwt(payload: { uid: string; email: string }): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(AUTH_SECRET);
}

export async function verifyJwt(token: string): Promise<{ uid: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, AUTH_SECRET);
    return payload as { uid: string; email: string };
  } catch (err) {
    console.error('JWT verification failed:', err);
    return null;
  }
}