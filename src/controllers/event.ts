import type { NextFunction, Request, Response } from 'express';
import { Controller } from '../decorators/controller.js';
import { Route } from '../decorators/route.js';

@Controller('/events')
class EventController {
    @Route('get')
    async getAll(req: Request, res: Response, next: NextFunction) {
        return res.status(200).json({ status: 'ok' });
    }

    @Route('post')
    async createEvent(req: Request, res: Response, next: NextFunction) {
        return res.status(201).json({ status: 'ok' });
    }
}

export default EventController;
