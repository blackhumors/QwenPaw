import { useEffect, useState, useCallback } from "react";
import { providerApi } from "../../api/modules/provider";
import type { ProviderInfo } from "../../api/types";
import OnboardingModal from "./index";

export default function OnboardingGate() {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [checked, setChecked] = useState(false);

  const check = useCallback(async () => {
    try {
      const [active, list] = await Promise.all([
        providerApi.getActiveModels({ scope: "global" }),
        providerApi.listProviders(),
      ]);
      const hasActive = Boolean(
        active?.active_llm?.provider_id && active?.active_llm?.model,
      );
      const hasAnyKey = list.some(
        (p) =>
          !p.is_local && p.require_api_key && p.api_key && p.api_key.length > 0,
      );
      setProviders(list);
      setNeedsOnboarding(!hasActive && !hasAnyKey);
    } catch {
      setNeedsOnboarding(false);
    } finally {
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  if (!checked || !needsOnboarding) return null;

  return (
    <OnboardingModal
      open={needsOnboarding}
      providers={providers}
      onComplete={() => setNeedsOnboarding(false)}
    />
  );
}
