import type { NextFunction, Request, Response } from 'express';
import { Controller } from '../decorators/controller.js';
import { Route } from '../decorators/route.js';

@Controller()
class MainController {
    @Route('get', '/healthcheck')
    getHealthCheck(req: Request, res: Response, next: NextFunction) {
        logging.info('Healthcheck called successfully');
        return res.status(200).json({ status: 'ok' });
    }
}

export default MainController;
