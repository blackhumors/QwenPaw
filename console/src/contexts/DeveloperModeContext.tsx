import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  getSimplifiedMode,
  setSimplifiedMode as setSimplifiedModeApi,
} from "../api/modules/settings";

interface DeveloperModeContextValue {
  developerMode: boolean;
  loaded: boolean;
  setDeveloperMode: (enabled: boolean) => Promise<void>;
}

const DeveloperModeContext = createContext<DeveloperModeContextValue>({
  developerMode: false,
  loaded: false,
  setDeveloperMode: async () => {},
});

export function DeveloperModeProvider({ children }: { children: ReactNode }) {
  const [developerMode, setDeveloperModeState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSimplifiedMode()
      .then((res) => {
        setDeveloperModeState(!!res.developer_mode);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const setDeveloperMode = useCallback(async (enabled: boolean) => {
    setDeveloperModeState(enabled);
    try {
      await setSimplifiedModeApi(!enabled, enabled);
    } catch {
      // revert on failure
      setDeveloperModeState((prev) => !prev);
    }
  }, []);

  return (
    <DeveloperModeContext.Provider
      value={{ developerMode, loaded, setDeveloperMode }}
    >
      {children}
    </DeveloperModeContext.Provider>
  );
}

export function useDeveloperMode(): DeveloperModeContextValue {
  return useContext(DeveloperModeContext);
}
