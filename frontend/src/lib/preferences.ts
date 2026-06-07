export type AppPreferences = {
  microAnimations: boolean;
};

const STORAGE_KEY = 'apparel-cloud-prefs';

const defaults: AppPreferences = {
  microAnimations: true,
};

export function loadPreferences(): AppPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

export function savePreferences(partial: Partial<AppPreferences>): AppPreferences {
  const next = { ...loadPreferences(), ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  applyPreferences(next);
  return next;
}

export function applyPreferences(prefs: AppPreferences): void {
  document.documentElement.classList.toggle('no-micro-animations', !prefs.microAnimations);
}

export const FOCUS_SEARCH_EVENT = 'apparel:focus-search';

export function triggerGlobalSearch(): void {
  window.dispatchEvent(new CustomEvent(FOCUS_SEARCH_EVENT));
}
