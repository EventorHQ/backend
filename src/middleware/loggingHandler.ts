import type { NextFunction, Request, Response } from 'express';

export const loggingHandler = (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
        logging.log(`${req.method} ${req.url}: ${res.statusCode}, IP: ${req.socket.remoteAddress}`);
    });

    next();
};
