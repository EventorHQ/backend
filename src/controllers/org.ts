import { NextFunction, Request, Response } from 'express';
import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { PostOrg } from '../models/org';
import { readFileSync } from 'fs';
import { db } from '../db';
import { saveFileBuffer } from '../utils/saveFileBuffer';

@Controller('/orgs')
class OrgController {
    @Route('get', '')
    async getAllOrgs(req: Request, res: Response, next: NextFunction) {
        logging.info('Getting all orgs');

        let dbQueryResult;
        try {
            dbQueryResult = await db.query('SELECT * FROM orgs');
        } catch {
            return res.status(400).json({ request: req.body, error: 'Organization already exists' });
        }

        return res.status(200).json(dbQueryResult.rows);
    }

    @Route('post', '')
    async createOrg(req: Request, res: Response, next: NextFunction) {
        logging.info('Creating org');
        let avatar;

        if (!('creatorId' in req.body)) {
            return res.status(400).json({ request: req.body, error: 'Missing creatorId' });
        }

        const parsing = await PostOrg.safeParse({ ...req.body, creatorId: +req.body.creatorId });

        if (!parsing.success) {
            return res.status(400).json({ request: req.body, error: parsing.error });
        }
        const { data } = parsing;

        if (!req.files || !(avatar = req.files.avatar)) {
            return res.status(400).json({ request: req.body, error: 'Missing avatar image' });
        }

        if (Array.isArray(avatar)) {
            return res.status(400).json({ request: req.body, error: 'Avatar image is not a file' });
        }

        const fileId = await saveFileBuffer(readFileSync(avatar.tempFilePath));

        let dbQueryResult;
        try {
            dbQueryResult = await db.query('INSERT INTO orgs (title, description, avatar_img, creator_id) VALUES ($1, $2, $3, $4) RETURNING *', [
                data.title,
                data.description,
                fileId,
                data.creatorId
            ]);
        } catch {
            return res.status(400).json({ request: req.body, error: 'Organization already exists' });
        }

        return res.status(200).json(dbQueryResult.rows[0]);
    }

    @Route('put', '/:id/fancy')
    async changeOrgStatus(req: Request, res: Response, next: NextFunction) {
        logging.info('Updating org');
        const orgId = req.params.id;

        if (!('isFancy' in req.body)) {
            return res.status(400).json({ request: req.body, error: 'Missing isFancy' });
        }

        let dbQueryResult;
        try {
            dbQueryResult = await db.query('UPDATE orgs SET is_fancy = $1 WHERE id = $2 RETURNING *', [req.body.isFancy, orgId]);
        } catch {
            return res.status(400).json({ request: req.body, error: 'Organization not found' });
        }

        return res.status(200).json(dbQueryResult.rows[0]);
    }
}

export default OrgController;
