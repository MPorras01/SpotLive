import { create } from 'zustand';

interface ActiveAlert {
  id: string;
  type: string;
  message: string;
}

interface AlertStore {
  activeAlerts: ActiveAlert[];
  setActiveAlerts: (alerts: ActiveAlert[]) => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  activeAlerts: [],
  setActiveAlerts: (activeAlerts) => set({ activeAlerts }),
}));
