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
    console.log(req.header('Authorization'));
    const [authType, authData = ''] = (req.header('Authorization') || '').split(' ');

    switch (authType) {
        case 'tma':
            try {
                validate(authData, BOT_TOKEN, {
                    expiresIn: DEVELOPMENT ? 0 : 3600
                });

                setInitData(res, parse(authData));
                return next();
            } catch (e) {
                return res.status(401).json({ status: 'error', message: 'Unauthorized' });
            }
        default:
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
};
