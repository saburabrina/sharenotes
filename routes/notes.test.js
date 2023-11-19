const { describe, expect, test, beforeAll, afterAll } = require('@jest/globals');
const { clearDatabase, insertNotes, insertUsers } = require('../testdbsetup');
const request = require('supertest');
const app = require('../app');
const errors = require('../lib/errors');
const utils = require('../lib/utils');

let notes;
let publishedNotes;
let aPublishedNote;

let users;
let aJWT;

let aNonCreatedNote = {
    title : "How to walk",
    content : "move a foot then the other",
    publish : false
};

function dbDataToJSONFormat (data) {
    let v = {...data._doc}; 
    v._id = data._id.toString(); 
    v.createdAt = v.createdAt.toJSON();
    v.updatedAt = v.updatedAt.toJSON();
    delete v['__v'];
    return v; 
}

beforeAll(() => {
    return Promise.all([
            insertNotes(),
            insertUsers()
        ])
        .then(([ns, us]) => {
            notes = ns.map(dbDataToJSONFormat);
            publishedNotes = notes.filter((v) => v.publish);
            aPublishedNote = publishedNotes[0];

            users = us.map(dbDataToJSONFormat);
            aJWT = utils.issueJWT(users[0]);
            aJWT.expires = parseInt(aJWT.expires)/1000;
            return;
        })
        .catch((err) => console.log(err));
});

afterAll(() => {
    return clearDatabase();
});

describe('GET /notes/', () => {
    test.todo('getting all public and this user private notes');

    test.todo('getting all private notes');

    test('getting all public notes', () => {
    const body = { filter: { publish: true }};
    return request(app)
        .get('/notes/')
        .set('Content-Type', 'application/json')
        .send(body)
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.header['content-type']).toBe('application/json; charset=utf-8');
            expect(response.body).toHaveLength(publishedNotes.length);
            for(var i = 0; i < publishedNotes.length; i++){
                expect(response.body[i]).toHaveProperty('publish', true);
            }
        });
    });

    describe('retrive with filter', () => {
        test('retrive by title', () => {
        const body = { filter: { title : aPublishedNote.title }};
        return request(app)
            .get('/notes/')
            .set('Content-Type', 'application/json')
            .send(body)
            .then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.header['content-type']).toBe('application/json; charset=utf-8');
                expect(response.body).toHaveLength(1);
                expect(response.body[0]).toEqual(aPublishedNote);
            });    
        });
    
        test.todo('retrieve by date');
    });

    test('missing filter field req must return empty object', () => {
    return request(app)
        .get('/notes/')
        .set('Content-Type', 'application/json')
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.header['content-type']).toBe('application/json; charset=utf-8');
            expect(response.body).toEqual({});
        });
    });  

    test('unexpected fields in filter wont be reconigzed', () => {
    const body = { filter: { name : aPublishedNote.title }};
    return request(app)
        .get('/notes/')
        .set('Content-Type', 'application/json')
        .send(body)
        .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.header['content-type']).toBe('application/json; charset=utf-8');
            expect(response.body).toHaveLength(notes.length);
        });
    });

    describe('filter fields with invalid values', () => {
        test.todo('invalid value for publish field');

        test.todo('invalid value for date');
    });

});

describe('POST /notes/', () => {
    test('create a valid note', () => {
        const body = { note: aNonCreatedNote };
        const domain = 'localhost';
        return request(app)
        .post('/notes')
        .set('Content-Type', 'application/json')
        .set('Cookie', [
            `jwt=${aJWT.token}; Max-Age=${aJWT.expires}; Path=/; HttpOnly; Domain=${domain}`
        ])
        .send(body)
        .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("title", aNonCreatedNote.title);
            expect(response.body).toHaveProperty("content", aNonCreatedNote.content);
            expect(response.body).toHaveProperty("publish", aNonCreatedNote.publish);
            expect(response.body).toHaveProperty("description");
            expect(response.body).toHaveProperty("_id");
            expect(response.body).toHaveProperty("createdAt");
            expect(response.body).toHaveProperty("updatedAt");
        });
    });

    test.todo('send a empty note');

    test.todo('missing note field on req body');

    test.todo('missing a required field note');

    test.todo('note with invalid value');
});

describe('GET /notes/:noteid', () => {
    test('getting valid note', () => {
    return request(app)
        .get('/notes/' + aPublishedNote._id.toString())
        .set('Content-Type', 'application/json')
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.header['content-type']).toBe('application/json; charset=utf-8');
            expect(response.body).toEqual(aPublishedNote);
        });
    });

    test('try to get a inexistent note', () => {
        var noteId = 1;
        var error = errors.inexistentNoteId(noteId);
        return request(app)
            .get('/notes/' + noteId)
            .set('Content-Type', 'application/json')
            .then(response => {
                expect(response.statusCode).toBe(error.status);
                expect(response.header['content-type']).toBe('application/json; charset=utf-8');
                expect(response.body).toEqual({ msg: error.clientMsg });
            });
    });
});