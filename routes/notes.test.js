const { describe, expect, test, beforeAll, afterAll } = require('@jest/globals');
const { clearDatabase, insertNotes, insertUsers } = require('../testdbsetup');
const request = require('supertest');
const app = require('../app');
const errors = require('../lib/errors');
const utils = require('../lib/utils');

const domain = 'localhost';

let notes = [
    {
        title: "Instance Methods vs Static Methods",
        description: "What is the difference between instance methods and static methods",
        content: "Instance methods are methods that are called for objects, for an instance of a class. Static methods are called for the class itself, not the instance.",
        publish: true
    },
    {
        title: "How to add file chunks on commits",
        content: "Use 'git add -p file-name' to cut the file on chunks. git will show the chunks and you can choose if you will add each of them on commit by:\nType y (yes) to add the chunk\nType n (no) to not add the chunk\nType q (quit) to no stage this chunk or any of the remaining ones\nType a (all) to stage this chunk and all the later ones in the file\nType d to not stage this chunk or any of the later chunks in the file\nType e (edit) to manually edit the current chunk\nType s (split) to split this chunk into smaller hunks\nType g (go) to select a chunk to go to\nType j to leave this chunk undecided and see next undecided chunk\nType J to leave this chunk undecided and see next chunk\nType / to search for  a chunk matching the given regex\nType ? to print help",
        publish: false
    },
    {
        title : "What are the SOLID Principles",
        description : "Explaining The Software Design S.O.L.I.D. Principles for OOP",
        content : "1. S stands for Single Responsability Principle. It says that each class must have one and only kind of responsability (example, a class should not have both printing logic and business logic), so it will have fewer test cases, a more organized code and fewer dependencies.\n2. O stands for Open-Closed Principle. It says a class should be open for extension and closed to modification, therefore, open to adding new functionality but not changing tested and reliable code.",
        publish : false
    }
];

let users = [
    {
        "name": "Vaughan Knox",
        "nickname": "VK",
        "email": "et@protonmail.com",
        "password": "password"
    },
    {
        "name": "Edson Rodrigo",
        "nickname": "edson",
        "email": "edson_rodrigo_figueiredo@tahoo.com.br",
        "password": "5BwiC59N92"
    }
];

let nonCreatedNote = {
    title : "How to walk",
    content : "move a foot then the other",
    publish : false
};

let publishedNotes;
let publishedNote;

function dbDataToJSONFormat (data) {
    let v = {...data._doc}; 
    v._id = data._id.toString(); 
    v.createdAt = v.createdAt.toJSON();
    v.updatedAt = v.updatedAt.toJSON();
    delete v['__v'];
    return v; 
}

beforeAll(() => {
    return insertUsers(users)
    .then((us) => {
        users = us.map(dbDataToJSONFormat);
        
        users = users.map((v) => { 
            v.jwt = utils.issueJWT(v);
            v.jwt.expires = parseInt(v.jwt.expires)/1000;
            return v;
        });
        
        notes = notes.map((v) => { 
            v.author = users[1]._id;
            return v;
        })

        return insertNotes(notes);
    })
    .then((ns) => {
        notes = ns.map(dbDataToJSONFormat);

        notes = notes.map((v) => { 
            v.author = { 
                _id: users[1]._id, 
                nickname: users[1].nickname 
            };
            return v;
        })
        
        publishedNotes = notes.filter((v) => v.publish);
        publishedNote = publishedNotes[0];

        return;
    })
    .catch((err) => console.log(err));
});

afterAll(() => {
    return clearDatabase();
});

