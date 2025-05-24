import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
  isLoggedIn: boolean;
  user: { userId: string; name: string; email: string; role: "job-seeker" | "recruiter" } | null;
  login: (user: { userId: string; name: string; email: string; role: "job-seeker" | "recruiter" }) => void;
  logout: () => void;
}

export const useAuthStore = create<UserState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      login: (user) => set({ isLoggedIn: true, user }),
      logout: () => set({ isLoggedIn: false, user: null }),
    }),
    {
      name: 'auth-store', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
); 