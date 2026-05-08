import jwt from "jsonwebtoken";

import { AUTH_TOKEN_TTL } from "@/lib/auth/constants";

type JwtPayload = {
  sub: string;
  email: string;
  name: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

export function signAuthToken(payload: JwtPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: AUTH_TOKEN_TTL,
  });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}
