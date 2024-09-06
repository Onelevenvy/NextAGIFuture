import { create } from "zustand";

interface LocaleStore {
  localeValue: string | null;
  setLocaleValue: (teamId: string | null) => void;
}

const useLocaleStore = create<LocaleStore>((set) => ({
  localeValue: "en-US",
  setLocaleValue: (localeValue) => set(() => ({ localeValue })),
}));

export default useLocaleStore;
