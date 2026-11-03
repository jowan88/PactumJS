# PactumJS API Tests - repository reupload

API test suite built with [PactumJS](https://pactumjs.github.io/) and [Mocha](https://mochajs.org/), running against a lightweight local mock server.

## Features

- Zero-dependency mock users API built on Node's `http` module
- 21 PactumJS test cases covering success paths, validation errors, 404/405 handling, JSON schema and a full CRUD flow
- Tests start and stop the server automatically

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm

## Getting started

```bash
npm install
```

### Run the tests

```bash
npm test
```

The tests start the mock server on port 3000 themselves, so don't run `npm start` at the same time.

### Run only the mock server

```bash
npm start
```

The server is available at `http://localhost:3000`. Set the `PORT` environment variable to use a different port. Data is stored in memory and resets on every restart.

## Mock API

| Method | Endpoint     | Description    | Success | Errors   |
| ------ | ------------ | -------------- | ------- | -------- |
| GET    | `/health`    | Health check   | 200     |          |
| GET    | `/users`     | List all users | 200     |          |
| GET    | `/users/:id` | Get a user     | 200     | 404      |
| POST   | `/users`     | Create a user  | 201     | 400      |
| PUT    | `/users/:id` | Update a user  | 200     | 400, 404 |
| DELETE | `/users/:id` | Delete a user  | 204     | 404      |

Request body for `POST` and `PUT`:

```json
{ "name": "Alice" }
```

Example:

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Carol"}'
```

## Project structure

```
.
├── server/
│   └── server.js   # Mock users API
├── tests/
│   └── test.js     # PactumJS specs
└── package.json
```

## Writing a test

```js
const { spec } = require('pactum');

it('should get a user', async () => {
  await spec()
    .get('/users/1')
    .expectStatus(200)
    .expectJson({ id: 1, name: 'Alice' });
});
```

## Learn more

- [PactumJS documentation](https://pactumjs.github.io/)
- [Mocha documentation](https://mochajs.org/)
