const request = require('supertest');
const { describe, expect, test, beforeAll, afterAll } = require('@jest/globals');
const app = require('../app');
const errors = require('../lib/errors');
const { initializeDatabase, clearDatabase } = require('../testdbsetup');

let notes;
let publishedNotes;
let aPublishedNote;

beforeAll(() => {
    return initializeDatabase().then((ns) => {
        notes = ns.map((v) => { 
            n = {...v._doc}; 
            n._id = v._id.toString(); 
            n.createdAt = n.createdAt.toJSON();
            n.updatedAt = n.updatedAt.toJSON();
            return n; 
        });
        publishedNotes = notes.filter((v) => v.publish);
        aPublishedNote = publishedNotes[0];
    });
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

    test('no filter field req must return empty object', () => {
    return request(app)
        .get('/notes/')
        .set('Content-Type', 'application/json')
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.header['content-type']).toBe('application/json; charset=utf-8');
            expect(response.body).toEqual({});
        });
    });

    test('retrive with filter', () => {
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

    test('invalid fields in filter wont be reconigzed', () => {
    const body = { filter: { name : aPublishedNote.title }};
    return request(app)
        .get('/notes/')
        .set('Content-Type', 'application/json')
        .send(body)
        .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.header['content-type']).toBe('application/json; charset=utf-8');
            expect(response.body).toHaveLength(publishedNotes.length);
        });
    });

    test.todo('filter fields with invalid values');

});

describe('POST /notes/', () => {
    test.todo('create a valid note');

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