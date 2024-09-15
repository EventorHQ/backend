import type { NextFunction, Request, Response } from 'express';
import { Controller } from '../decorators/controller.js';
import { Route } from '../decorators/route.js';
import { addUserToOrg, createInvite, deleteInvite, getInvite } from '../db/queries.js';
import { getInitData } from '../utils/getInitData.js';
import { invitationSchema } from '../models/invitation.js';
import { db } from '../db/index.js';
import { getPictureByFileId } from '../utils/getPictureByFileId.js';

@Controller('/invitations')
class InvitationController {
    @Route('get')
    async getAll(req: Request, res: Response, next: NextFunction) {
        const result = await db.selectFrom('invites').selectAll().execute();

        return res.status(200).json(result);
    }

    @Route('post')
    async createInvitation(req: Request, res: Response, next: NextFunction) {
        const initData = getInitData(res);

        if (!initData?.user?.id) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }

        const body = invitationSchema.safeParse(req.body);

        if (!body.success) {
            return res.status(400).json({ request: req.body, error: body.error });
        }

        const { data } = body;
        const invite = await createInvite(data.orgId, initData.user.id, data.role, data.isReusable);

        return res.status(201).json(invite);
    }

    @Route('get', '/:id')
    async getInvitation(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ request: req.body, error: 'Missing invitation' });
        }

        const invite = await getInvite(id);

        if (!invite) {
            return res.status(404).json({ request: req.body, error: 'Invitation not found' });
        }

        return res.status(200).json(invite);
    }

    @Route('delete', '/:id')
    async deleteInvitation(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ request: req.body, error: 'Missing invitation' });
        }

        const invite = await deleteInvite(id);

        if (!invite) {
            return res.status(404).json({ request: req.body, error: 'Invitation not found' });
        }

        return res.status(200).json(invite);
    }

    @Route('put', '/:id/accept')
    async acceptInvitation(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ request: req.body, error: 'Missing invitation' });
        }

        const invite = await getInvite(id);

        if (!invite) {
            return res.status(404).json({ request: req.body, error: 'Invitation not found' });
        }

        const initData = getInitData(res);

        if (!initData?.user?.id) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }

        const { org, role } = invite;

        const result = await addUserToOrg(initData.user.id, org.id, role);

        if (!invite.is_reusable) {
            await deleteInvite(id);
        }

        if (!result) {
            return res.status(400).json({ request: req.body, error: 'Failed to add user to organization' });
        } else if ('error' in result) {
            return res.status(400).json({ status: 'error', message: result.error });
        }

        return res.status(200).json(result);
    }
}

export default InvitationController;
