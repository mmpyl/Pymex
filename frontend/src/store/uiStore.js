import { create } from 'zustand';

export const useUIStore = create((set) => ({
  theme: localStorage.getItem('theme') || 'light',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },
  toggleTheme: () => set((state) => {
    const next = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    return { theme: next };
  })
}));
