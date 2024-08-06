import type { NextFunction, Request, Response } from 'express';
import { validate, parse, type InitDataParsed } from '@telegram-apps/init-data-node';
import { BOT_TOKEN, DEVELOPMENT } from '../config/config.js';

/**
 * Sets init data in the specified Response object.
 * @param res - Response object.
 * @param initData - init data.
 */
function setInitData(res: Response, initData: InitDataParsed): void {
    res.locals.initData = initData;
}

export const authHandler = (req: Request, res: Response, next: NextFunction) => {
    if (DEVELOPMENT) {
        return next();
    }

    const [authType, authData = ''] = (req.header('authorization') || '').split(' ');

    switch (authType) {
        case 'tma':
            try {
                // Validate init data.
                validate(authData, BOT_TOKEN, {
                    // We consider init data sign valid for 1 hour from their creation moment.
                    expiresIn: 3600
                });

                // Parse init data. We will surely need it in the future.
                setInitData(res, parse(authData));
                return next();
            } catch (e) {
                return next(e);
            }
        // ... other authorization methods.
        default:
            return next(new Error('Unauthorized'));
    }
};
