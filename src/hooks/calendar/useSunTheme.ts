import { useEffect } from 'react'

const getSunThemeColors = (hour: number) => {
    if (hour >= 5 && hour < 9) {
        // Sunrise: Bright yellows and soft oranges
        return {
            '--socal-grad-1': '#fde047',
            '--socal-grad-2': '#f97316',
            '--socal-text-contrast': '#000000',
            '--celestial-orb-color': '#fff7ed',
            '--celestial-orb-glow': '#f97316',
            '--celestial-orb-x': '15%',
            '--celestial-orb-y': '75%'
        }
    } else if (hour >= 9 && hour < 16) {
        // Midday: Clear skies and bright sun
        return {
            '--socal-grad-1': '#38bdf8',
            '--socal-grad-2': '#fbbf24',
            '--socal-text-contrast': '#000000',
            '--celestial-orb-color': '#fff',
            '--celestial-orb-glow': '#fffbe0',
            '--celestial-orb-x': '50%',
            '--celestial-orb-y': '25%'
        }
    } else if (hour >= 16 && hour < 20) {
        // Sunset: Deep oranges and magentas
        return {
            '--socal-grad-1': '#f97316',
            '--socal-grad-2': '#be185d',
            '--socal-text-contrast': '#ffffff',
            '--celestial-orb-color': '#ffedd5',
            '--celestial-orb-glow': '#9a3412',
            '--celestial-orb-x': '85%',
            '--celestial-orb-y': '70%'
        }
    } else {
        // Night: Deep indigos and purples
        return {
            '--socal-grad-1': '#4c1d95',
            '--socal-grad-2': '#1e3a8a',
            '--socal-text-contrast': '#ffffff',
            '--celestial-orb-color': '#eef2ff',
            '--celestial-orb-glow': '#4338ca',
            '--celestial-orb-x': '70%',
            '--celestial-orb-y': '35%'
        }
    }
}

export function useSunTheme() {
    useEffect(() => {
        const updateTheme = () => {
            const hour = new Date().getHours()
            const colors = getSunThemeColors(hour)
            Object.entries(colors).forEach(([key, value]) => {
                document.documentElement.style.setProperty(key, value)
            })
        }

        updateTheme() // Initial run
        const interval = setInterval(updateTheme, 60000) // Re-check every minute
        return () => clearInterval(interval)
    }, [])
}
