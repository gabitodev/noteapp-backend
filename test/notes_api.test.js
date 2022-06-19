const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const User = require('../models/user');
const Note = require('../models/note');
const bcrypt = require('bcrypt');

const notesOftestUser = async () => {
  const notes = await Note.find({ user: initialUsers[1]._id });
  const notesJSON = notes.map(note => note.toJSON());
  return notesJSON;
};

const initialNotes = [
  {
    title: 'Test Note',
    content: '¡This is a test note!',
    user: '628423ef39d47bef51283534',
  },
  {
    title: 'Test with Jest is awesome',
    content: 'Jest is a excellent library to test the frontend and backend',
    user: '628423ef39d47bef51283534',
  },
];

const initialUsers = [
  {
    _id: '628423dc39d47bef51283531',
    username: 'test123',
    name: 'Gabriel Garcia',
    password: 'test.987',
    notes: []
  },
  {
    _id: '628423ef39d47bef51283534',
    username: 'juneke',
    name: 'Junior Gomez',
    password: 'test.123',
    notes: ['5a422a851b54a676234d17f7', '5a422aa71b54a676234d17f8'],
  },
];

let token;
describe('notes router', () => {
  beforeEach(async () => {
    await Note.deleteMany({});
    await User.deleteMany({});
    for (let note of initialNotes) {
      let noteObject = new Note(note);
      await noteObject.save();
    }
    for (let user of initialUsers) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(user.password, saltRounds);
      let userObject = new User({
        _id: user._id,
        username: user.username,
        name: user.name,
        passwordHash: passwordHash,
        notes: user.notes
      });
      await userObject.save();
    }

    const response = await api
      .post('/api/login')
      .send({
        username: initialUsers[1].username,
        password: initialUsers[1].password
      })
      .expect(200);

    token = response.body.accessToken;
  }, 100000);

  describe('get notes for the user logged in', () => {
    test('suceeds with code 200 to get the notes of one user', async () => {
      const response = await api
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const notesAtEnd = await notesOftestUser();
      expect(response.body).toHaveLength(notesAtEnd.length);
    });

    test('fails with code 401 to get the notes of one user if token is invalid', async () => {
      const badToken = '84814818118478481';

      await api
        .get('/api/notes')
        .set('Authorization', `Bearer ${badToken}`)
        .expect(401);
    });
  });

  describe('creation of a note', () => {
    test('suceeds with code 201 if user creates a note with the correct title and content', async () => {
      const notesAtStart = await notesOftestUser();

      const note = {
        title: 'Fresh note',
        content: 'A new new new new ultra new note'
      };

      const newNote = await api
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(note)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const notesAtEnd = await notesOftestUser();
      const formatedNotesAtEnd = notesAtEnd.map(note => {
        return {
          title: note.title,
          content: note.content,
          id: note.id,
          user : note.user.toString()
        };
      });

      expect(notesAtEnd).toHaveLength(notesAtStart.length + 1);
      expect(formatedNotesAtEnd).toContainEqual({
        title: newNote.body.title,
        content: newNote.body.content,
        id: newNote.body.id,
        user: initialUsers[1]._id,
      });
    });

    test('fails with code 400 if there is no title', async () => {
      const notesAtStart = await notesOftestUser();
      const note = {
        content: 'A new new new new ultra new note'
      };

      const response = await api
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(note)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      const notesAtEnd = await notesOftestUser();
      expect(response.body.error).toBe('title and content are required');
      expect(notesAtEnd).toHaveLength(notesAtStart.length);
    });

    test('fails with code 400 if there is no content', async () => {
      const notesAtStart = await notesOftestUser();
      const note = {
        title: 'Fresh note'
      };

      const response = await api
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(note)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      const notesAtEnd = await notesOftestUser();
      expect(response.body.error).toBe('title and content are required');
      expect(notesAtEnd).toHaveLength(notesAtStart.length);
    });
  });

  describe('deletion of a note', () => {
    test('suceeds with code 204 in deleting the note only if the user is logged in and is the creator of the note', async () => {
      const notesAtStart = await notesOftestUser();
      const noteToDelete = notesAtStart[0];

      await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      const notesAtEnd = await notesOftestUser();
      const notesAtEndTitles = notesAtEnd.map(note => note.title);

      expect(notesAtEnd).toHaveLength(notesAtStart.length - 1);
      expect(notesAtEndTitles).not.toContain(noteToDelete.title);
    });
  });

  describe('updating a note', () => {
    test('suceeds with code 200 if correct data is passed', async () => {
      const notesAtStart = await notesOftestUser();
      const noteToUpdate = notesAtStart[0];

      const updateNote = {
        ...noteToUpdate,
        title: 'NEW TITLE',
        content: 'NEW CONTENT'
      };

      await api
        .put(`/api/notes/${noteToUpdate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateNote)
        .expect(200);

      const notesAtEnd = await notesOftestUser();
      const notesAtEndTitles = notesAtEnd.map(note => note.title);

      expect(notesAtEnd).toHaveLength(notesAtStart.length);
      expect(notesAtEndTitles).toContain(updateNote.title);
    });
  });
});