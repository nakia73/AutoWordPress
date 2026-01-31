import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Site {
  id: string;
  name: string;
  url: string;
  favicon?: string;
  status: 'active' | 'provisioning' | 'error';
  wpVersion?: string;
}

type ConnectionStatus = 'connected' | 'disconnected' | 'checking';

interface SiteStore {
  sites: Site[];
  currentSiteId: string | null;
  connectionStatus: ConnectionStatus;

  // Computed
  getCurrentSite: () => Site | null;

  // Actions
  setSites: (sites: Site[]) => void;
  addSite: (site: Site) => void;
  removeSite: (id: string) => void;
  selectSite: (id: string) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  updateSite: (id: string, updates: Partial<Site>) => void;
  checkConnection: () => void;
}

export const useSiteStore = create<SiteStore>()(
  persist(
    (set, get) => ({
      sites: [],
      currentSiteId: null,
      connectionStatus: 'disconnected',

      getCurrentSite: () => {
        const { sites, currentSiteId } = get();
        return sites.find((s) => s.id === currentSiteId) || null;
      },

      setSites: (sites) => {
        set({ sites });
        // 現在選択中のサイトがリストにない場合、最初のサイトを選択
        const { currentSiteId } = get();
        if (currentSiteId && !sites.find((s) => s.id === currentSiteId)) {
          set({ currentSiteId: sites[0]?.id || null });
        }
      },

      addSite: (site) => {
        set((state) => ({
          sites: [...state.sites, site],
        }));
      },

      removeSite: (id) => {
        set((state) => {
          const newSites = state.sites.filter((s) => s.id !== id);
          const newCurrentId = state.currentSiteId === id
            ? newSites[0]?.id || null
            : state.currentSiteId;
          return {
            sites: newSites,
            currentSiteId: newCurrentId,
          };
        });
      },

      selectSite: (id) => {
        const { sites } = get();
        if (sites.find((s) => s.id === id)) {
          set({ currentSiteId: id, connectionStatus: 'checking' });
          // 接続シミュレーション
          setTimeout(() => {
            set({ connectionStatus: 'connected' });
          }, 500);
        }
      },

      checkConnection: () => {
        const { currentSiteId } = get();
        if (!currentSiteId) {
          set({ connectionStatus: 'disconnected' });
          return;
        }
        set({ connectionStatus: 'checking' });
        // 接続確認シミュレーション
        setTimeout(() => {
          set({ connectionStatus: 'connected' });
        }, 800);
      },

      setConnectionStatus: (status) => {
        set({ connectionStatus: status });
      },

      updateSite: (id, updates) => {
        set((state) => ({
          sites: state.sites.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },
    }),
    {
      name: 'argo-site-store',
      partialize: (state) => ({
        currentSiteId: state.currentSiteId,
      }),
    }
  )
);
