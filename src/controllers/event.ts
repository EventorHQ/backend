import type { NextFunction, Request, Response } from 'express';
import { Controller } from '../decorators/controller.js';
import { Route } from '../decorators/route.js';
import { checkin, createEvent, deleteEvent, enlist, getAllEvents, getEventById, getUserCreatedEvents, getUserEvents } from '../db/queries.js';
import { getInitData } from '../utils/getInitData.js';
import { eventCreateSchema, eventEnlistSchema } from '../models/event.js';
import { readFileSync } from 'fs';
import { saveFileBuffer } from '../utils/saveFileBuffer.js';
import { isAllowedToPerformCheckin } from '../utils/isAllowedToPerformCheckin.js';
import { parse as parseInitData, validate } from '@telegram-apps/init-data-node';
import { BOT_TOKEN, DEVELOPMENT } from '../config/config.js';
import { getPictureByFileId } from '../utils/getPictureByFileId.js';

@Controller('/events')
class EventController {
    @Route('get', '/all')
    async getAll(req: Request, res: Response, next: NextFunction) {
        const result = await getAllEvents();
        return res.status(200).json(result);
    }

    @Route('get')
    async getEvents(req: Request, res: Response, next: NextFunction) {
        const initData = getInitData(res);

        if (!initData?.user?.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const events = await getUserEvents(initData.user.id);
        const result = await Promise.all(
            events.map(async (event) => ({
                ...event,
                cover_img: await getPictureByFileId(event.cover_img)
            }))
        );
        return res.status(200).json(result);
    }

    @Route('get', '/:id')
    async getEventById(req: Request, res: Response, next: NextFunction) {
        const initData = getInitData(res);

        if (!initData?.user?.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const event = await getEventById(+req.params.id, initData.user.id);

        return res.status(200).json(event);
    }

    @Route('post')
    async createEvent(req: Request, res: Response, next: NextFunction) {
        const initData = getInitData(res);

        if (!initData?.user?.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const body = eventCreateSchema.safeParse({
            ...req.body,
            org_id: Number(req.body.org_id),
            form: {},
            start_date: new Date(req.body.start_date),
            end_date: new Date(req.body.start_date)
        });
        let cover;

        if (!body.success) {
            return res.status(400).json({ error: body.error });
        }

        if (!req.files || !(cover = req.files.cover_img)) {
            return res.status(400).json({ request: req.body, error: 'Missing cover image' });
        }

        if (Array.isArray(cover)) {
            return res.status(400).json({ request: req.body, error: 'Cover image is not a file' });
        }

        const { data } = body;
        const fileId = await saveFileBuffer(readFileSync(cover.tempFilePath));
        const result = await createEvent({ ...data, cover: fileId, creatorId: initData.user.id });

        if (!result) {
            return res.status(400).json({ request: req.body, error: 'Failed to create event' });
        }

        return res.status(201).json(result);
    }

    @Route('delete', '/:id')
    async deleteEvent(req: Request, res: Response, next: NextFunction) {
        const result = await deleteEvent(Number(req.params.id));

        if (!result) {
            return res.status(400).json({ request: req.body, error: 'Failed to delete event' });
        }

        return res.status(200).json(result);
    }

    @Route('post', '/:id/enlist')
    async enlistToEvent(req: Request, res: Response, next: NextFunction) {
        const initData = getInitData(res);

        if (!initData?.user?.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const body = eventEnlistSchema.safeParse({
            ...req.body,
            event_id: Number(req.params.id),
            user_id: initData.user.id
        });

        if (!body.success) {
            return res.status(400).json({ error: body.error });
        }

        const { data } = body;
        const result = await enlist({
            eventId: data.event_id,
            userId: data.user_id,
            form: data.form
        });

        if (!result) {
            return res.status(400).json({ request: req.body, error: 'Failed to enlist' });
        }

        return res.status(200).json(result);
    }

    @Route('post', '/:id/checkin')
    async checkinToEvent(req: Request, res: Response, next: NextFunction) {
        const initData = getInitData(res);

        if (!initData?.user?.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const isAllowed = await isAllowedToPerformCheckin(Number(req.params.id), initData.user.id);

        if (!isAllowed) {
            return res.status(403).json({ error: 'You are not allowed to perform checkin' });
        }

        try {
            const userInitData = parseInitData(req.body);
            if (!userInitData.user?.id) {
                return res.status(400).json({ request: req.body, error: 'Missing user id' });
            }

            validate(userInitData, BOT_TOKEN, {
                expiresIn: DEVELOPMENT ? 0 : 3600
            });

            const result = await checkin(Number(req.params.id), userInitData.user.id);

            if (!result) {
                return res.status(400).json({ request: req.body, error: 'Failed to perform checkin' });
            }

            return res.status(200).json(result);
        } catch (e) {
            return res.status(400).json({ request: req.body, error: JSON.stringify(e) });
        }
    }
}

export default EventController;
