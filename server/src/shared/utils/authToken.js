import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAuthToken(userId) {
  return jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

export function verifyAuthToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
