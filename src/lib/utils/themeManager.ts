import { ThemeConfig } from '@/lib/types';

export const DEFAULT_THEME: ThemeConfig = {
    primaryColor: '#001f3f',
    secondaryColor: '#000000',
    backgroundColor: '#F8F9FA',
    surfaceColor: '#FFFFFF',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    textColor: '#000000'
};

/**
 * Computes the active theme based purely on local settings.
 * Global Presets have been decommissioned.
 * 
 * @param localSettings The specific restaurant's JSONB settings.
 */
export function computeActiveTheme(localSettings: any): ThemeConfig {
    // 1. If local settings exist and have keys, use them.
    if (localSettings && Object.keys(localSettings).length > 0) {
        // Return local settings merged with defaults to ensure completeness
        return {
            ...DEFAULT_THEME,
            ...localSettings
        };
    }

    // 2. Otherwise, return the Hardcoded System Default (Safety Net)
    return DEFAULT_THEME;
}
