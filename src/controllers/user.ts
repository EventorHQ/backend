import { NextFunction, Request, Response } from 'express';
import { db } from '../db';
import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { BaseUser } from '../models/user';

@Controller('/users')
class UserController {
    @Route('get', '')
    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        logging.info('Getting all users');
        const users = await db.query('SELECT * FROM users');
        return res.status(200).json(users.rows);
    }

    @Route('post', '')
    async createUser(req: Request, res: Response, next: NextFunction) {
        logging.info('Creating user');
        const data = BaseUser.safeParse(req.body);
        if (!data.success) {
            return res.status(400).json({ status: 'error', errors: data.error });
        }
        const result = await db.query('INSERT INTO users (first_name, last_name, is_admin, username) VALUES ($1, $2, $3, $4) RETURNING *', [
            data.data.firstName,
            data.data.lastName,
            data.data.isAdmin,
            data.data.username
        ]);
        return res.status(200).json(result.rows[0]);
    }

    @Route('get', '/:id')
    async getUser(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;
        logging.info('Getting user ' + userId);
        const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

        if (result.rows.length < 1) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        return res.status(200).json(result.rows[0]);
    }

    @Route('delete', '/:id')
    async deleteUser(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;
        logging.info('Deleting user ' + userId);
        const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);

        if (!result.rowCount || result.rowCount < 1) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        return res.status(200).json({ status: 'ok' });
    }
}

export default UserController;
