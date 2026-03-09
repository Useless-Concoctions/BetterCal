'use server'

import { visionModel } from './gemini';
import yahooFinance from 'yahoo-finance2';
import { createEvent } from './actions';

export async function processStockScreenshot(base64Image: string) {
    if (!visionModel) {
        throw new Error("Gemini API not configured");
    }

    // Clean up base64 string if it has prefix
    const imageData = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = "Identify all the stock symbols (tickers) present in this image of a portfolio or trading app. Return them as a comma-separated list of symbols only (e.g. AAPL, TSLA, MSFT). If none are found, return 'NONE'.";

    try {
        const result = await visionModel.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageData,
                    mimeType: "image/png" // Default to png, should handle other types if needed
                }
            }
        ]);

        const text = result.response.text().trim();
        if (text === 'NONE') return [];

        const symbols = text.split(',')
            .map(s => s.trim().toUpperCase())
            .filter(s => s.length > 0 && s.length <= 5); // Basic ticker validation

        return symbols;
    } catch (error) {
        console.error("Error processing screenshot with Gemini:", error);
        throw new Error("Failed to process screenshot");
    }
}

export async function getEarningsDates(symbols: string[]) {
    const results = [];

    for (const symbol of symbols) {
        try {
            // Fetch quote summary with calendar events
            const info: any = await yahooFinance.quoteSummary(symbol, { modules: ['calendarEvents', 'price'] });

            if (info?.calendarEvents?.earnings?.earningsDate?.[0]) {
                results.push({
                    symbol,
                    companyName: info.price?.shortName || symbol,
                    earningsDate: info.calendarEvents.earnings.earningsDate[0],
                });
            }
        } catch (error) {
            console.warn(`Failed to fetch earnings for ${symbol}:`, error);
        }
    }

    return results;
}

export async function addEarningsToCalendar(userId: string, earnings: { symbol: string, companyName: string, earningsDate: Date }[]) {
    for (const item of earnings) {
        const date = new Date(item.earningsDate);
        // Set to a reasonable time, say 8 AM or after market 4 PM?
        // Most earnings are AM or PM. We'll just put it at 9 AM for visibility.
        const start = new Date(date);
        start.setHours(9, 0, 0, 0);

        const end = new Date(start);
        end.setHours(10, 0, 0, 0);

        await createEvent(userId, {
            title: `${item.symbol} Earnings Call (${item.companyName})`,
            start,
            end,
            emoji: '📈',
            source: 'personal',
            isGoal: false,
            confirmed: true
        });
    }
}
