import type { Express, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { BOT_TOKEN } from '../config/config.js';

export function defineBotApiProxy(application: Express) {
    application.use(
        '/botapi',
        createProxyMiddleware<Request, Response>({
            target: 'https://api.telegram.org/file/bot' + BOT_TOKEN,
            changeOrigin: true
        })
    );
}
