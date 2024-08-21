import type { NextFunction, Request, Response } from 'express';
import { Controller } from '../decorators/controller.js';
import { Route } from '../decorators/route.js';
import { createEvent, getAllEvents, getUserEvents } from '../db/queries.js';
import { getInitData } from '../utils/getInitData.js';
import { eventCreateSchema } from '../models/event.js';
import { readFileSync } from 'fs';
import { saveFileBuffer } from '../utils/saveFileBuffer.js';

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

        const result = await getUserEvents(initData.user.id);
        return res.status(200).json(result);
    }

    @Route('get', '/neares')
    async getNearestEvent(req: Request, res: Response, next: NextFunction) {
        const initData = getInitData(res);

        if (!initData?.user?.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        return res.status(200).json({ status: 'ok' });
    }

    @Route('post')
    async createEvent(req: Request, res: Response, next: NextFunction) {
        const initData = getInitData(res);

        if (!initData?.user?.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const body = eventCreateSchema.safeParse(req.body);
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
}

export default EventController;
