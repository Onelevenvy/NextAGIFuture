import { create } from "zustand";

interface LocaleStore {
  localValue: string | null;
  setLocalValue: (teamId: string | null) => void;
}

const useLocaleStore = create<LocaleStore>((set) => ({
  localValue: "en-US",
  setLocalValue: (localValue) => set(() => ({ localValue })),
}));

export default useLocaleStore;
