export interface WeatherData {
    hourly: {
        time: string[]
        precipitation_probability: number[]
        temperature_2m: number[]
    }
}

let cachedWeather: WeatherData | null = null
let lastFetch = 0

export async function getForecast(lat: number = 40.7128, lon: number = -74.0060): Promise<WeatherData | null> {
    const now = Date.now()
    if (cachedWeather && now - lastFetch < 1000 * 60 * 60) { // 1 hour cache
        return cachedWeather
    }

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation_probability,temperature_2m&forecast_days=7`
        const res = await fetch(url)
        const data = await res.json()
        cachedWeather = data
        lastFetch = now
        return data
    } catch (e) {
        console.error('Weather fetch failed', e)
        return null
    }
}

export function isWeatherSuitable(start: Date, weather: WeatherData | null, constraint?: string): boolean {
    if (!constraint || constraint === 'none' || !weather) return true

    const hourStr = start.toISOString().substring(0, 14) + '00' // Format like "2026-03-03T22:00"
    const idx = weather.hourly.time.findIndex(t => t.startsWith(hourStr.substring(0, 13)))

    if (idx === -1) return true // No data, assume okay

    const rainProb = weather.hourly.precipitation_probability[idx]
    const temp = weather.hourly.temperature_2m[idx]

    if (constraint === 'outdoor') {
        // Not suitable if rain > 30% or temp < 0 or temp > 35
        if (rainProb > 30) return false
        if (temp < 0 || temp > 35) return false
    }

    if (constraint === 'clear') {
        if (rainProb > 10) return false
    }

    return true
}
