'use server'

import { prisma } from './prisma'
import { CalendarEvent } from './calendar-utils'
import { revalidatePath } from 'next/cache'

export async function getEvents(userId: string) {
    return await prisma.event.findMany({
        where: { userId },
        orderBy: { start: 'asc' }
    })
}

export async function createEvent(userId: string, event: Omit<CalendarEvent, 'id'>) {
    const newEvent = await prisma.event.create({
        data: {
            userId,
            title: event.title,
            start: event.start,
            end: event.end,
            location: event.location,
            locationType: event.locationType,
            emoji: event.emoji,
            source: event.source,
        }
    })
    revalidatePath('/')
    return newEvent
}

export async function updateEvent(id: string, event: Partial<CalendarEvent>) {
    const updated = await prisma.event.update({
        where: { id },
        data: {
            title: event.title,
            start: event.start,
            end: event.end,
            location: event.location,
            locationType: event.locationType,
            emoji: event.emoji,
        }
    })
    revalidatePath('/')
    return updated
}

export async function deleteEvent(id: string) {
    await prisma.event.delete({
        where: { id }
    })
    revalidatePath('/')
}

export async function getGoals(userId: string) {
    return await prisma.goal.findMany({
        where: { userId }
    })
}

export async function createGoal(userId: string, goal: any) {
    const newGoal = await prisma.goal.create({
        data: {
            userId,
            title: goal.title,
            duration: goal.duration,
            preferredTime: goal.preferredTime,
            frequency: goal.frequency,
            emoji: goal.emoji,
        }
    })
    revalidatePath('/')
    return newGoal
}

import { syncGoogleCalendar } from './google-calendar'

export async function syncGoogleAction(userId: string) {
    const externalEvents = await syncGoogleCalendar(userId)

    // Persist them if they don't exist
    for (const event of externalEvents) {
        const existing = await prisma.event.findFirst({
            where: {
                userId,
                title: event.title,
                start: event.start
            }
        })

        if (!existing) {
            await prisma.event.create({
                data: {
                    userId,
                    ...event
                }
            })
        }
    }

    revalidatePath('/')
}
