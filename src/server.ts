import express from 'express';
import http from 'http';
import 'reflect-metadata';
import './config/logging';

import { SERVER } from './config/config';
import { defineRoutes } from './modules/routes';

import { corsHandler } from './middleware/corsHandler';
import { loggingHandler } from './middleware/loggingHandler';
import { routeNotFound } from './middleware/routeNotFound';

import MainController from './controllers/main';
import OrgController from './controllers/org';
import UserController from './controllers/user';
import { createBot, setupWebhook } from './bot';
import { webhookCallback } from 'grammy';

export const application = express();
export let httpServer: ReturnType<typeof http.createServer>;

export const main = async () => {
    logging.info('---------------------------------------------');
    logging.info('Initializing BOT');
    logging.info('---------------------------------------------');
    const bot = createBot();

    logging.info('---------------------------------------------');
    logging.info('Initializing API');
    logging.info('---------------------------------------------');
    application.use(express.urlencoded({ extended: true }));
    application.use(express.json());

    logging.info('---------------------------------------------');
    logging.info('Logging & Configuration');
    logging.info('---------------------------------------------');
    application.use(loggingHandler);
    application.use(corsHandler);

    logging.info('---------------------------------------------');
    logging.info('Define Controller Routing');
    logging.info('---------------------------------------------');
    defineRoutes([MainController, UserController, OrgController], application);

    application.use(webhookCallback(bot, 'express'));
    await setupWebhook(bot);

    application.use(routeNotFound);

    logging.info('---------------------------------------------');
    logging.info('Start Server');
    logging.info('---------------------------------------------');
    httpServer = http.createServer(application);

    httpServer.on('error', (e) => {
        logging.error(e);
        setTimeout(() => {
            httpServer.close();
            httpServer.listen(SERVER.PORT, () => {
                logging.info(`Server restarted: ${SERVER.HOSTNAME}:${SERVER.PORT}`);
                logging.info('---------------------------------------------');
            });
        }, 1000);
    });

    httpServer.listen(SERVER.PORT, () => {
        logging.info(`Server started: ${SERVER.HOSTNAME}:${SERVER.PORT}`);
        logging.info('---------------------------------------------');
    });
};

export const shutdown = (callback: any) => {
    logging.info('---------------------------------------------');
    logging.info('Shutting down server');
    logging.info('---------------------------------------------');
    httpServer && httpServer.close(callback);
};

main();