describe('GET /notes/', () => {

    describe('getting all public and this user private notes', () => {
        function getTestData (i) {
            if(i === 0) return [ users[0].jwt, publishedNotes ];
            else return [ users[1].jwt, notes ];
        }

        test.each([
           ["user with no created private notes", 0], 
           ["user with created private notes", 1]
        ])("%s", (label, i) => {
            const [ JWT, filteredNotes ] = getTestData(i);
            
            return request(app)
            .get('/notes/')
            .set('Content-Type', 'application/json')
            .set('Cookie', [
                `jwt=${JWT.token}; Max-Age=${JWT.expires}; Path=/; HttpOnly; Domain=${domain}`
            ])
            .then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.header['content-type']).toBe('application/json; charset=utf-8');
                
                expect(response.body).toHaveLength(filteredNotes.length);
                
                for(var i = 0; i < filteredNotes.length; i++){
                    expect(response.body[i]).toHaveProperty('_id');
                    expect(response.body[i]).toHaveProperty('title');
                    expect(response.body[i]).toHaveProperty('author');
                    expect(response.body[i]).toHaveProperty('description');
                    expect(response.body[i]).toHaveProperty('updatedAt');
                    
                    expect(response.body[i]).not.toHaveProperty('content');
                    expect(response.body[i]).not.toHaveProperty('createdAt');
                }
            });
        });
    });


    test('getting private notes', () => {
        const body = { filter : { publish : false }};
        let JWT = users[1].jwt;
        let privateNotesLength = notes.length - publishedNotes.length;
        return request(app)
        .get('/notes/')
        .set('Content-Type', 'application/json')
        .set('Cookie', [
            `jwt=${JWT.token}; Max-Age=${JWT.expires}; Path=/; HttpOnly; Domain=${domain}`
        ])
        .send(body)
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.header['content-type']).toBe('application/json; charset=utf-8');
            
            expect(response.body).toHaveLength(privateNotesLength);
            for(var i = 0; i < privateNotesLength; i++){
                expect(response.body[i]).toHaveProperty('_id');
                expect(response.body[i]).toHaveProperty('title');
                expect(response.body[i]).toHaveProperty('author');
                expect(response.body[i]).toHaveProperty('description');
                expect(response.body[i]).toHaveProperty('updatedAt');
                
                expect(response.body[i]).not.toHaveProperty('content');
                expect(response.body[i]).not.toHaveProperty('createdAt');
            }
        });
    });

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
                expect(response.body[i]).toHaveProperty('_id');
                expect(response.body[i]).toHaveProperty('title');
                expect(response.body[i]).toHaveProperty('author');
                expect(response.body[i]).toHaveProperty('description');
                expect(response.body[i]).toHaveProperty('updatedAt');
                
                expect(response.body[i]).not.toHaveProperty('content');
                expect(response.body[i]).not.toHaveProperty('createdAt');
            }
        });
    });

    describe('retrive with filter', () => {
        test('retrive by title', () => {
        const body = { filter: { title : publishedNote.title }};
        return request(app)
            .get('/notes/')
            .set('Content-Type', 'application/json')
            .send(body)
            .then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.header['content-type']).toBe('application/json; charset=utf-8');
                expect(response.body).toHaveLength(1);
                
                expect(response.body[0]).toHaveProperty('_id', publishedNote._id);
                expect(response.body[0]).toHaveProperty('title', publishedNote.title);
                expect(response.body[0].author).toEqual(publishedNote.author);
                expect(response.body[0]).toHaveProperty('description', publishedNote.description);
                expect(response.body[0]).toHaveProperty('updatedAt', publishedNote.updatedAt);
                
                expect(response.body[0]).not.toHaveProperty('content', publishedNote.content);
                expect(response.body[0]).not.toHaveProperty('createdAt', publishedNote.createdAt);
            });    
        });
    
        test.todo('retrieve by date');
    });

    test.failing('missing filter field req returns empty object', () => {
    return request(app)
        .get('/notes/')
        .set('Content-Type', 'application/json')
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.header['content-type']).toBe('application/json; charset=utf-8');
            expect(response.body).toEqual({});
        });
    });  

    test('unexpected fields in filter wont be recognized', () => {
    const body = { filter: { name : publishedNote.title }};
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

    describe('filter fields with invalid values', () => {
        test.todo('invalid value for publish field');

        test.todo('invalid value for date');
    });

});

describe('POST /notes/', () => {
    test('create a valid note', () => {

        const body = { note: nonCreatedNote };
        const author = users[0];
        const JWT = author.jwt;

        return request(app)
        .post('/notes')
        .set('Content-Type', 'application/json')
        .set('Cookie', [
            `jwt=${JWT.token}; Max-Age=${JWT.expires}; Path=/; HttpOnly; Domain=${domain}`
        ])
        .send(body)
        .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("title", nonCreatedNote.title);
            expect(response.body).toHaveProperty("content", nonCreatedNote.content);
            expect(response.body).toHaveProperty("publish", nonCreatedNote.publish);
            expect(response.body).toHaveProperty("description");
            expect(response.body).toHaveProperty("_id");
            expect(response.body).toHaveProperty("createdAt");
            expect(response.body).toHaveProperty("updatedAt");
            expect(response.body.author).toHaveProperty("_id", author._id);
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
        .get('/notes/' + publishedNote._id.toString())
        .set('Content-Type', 'application/json')
        .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.header['content-type']).toBe('application/json; charset=utf-8');
            expect(response.body).toEqual(publishedNote);
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