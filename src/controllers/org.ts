import type { NextFunction, Request, Response } from 'express';
import { Controller } from '../decorators/controller.js';
import { Route } from '../decorators/route.js';
import { BaseOrg, Org, PatchOrg, PostOrg } from '../models/org.js';
import { readFileSync } from 'fs';
import { db } from '../db/index.js';
import { saveFileBuffer } from '../utils/saveFileBuffer.js';
import { getInitData } from '../utils/getInitData.js';
import { addUserToOrg, getOrgById, getOrgWithMembersById, getUserById, getUserOrganizations } from '../db/queries.js';
import { getPictureByFileId } from '../utils/getPictureByFileId.js';
import { invitationSchema } from '../models/invitation.js';
import { encrypt } from '../lib/encryption.js';

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
        const orgs = await getUserOrganizations(userId);
        const result = await Promise.all(
            orgs.map(async (item) => {
                const org = item.organization;
                const avatar = await getPictureByFileId(org.avatar_img);

                return {
                    role: item.role,
                    organization: {
                        id: org.id,
                        title: org.title,
                        description: org.description,
                        avatar: avatar,
                        isFancy: org.is_fancy
                    }
                };
            })
        );

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

        const avatar = await getPictureByFileId(result.avatar_img);

        if (result.members.findIndex((member) => member.id === user.id)) {
            return res.status(200).json({
                id: result.id,
                title: result.title,
                description: result.description,
                avatar: avatar,
                isFancy: result.is_fancy,
                members: await Promise.all(
                    result.members.map(async (member) => {
                        const memberAvatar = member.username
                            ? `https://t.me/i/userpic/320/${member.username}.jpg`
                            : member.photo_img
                            ? await getPictureByFileId(member.photo_img)
                            : null;

                        return {
                            id: member.id,
                            firstName: member.first_name,
                            lastName: member.last_name,
                            username: member.username,
                            avatar: memberAvatar,
                            role: member.role
                        };
                    })
                )
            });
        }

        return res.status(200).json({
            id: result.id,
            title: result.title,
            description: result.description,
            avatar: avatar,
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

        await addUserToOrg(data.creatorId, result.id, 'admin');

        return res.status(201).json(result);
    }

    @Route('put', '/:id')
    async editOrg(req: Request, res: Response, next: NextFunction): Promise<Response<Org>> {
        const initData = getInitData(res);
        if (!initData?.user?.id) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }

        const parsing = await PatchOrg.safeParse(req.body);
        const id = Number(req.params.id);

        if (!parsing.success) {
            return res.status(400).json({ request: req.body, error: parsing.error });
        }
        const { data } = parsing;
        let avatar;

        if (req.files && !Array.isArray(req.files.avatar)) {
            avatar = req.files.avatar;
        }

        const avatarData = avatar ? { avatar_img: await saveFileBuffer(readFileSync(avatar.tempFilePath)) } : {};

        const result = await db
            .updateTable('orgs')
            .where('id', '=', id)
            .set({
                ...data,
                ...avatarData
            })
            .returningAll()
            .executeTakeFirst();

        if (!result) {
            return res.status(400).json({ request: req.body, error: 'Failed to update organization' });
        }

        return res.status(200).json(result);
    }

    @Route('put', '/:id/fancy')
    async changeOrgStatus(req: Request, res: Response, next: NextFunction): Promise<Response<Org>> {
        if (!req.params.id) {
            return res.status(400).json({ request: req.body, error: 'Missing id' });
        }

        if (!('isFancy' in req.body)) {
            return res.status(400).json({ request: req.body, error: 'Missing isFancy' });
        }

        const result = await db
            .updateTable('orgs')
            .set({ is_fancy: req.body.isFancy })
            .where('id', '=', +req.params.id)
            .returningAll()
            .executeTakeFirst();

        return res.status(200).json(result);
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
