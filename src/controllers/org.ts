import { NextFunction, Request, Response } from 'express';
import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';

@Controller('/orgs')
class OrgController {
    @Route('get', '')
    async getAllOrgs(req: Request, res: Response, next: NextFunction) {
        logging.info('Getting all orgs');

        return res.status(200).json();
    }

    @Route('post', '')
    async createOrg(req: Request, res: Response, next: NextFunction) {
        logging.info('Creating org');

        return res.status(200).json();
    }
}

export default OrgController;
