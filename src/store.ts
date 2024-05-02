import { create } from "zustand";

interface AppState {
  fileData: any[];
  setFileData: (value: any) => void;
}

const useAppStore = create<AppState>()((set) => ({
  fileData: [],
  setFileData: (value) => set(() => ({ fileData: value })),
}));

export default useAppStore;
