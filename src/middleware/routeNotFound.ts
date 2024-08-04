import { NextFunction, Request, Response } from 'express';

export const routeNotFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error('Route Not Found');

    logging.error(error);
    return res.status(404).json({ error: error.message });
};
