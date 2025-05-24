import { ConvexError } from "convex/values";

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64(hash);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

export function validateName(name: string): boolean {
  return name.length >= 2;
}

export function throwIfNotAuthorized(condition: boolean, message: string = "Not authorized") {
  if (!condition) {
    throw new ConvexError(message);
  }
}