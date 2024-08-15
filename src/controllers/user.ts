import type { NextFunction, Request, Response } from 'express';
import { db } from '../db/index.js';
import { Controller } from '../decorators/controller.js';
import { Route } from '../decorators/route.js';
import { PostUser } from '../models/user.js';
import { getUserById } from '../db/queries.js';

@Controller('/users')
class UserController {
    @Route('get', '')
    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        logging.info('Getting all users');
        const users = await db.selectFrom('users').selectAll().execute();
        return res.status(200).json(users);
    }

    @Route('post', '')
    async createUser(req: Request, res: Response, next: NextFunction) {
        logging.info('Creating user');
        const data = PostUser.safeParse(req.body);
        if (!data.success) {
            return res.status(400).json({ status: 'error', errors: data.error });
        }

        const result = await db
            .insertInto('users')
            .values({
                id: data.data.id,
                first_name: data.data.firstName,
                last_name: data.data.lastName,
                is_admin: data.data.isAdmin || false,
                username: data.data.username
            })
            .onConflict((oc) =>
                oc.column('id').doUpdateSet({
                    first_name: data.data.firstName,
                    last_name: data.data.lastName,
                    is_admin: data.data.isAdmin || false,
                    username: data.data.username
                })
            )
            .returningAll()
            .execute();

        return res.status(200).json(result[0]);
    }

    @Route('get', '/:id')
    async getUser(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.id);
        logging.info('Getting user ' + userId);
        const result = await getUserById(userId);

        if (!result) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        return res.status(200).json(result);
    }

    @Route('delete', '/:id')
    async deleteUser(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.id);
        logging.info('Deleting user ' + userId);

        try {
            await db.deleteFrom('users').where('id', '=', userId).execute();
            return res.status(200).json({ status: 'ok' });
        } catch {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
    }
}

export default UserController;
