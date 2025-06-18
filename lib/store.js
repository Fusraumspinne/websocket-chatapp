import { create } from "zustand";

export const useUserStore = create((set) => ({
  userName: "",
  setUserName: (userName) => set({ userName }),
}));