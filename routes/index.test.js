const request = require('supertest');
const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');
const app = require('../app');
const errors = require('../lib/errors');
const { clearDatabase, insertUsers } = require('../testdbsetup');

const nonSignedUpUser = {
    "name": "Adria Mcknight",
    "nickname": "adria3452",
    "email": "adria@aol.net",
    "password": "UVP97 xmui #$$"
};

const nonSignedUpUser1 = {
    "name": "Antonio Oliveira",
    "nickname": "antonioo35",
    "email": "antonio-oliveira75@prestec.com.br",
    "password": "5zxTPyejOX"
};

let users = [
    {
        name: "Carla Roman",
        nickname: "CarlaR",
        email: "carla_roman@icloud.couk",
        password: "HFM43HWH5JM"
    }
];

beforeAll(() => {
    return insertUsers(users);
});

afterAll(() => {
    return clearDatabase();
});

describe('GET /', () => {
    test.todo('succesfully access route');
});

describe('POST /login/', () => {
    test('succesfully login', () => {
        const body = { credentials: { email: users[0].email, password: users[0].password }};
        return request(app)
        .post('/login')
        .set('Content-Type', 'application/json')
        .send(body)
        .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.header['content-type']).toBe('application/json');
            expect(response.header['set-cookie']).toHaveLength(1);
            expect(response.header['set-cookie'][0]).toMatch(/^jwt=/);
            expect(response.body).toBeFalsy();
        });
    });

    test('missing credentials', () => {
        const error = errors.missingRequiredDataToLogin();
        const body = { credentials: { password: users[0].password }};
        return request(app)
        .post('/login')
        .set('Content-Type', 'application/json')
        .send(body)
        .then((response) => {
            expect(response.statusCode).toBe(error.status);
            expect(response.header['content-type']).toBe('application/json; charset=utf-8');
            expect(response.body).toEqual({ msg: error.clientMsg });
        });
    });

    test('non-existent user with given credentials', () => {
        const error = errors.nonExistentUserWithGivenCredentials();
        const body = { credentials : { email: nonSignedUpUser.email, password: nonSignedUpUser.password }};
        return request(app)
        .post('/login')
        .set('Content-Type', 'application/json')
        .send(body)
        .then((response) => {
            expect(response.statusCode).toBe(error.status);
            expect(response.header['content-type']).toBe('application/json; charset=utf-8');
            expect(response.body).toEqual({ msg: error.clientMsg });
        });
    });
});

describe('POST /signup/', () => {
    test('succesfully signup', () => {
        const body = { user: nonSignedUpUser1 };
        return request(app)
        .post('/signup')
        .set('Content-Type', 'application/json')
        .send(body)
        .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.header['content-type']).toBe('application/json; charset=utf-8');
            expect(response.body).toHaveProperty('name', nonSignedUpUser1.name);
            expect(response.body).toHaveProperty('email', nonSignedUpUser1.email);
            expect(response.body).toHaveProperty('nickname', nonSignedUpUser1.nickname);
            expect(response.body).not.toHaveProperty('password', nonSignedUpUser1.password);
            expect(response.body).not.toHaveProperty('hash', nonSignedUpUser1.hash);
            expect(response.body).not.toHaveProperty('salt', nonSignedUpUser1.salt);
        });
    });

   test.each([
        ['user', {}],
        ['password', { user: {name: nonSignedUpUser.name, email: nonSignedUpUser.email, nickname: nonSignedUpUser.nickname }}],
        ['email', { user: {name: nonSignedUpUser.name, password: nonSignedUpUser.password, nickname: nonSignedUpUser.nickname }}]
    ])('missing required data to signup : %s', (missingField, body) => {
        var error = errors.missingRequiredDataToSignup();
        return request(app)
        .post('/signup')
        .set('Content-Type', 'application/json')
        .send(body)
        .then((response) => {
            expect(response.statusCode).toBe(error.status);
            expect(response.header['content-type']).toBe('application/json; charset=utf-8');
            expect(response.body).toEqual({ msg: error.clientMsg });
        });
    });

    test('try to signup invalid email user', ()=> {
        const error = errors.basicUserError("Invalid data for user creation.", "Invalid user");
        var user = users[0];
        user.email = "blablabla";
        const body = { user: user };
        return request(app)
        .post('/signup')
        .set('Content-Type', 'application/json')
        .send(body)
        .then((response) => {
            expect(response.statusCode).toBe(error.status);
            expect(response.header['content-type']).toBe('application/json; charset=utf-8');
            expect(response.body).toEqual({ msg: error.clientMsg });
        });
    });

    test('try to signup already created user', ()=> {
        const error = errors.basicUserError("User already exists.", "Invalid user");
        const body = { user: { ...users[0] }};
        return request(app)
        .post('/signup')
        .set('Content-Type', 'application/json')
        .send(body)
        .then((response) => {
            expect(response.statusCode).toBe(error.status);
            expect(response.header['content-type']).toBe('application/json; charset=utf-8');
            expect(response.body).toEqual({ msg: error.clientMsg });
        });
    });
});
