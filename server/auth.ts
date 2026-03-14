import bcrypt from 'bcryptjs';
import { getUserByUsername, createUser, updateUserPassword, type DbUser } from './db';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerUser(username: string, password: string): Promise<{ success: boolean; error?: string; userId?: number }> {
  if (!username || username.length < 3 || username.length > 20) {
    return { success: false, error: 'Username must be 3-20 characters' };
  }
  
  if (!password || password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { success: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  
  const existingUser = getUserByUsername(username);
  if (existingUser) {
    return { success: false, error: 'Username already taken' };
  }
  
  const passwordHash = await hashPassword(password);
  const userId = createUser(username, passwordHash);
  
  return { success: true, userId };
}

export async function loginUser(username: string, password: string): Promise<{ success: boolean; error?: string; user?: DbUser }> {
  const user = getUserByUsername(username);
  
  if (!user) {
    return { success: false, error: 'Invalid username or password' };
  }
  
  if (user.status === 'banned') {
    return { success: false, error: 'This account has been banned. Visit the Cancelled User Museum for details.' };
  }
  
  if (!user.password_hash) {
    return { success: false, error: 'This is a demo account. Please register your own account.' };
  }
  
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return { success: false, error: 'Invalid username or password' };
  }
  
  return { success: true, user };
}

export async function setAdminPassword(password: string): Promise<void> {
  const admin = getUserByUsername('Administrator');
  if (admin) {
    const hash = await hashPassword(password);
    updateUserPassword(admin.id, hash);
  }
}
