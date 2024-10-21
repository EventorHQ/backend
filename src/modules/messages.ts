import { Event } from '../db/types.js';

export function getEventNotificationMessage(event: Event, span: 'week' | 'day') {
    return `📅 New event created ${span}`;
}
