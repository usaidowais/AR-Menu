import { UIPreset } from "@/lib/types";

/**
 * Merges a Global Preset with Local Restaurant Overrides.
 * 
 * Logic:
 * 1. Start with Global Preset (Base).
 * 2. Overwrite with any keys found in Local Overrides (JSONB).
 * 3. Return the final flat object used by the UI.
 * 
 * @param globalPreset The base styling definition (from Global Presets table/data).
 * @param localOverrides The specific restaurant's JSONB overrides (from restaurant.theme_settings).
 */
export function getFinalTheme(globalPreset: Partial<UIPreset>, localOverrides?: Record<string, any> | null): Partial<UIPreset> {
    if (!localOverrides || Object.keys(localOverrides).length === 0) {
        return globalPreset;
    }

    // Merge: Global first, then Local Overrides
    return {
        ...globalPreset,
        ...localOverrides
    };
}
