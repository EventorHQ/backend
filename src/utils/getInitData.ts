import type { Response } from 'express';
import { type InitDataParsed } from '@telegram-apps/init-data-node';

/**
 * Extracts init data from the Response object.
 * @param res - Response object.
 * @returns Init data stored in the Response object. Can return undefined in case,
 * the client is not authorized.
 */
export function getInitData(res: Response): InitDataParsed | undefined {
    return res.locals.initData;
}
