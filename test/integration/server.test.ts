import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { application, shutdown } from '../../src/server';

describe('Basic application', () => {
    afterAll((done) => {
        shutdown(done);
    });

    it('starts and has the prover environment', async () => {
        expect(process.env.NODE_ENV).toBe('test');
        expect(application).toBeDefined();
    }, 10000);

    it('returns all options allowed to be used', async () => {
        const response = await request(application).options('/');
        expect(response.status).toBe(200);
        expect(response.headers['access-control-allow-methods']).toBe('GET, POST, PUT, DELETE, PATCH');
    });
});
