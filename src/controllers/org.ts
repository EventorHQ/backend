import type { NextFunction, Request, Response } from 'express';
import { Controller } from '../decorators/controller.js';
import { Route } from '../decorators/route.js';
import { Org, PostOrg } from '../models/org.js';
import { readFileSync } from 'fs';
import { db } from '../db';
import { saveFileBuffer } from '../utils/saveFileBuffer.js';
import { getInitData } from '../utils/getInitData.js';
import { getOrgWithMembersById, getUserById, getUserOrganizations } from '../db/queries.js';

@Controller('/orgs')
class OrgController {
    @Route('get', '')
    async getUserOrgs(req: Request, res: Response, next: NextFunction): Promise<Response<Org[]>> {
        logging.info('Getting user orgs');
        const initData = getInitData(res);

        if (!initData?.user?.id) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }

        const userId = initData.user.id;
        const result = await getUserOrganizations(userId);
        return res.status(200).json(result);
    }

    @Route('get', '/all')
    async getAllOrgs(req: Request, res: Response, next: NextFunction): Promise<Response<Org[]>> {
        logging.info('Getting all orgs');
        const result = await db.selectFrom('orgs').selectAll().execute();

        if (result.length < 1) {
            return res.status(404).json({ status: 'error', message: 'No organizations found' });
        }

        return res.status(200).json(result);
    }

    @Route('get', '/:id')
    async getOrg(req: Request, res: Response, next: NextFunction): Promise<Response<Org>> {
        const orgId = Number(req.params.id);
        logging.info('Getting org ' + orgId);

        const initData = getInitData(res);
        if (!initData?.user?.id) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }

        const user = await getUserById(initData.user.id);
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }

        const result = await getOrgWithMembersById(orgId);
        if (!result) {
            return res.status(404).json({ status: 'error', message: 'Organization not found' });
        }

        if (result.members.some((member) => member.id === user.id)) {
            return res.status(200).json(result);
        }

        return res.status(200).json({
            id: result.id,
            title: result.title,
            description: result.description,
            avatar: result.avatar_img,
            isFancy: result.is_fancy
        });
    }

    @Route('post', '')
    async createOrg(req: Request, res: Response, next: NextFunction): Promise<Response<Org>> {
        logging.info('Creating org');
        let avatar;

        const initData = getInitData(res);
        if (!initData?.user?.id) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }

        const parsing = await PostOrg.safeParse({ ...req.body, creatorId: initData.user.id });

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

        const result = await db
            .insertInto('orgs')
            .values({
                title: data.title,
                description: data.description,
                avatar_img: fileId,
                creator_id: data.creatorId,
                is_fancy: false
            })
            .returningAll()
            .executeTakeFirst();

        if (!result) {
            return res.status(400).json({ request: req.body, error: 'Organization already exists' });
        }

        await db
            .insertInto('org_members')
            .values({
                org_id: result.id,
                user_id: data.creatorId,
                role: 'admin'
            })
            .execute();

        return res.status(201).json(result);
    }

    @Route('put', '/:id/fancy')
    async changeOrgStatus(req: Request, res: Response, next: NextFunction): Promise<Response<Org>> {
        const orgId = Number(req.params.id);
        logging.info(`Updating org ${orgId}`);

        if (!('isFancy' in req.body)) {
            return res.status(400).json({ request: req.body, error: 'Missing isFancy' });
        }

        const result = await db.updateTable('orgs').set({ is_fancy: req.body.isFancy }).where('id', '=', orgId).execute();

        return res.status(204).json(result);
    }

    @Route('delete', '/:id')
    async deleteOrg(req: Request, res: Response, next: NextFunction) {
        const orgId = Number(req.params.id);
        logging.info(`Deleting org ${orgId}`);

        try {
            await db.deleteFrom('orgs').where('id', '=', orgId).execute();
        } catch {
            return res.status(404).json({ request: req.body, error: 'Organization not found' });
        }

        return res.status(204).json({ status: 'ok' });
    }
}

export default OrgController;
