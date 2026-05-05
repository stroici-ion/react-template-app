import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    applyTheme,
    getStoredTheme,
    resolveTheme,
    storeTheme,
    watchSystemTheme,
    type ResolvedTheme,
    type Theme,
} from '../utils/theme';

interface ThemeContextValue {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'light' }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(() => getStoredTheme() ?? defaultTheme);
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(getStoredTheme() ?? defaultTheme));

    useEffect(() => {
        setResolvedTheme(applyTheme(theme));
    }, [theme]);

    useEffect(() => {
        if (theme !== 'system') return;
        return watchSystemTheme((resolved) => {
            const root = document.documentElement;
            if (resolved === 'dark') root.classList.add('dark');
            else root.classList.remove('dark');
            setResolvedTheme(resolved);
        });
    }, [theme]);

    const setTheme = useCallback((next: Theme) => {
        storeTheme(next);
        setThemeState(next);
    }, []);

    const value = useMemo<ThemeContextValue>(
        () => ({ theme, resolvedTheme, setTheme }),
        [theme, resolvedTheme, setTheme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return ctx;
}
