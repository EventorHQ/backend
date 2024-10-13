import express from 'express';
import https from 'node:https';
import fileUpload from 'express-fileupload';
import 'reflect-metadata';
import logging from './config/logging.js';

import { SERVER } from './config/config.js';
import { defineRoutes } from './modules/routes.js';

import { corsHandler } from './middleware/corsHandler.js';
import { loggingHandler } from './middleware/loggingHandler.js';
import { routeNotFound } from './middleware/routeNotFound.js';
import { authHandler } from './middleware/authHandler.js';

import MainController from './controllers/main.js';
import OrgController from './controllers/org.js';
import UserController from './controllers/user.js';
import { webhookCallback } from 'grammy';
import { bot } from './bot/index.js';

// logging.info('---------------------------------------------');
// logging.info('Initializing BOT');
// logging.info('---------------------------------------------');
import { defineBotApiProxy } from './modules/botApiProxy.js';
import InvitationController from './controllers/invitation.js';
import EventController from './controllers/event.js';
import fs from 'node:fs';

const privateKey = fs.readFileSync('tma.internal-key.pem');
const certificate = fs.readFileSync('tma.internal.pem');

export const application = express();
export let httpServer: ReturnType<typeof https.createServer>;

export const main = async () => {
    logging.info('---------------------------------------------');
    logging.info('Initializing API');
    logging.info('---------------------------------------------');
    application.use(express.urlencoded({ extended: true }));
    application.use(
        fileUpload({
            useTempFiles: true,
            tempFileDir: '/var/tmp'
        })
    );
    application.use(express.json());

    logging.info('---------------------------------------------');
    logging.info('Logging & Configuration');
    logging.info('---------------------------------------------');
    application.use(loggingHandler);
    application.use(corsHandler);

    logging.info('---------------------------------------------');
    logging.info('Define Controller Routing');
    logging.info('       - Public Routes');
    defineRoutes([MainController], application);
    defineBotApiProxy(application);

    logging.info('       - Private Routes');
    logging.info('---------------------------------------------');
    application.use(authHandler);
    defineRoutes([UserController, OrgController, InvitationController, EventController], application);

    logging.info('---------------------------------------------');
    logging.info('Define Bot API');
    logging.info('---------------------------------------------');
    application.use(webhookCallback(bot, 'express'));

    application.use(routeNotFound);

    logging.info('---------------------------------------------');
    logging.info('Start Server');
    logging.info('---------------------------------------------');
    httpServer = https.createServer(
        {
            key: privateKey,
            cert: certificate
        },
        application
    );

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
