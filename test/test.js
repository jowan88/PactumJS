const { spec, request } = require('pactum');
const server = require('../server/server');

const PORT = 3000;

before(done => {
    request.setBaseUrl(`http://localhost:${PORT}`);
    server.listen(PORT, done);
});

after(done => {
    server.close(done);
});

describe('Mock users API', () => {
    it('should return health status', async () => {
        await spec().get('/health').expectStatus(200).expectJson({ status: 'ok' });
    });

    it('should list users', async () => {
        await spec().get('/users').expectStatus(200).expectJsonLike([{ id: 1, name: 'Alice' }]);
    });

    it('should get a users by id', async () => {
        await spec().get('/users/1').expectStatus(200).expectJson({ id: 1, name: 'Alice' });
        await spec().get('/users/2').expectStatus(200).expectJson({ id: 2, name: 'Bob' });
        await spec().get('/users/3').expectStatus(200).expectJson({ id: 3, name: 'Patryk' });
    });

    it('should return 404 for unknown user', async () => {
        await spec().get('/users/999').expectStatus(404);
    });

    it('should create a user', async () => {
        await spec()
            .post('/users')
            .withJson({ name: 'Carol' })
            .expectStatus(201)
            .expectJsonLike({ name: 'Carol' });
    });

    it('should return freshly created user', async () => {
        await spec().get('/users/4').expectStatus(200).expectJson({ id: 4, name: 'Carol' });
    });

    it('should return 400 when creating a user without a name', async () => {
        await spec()
            .post('/users')
            .withJson({})
            .expectStatus(400);
    });

    it('should update a user', async () => {
        await spec()
            .put('/users/2')
            .withJson({ name: 'Bobby' })
            .expectStatus(200)
            .expectJson({ id: 2, name: 'Bobby' });
    });

    it('should delete a user', async () => {
        await spec().delete('/users/1').expectStatus(204);
        await spec().get('/users/1').expectStatus(404);
    });

    it('should return JSON content type', async () => {
        await spec().get('/users').expectStatus(200).expectHeaderContains('content-type', 'application/json');
    });

    it('should return 404 for unknown route', async () => {
        await spec().get('/unknown').expectStatus(404).expectJson({ error: 'Not found' });
    });

    it('should return 404 with error message for unknown user', async () => {
        await spec().get('/users/999').expectStatus(404).expectJson({ error: 'User not found' });
    });

    it('should return 400 with error message when name is missing', async () => {
        await spec()
            .post('/users')
            .withJson({})
            .expectStatus(400)
            .expectJson({ error: 'name is required' });
    });

    it('should return 400 for invalid JSON body', async () => {
        await spec()
            .post('/users')
            .withHeaders('Content-Type', 'application/json')
            .withBody('{ not valid json')
            .expectStatus(400)
            .expectJson({ error: 'Invalid JSON' });
    });

    it('should return 404 when updating unknown user', async () => {
        await spec().put('/users/999').withJson({ name: 'Ghost' }).expectStatus(404);
    });

    it('should return 400 when updating a user without a name', async () => {
        await spec().put('/users/2').withJson({}).expectStatus(400);
    });

    it('should return 404 when deleting unknown user', async () => {
        await spec().delete('/users/999').expectStatus(404);
    });

    it('should return 405 for unsupported method', async () => {
        await spec().patch('/users/2').withJson({ name: 'X' }).expectStatus(405);
    });

    it('should return users matching the expected schema', async () => {
        await spec()
            .get('/users')
            .expectStatus(200)
            .expectJsonSchema({
                type: 'array',
                items: {
                    type: 'object',
                    required: ['id', 'name'],
                    properties: { id: { type: 'integer' }, name: { type: 'string' } }
                }
            });
    });

    it('should run create, read, update and delete for a single user', async () => {
        const id = await spec()
            .post('/users')
            .withJson({ name: 'Dave' })
            .expectStatus(201)
            .returns('id');

        await spec().get(`/users/${id}`).expectStatus(200).expectJson({ id, name: 'Dave' });
        await spec().put(`/users/${id}`).withJson({ name: 'David' }).expectStatus(200).expectJson({ id, name: 'David' });
        await spec().delete(`/users/${id}`).expectStatus(204);
        await spec().get(`/users/${id}`).expectStatus(404);
    });

    it('should assign unique ids to new users', async () => {
        const first = await spec().post('/users').withJson({ name: 'Eve' }).expectStatus(201).returns('id');
        const second = await spec().post('/users').withJson({ name: 'Frank' }).expectStatus(201).returns('id');
        if (first === second) throw new Error('ids should be unique');
    });
});
