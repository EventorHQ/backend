import type { NextFunction, Request, Response } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    return res.status(500).json({
        status: 'error',
        message: err.message,
        path: req.path
    });
};
