import { Event } from '../db/types.js';

function getLabelFromSpan(span: 'week' | 'day') {
    return span === 'week' ? 'неделю' : 'день';
}

export function getEventNotificationMessage(event: Event, span: 'week' | 'day') {
    return `📅 # Напоминаем!
    
    **${event.title}** начинается через ${getLabelFromSpan(span)}.

    Нажмите кнопку ниже, чтобы перейти к мероприятию:
    `;
}
