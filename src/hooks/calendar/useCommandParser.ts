import { useMemo } from 'react'
import * as chrono from 'chrono-node'
import { setHours, setMinutes } from 'date-fns'
import { CalendarEvent, IntelligentSettings, resolveConflicts } from '../../lib/calendar-utils'
import { WeatherData } from '../../lib/weather-utils'

export function useCommandParser(
    commandInput: string,
    modalDateContext: Date | null,
    events: CalendarEvent[],
    settings: IntelligentSettings,
    weatherData: WeatherData | null
) {
    const parsedPreview = useMemo(() => {
        if (!commandInput.trim()) return null
        const refDate = modalDateContext || new Date()
        let tempTitle = commandInput

        const isGoal = tempTitle.toLowerCase().startsWith('goal:') || tempTitle.toLowerCase().startsWith('smart goal:')
        tempTitle = tempTitle.replace(/^(goal:|smart goal:)/i, '').trim()

        let start = refDate
        let hasTime = false
        let duration = 60
        let preferredTime: 'morning' | 'afternoon' | 'evening' | undefined = undefined
        let weatherConstraint: 'outdoor' | 'clear' | 'none' = 'none'
        let frequency: 'daily' | 'weekly' | 'monthly' | undefined = undefined
        let frequencyCount: number | undefined = undefined

        // Improved frequency detection: "every day", "daily", "3 times a week", "once a month"
        const freqCountMatch = tempTitle.match(/(\d+|once|twice)\s*times?\s*(a|per|every)?\s*(week|month|day|weekly|monthly|daily)/i)
        if (freqCountMatch) {
            const countStr = freqCountMatch[1].toLowerCase()
            const unitStr = freqCountMatch[3].toLowerCase()

            if (countStr === 'once') frequencyCount = 1
            else if (countStr === 'twice') frequencyCount = 2
            else frequencyCount = parseInt(countStr)

            if (unitStr.includes('day')) frequency = 'daily'
            else if (unitStr.includes('week')) frequency = 'weekly'
            else if (unitStr.includes('month')) frequency = 'monthly'

            tempTitle = tempTitle.replace(freqCountMatch[0], '').replace(/\s+/g, ' ').trim()
        } else {
            const simpleFreqMatch = tempTitle.match(/\bevery\s*day\b|\bdaily\b|\bweekly\b|\bevery\s+week\b/i)
            if (simpleFreqMatch) {
                const match = simpleFreqMatch[0].toLowerCase()
                if (match.includes('day') || match.includes('daily')) frequency = 'daily'
                else if (match.includes('week')) frequency = 'weekly'
                frequencyCount = 1
                tempTitle = tempTitle.replace(simpleFreqMatch[0], '').replace(/\s+/g, ' ').trim()
            }
        }

        const prefMatch = tempTitle.match(/\bmorning\b|\bafternoon\b|\bevening\b/i)
        if (prefMatch) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            preferredTime = prefMatch[0].toLowerCase() as any
            tempTitle = tempTitle.replace(prefMatch[0], '').replace(/\s+/g, ' ').trim()
        } else if (isGoal) {
            // Subtle inference: High energy -> Morning, Admin -> Afternoon, Leisure -> Evening
            const t = tempTitle.toLowerCase()
            if (t.match(/\b(gym|workout|run|code|deep work|focus|strategy|writing|study)\b/i)) {
                preferredTime = 'morning'
            } else if (t.match(/\b(admin|email|errand|grocery|groceries|shopping|call|sync|bills)\b/i)) {
                preferredTime = 'afternoon'
            } else if (t.match(/\b(dinner|relax|read|reading|movie|meditation|yoga|rest)\b/i)) {
                preferredTime = 'evening'
            }
        }

        const weatherMatch = tempTitle.match(/#(outdoor|outside|clear|sunny)\b/i)
        if (weatherMatch) {
            const tag = weatherMatch[1].toLowerCase()
            if (tag === 'clear' || tag === 'sunny') weatherConstraint = 'clear'
            else weatherConstraint = 'outdoor'
            tempTitle = tempTitle.replace(weatherMatch[0], '').replace(/\s+/g, ' ').trim()
        }

        const durationMatch = tempTitle.match(/(\d+)\s*(m|min|minute|minutes|h|hr|hour|hours)\b/i)
        if (durationMatch) {
            const value = parseInt(durationMatch[1])
            const unit = durationMatch[2].toLowerCase()
            if (unit.startsWith('h')) duration = value * 60
            else duration = value
            tempTitle = tempTitle.replace(durationMatch[0], '').replace(/\s+/g, ' ').trim()
        }

        const results = chrono.parse(tempTitle, refDate, { forwardDate: true })
        if (results.length > 0) {
            const result = results[0]
            start = result.start.date()
            hasTime = result.start.isCertain('hour')
            tempTitle = tempTitle.replace(result.text, '').replace(/\s+/g, ' ').trim()
            if (!hasTime && modalDateContext) {
                start = setHours(setMinutes(start, modalDateContext.getMinutes()), modalDateContext.getHours())
            }
        } else {
            const defaultHour = isGoal ? settings.morning.start : 10
            start = modalDateContext ? setHours(setMinutes(start, modalDateContext.getMinutes()), modalDateContext.getHours() || defaultHour) : setHours(setMinutes(start, 0), 10)
        }

        const title = tempTitle
            .replace(/#(focus|social|health|urgent)\b/gi, '')
            .replace(/\s+/g, ' ')
            .trim()

        const previewEvent = { title: title || 'Untitled Event', start, hasTime, duration, preferredTime, frequency, frequencyCount, isGoal, weatherConstraint }

        if (isGoal && !hasTime) {
            // For flexible goals, we show the user where they will actually land in the calendar
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const resolved = resolveConflicts([previewEvent as any, ...events], settings, weatherData)
            const thisEvent = resolved.find(e => e.title === previewEvent.title && e.isGoal)
            if (thisEvent) {
                return { ...previewEvent, start: thisEvent.start }
            }
        }

        return previewEvent
    }, [commandInput, modalDateContext, events, settings, weatherData])

    return parsedPreview
}
