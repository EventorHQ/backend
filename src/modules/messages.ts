import { Event } from '../db/types.js';
import { capitalize, strings } from '../lib/strings.js';

function getLabelFromSpan(span: 'week' | 'day') {
    return span === 'week' ? 'неделю' : 'день';
}

export const getEventNotificationMessage = (event: Event, span: 'week' | 'day') =>
    strings(
        `💎 <b>${event.title}</b> начинается уже через <b>${getLabelFromSpan(span)}</b>.`,
        event.description,
        `📍 ${event.location}`,
        `⏰ ${capitalize(new Intl.DateTimeFormat('ru-RU', { dateStyle: 'full', timeStyle: 'short' }).format(event.start_date))}`,
        '<i>Нажмите ниже, чтобы перейти к мероприятию:</i>'
    );
