import { User, AuthResponse } from '../types';
import { databaseService } from './databaseService';

const STORAGE_KEY_SESSION = 'innometria_session';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Register new user into DB with full profile
  register: async (userData: Partial<User> & { password?: string }): Promise<AuthResponse> => {
    await delay(800); 

    // Check email existence only if password is provided (Direct Registration)
    // For Google completion flow, we might assume the email is verified or check duplicate logic in UI
    if (userData.password) {
        const existingUser = databaseService.users.findByEmail(userData.email || '');
        if (existingUser) {
        throw new Error('Email já cadastrado.');
        }
    }

    // Use provided avatar (from Google) or generate a random one based on name
    const finalAvatar = userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=random`;

    const newUser = {
      id: crypto.randomUUID(),
      role: 'user', // Default
      password: userData.password || 'google_oauth_placeholder',
      avatar: finalAvatar,
      ...userData
    };

    databaseService.users.add(newUser);

    // Auto login
    const { password: _, ...userWithoutPass } = newUser;
    const session = { user: userWithoutPass as User, token: 'mock-jwt-' + Date.now() };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));

    return session;
  },

  // Login checking against DB
  login: async (email: string, password: string): Promise<AuthResponse> => {
    await delay(800);

    const user = databaseService.users.findByEmail(email);

    if (!user || user.password !== password) {
      throw new Error('Credenciais inválidas.');
    }

    const { password: _, ...safeUser } = user;
    const session = { user: safeUser as User, token: 'mock-jwt-' + Date.now() };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));

    return session;
  },

  // Simulate obtaining Google User Data (Does NOT login automatically if new)
  getGoogleUserObj: async (): Promise<{ name: string, email: string, avatar: string }> => {
    await delay(1500);
    // Returns a consistent mock identity to allow testing persistence across reloads
    return {
        name: "Usuário Google",
        email: "usuario.demo@gmail.com",
        avatar: "https://ui-avatars.com/api/?name=Google+User&background=DB4437&color=fff&bold=true"
    };
  },

  // Check if user exists in DB
  checkUserExists: (email: string): User | undefined => {
      const user = databaseService.users.findByEmail(email);
      if (user) {
          const { password: _, ...safeUser } = user;
          return safeUser as User;
      }
      return undefined;
  },

  // Force login for existing Google user
  createSession: (user: User): AuthResponse => {
    const session = { user, token: 'mock-google-token-' + Date.now() };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    return session;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  },

  getSession: (): User | null => {
    const sessionStr = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!sessionStr) return null;
    try {
      const session = JSON.parse(sessionStr);
      return session.user;
    } catch {
      return null;
    }
  },

  getAllUsers: (): User[] => {
    const users = databaseService.users.getAll();
    return users.map(({ password, ...user }: any) => user);
  }
};