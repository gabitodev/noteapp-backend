const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const User = require('../models/user');
const bcrypt = require('bcrypt');

let userId;

const usersInDB = async () => {
  const users = await User.find({});
  return users.map(b => b.toJSON());
};

describe('users router', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('secret', saltRounds);
    const user = new User({username: 'test123', name:'el tester', passwordHash});
    userId = user._id.toString();
    await user.save();
  }, 100000);
  
  describe('addition of user', () => {
    test('susceeds with code 201 if data is valid', async () => {
      const usersAtStart = await usersInDB();
      
      const newUser = {
        username: 'alejandro78',
        name: 'Alejandro Gonzales',
        password: 'secret.25'
      };
  
      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/);
  
      const usersAtEnd = await usersInDB();
  
      const usernames = usersAtEnd.map(user => user.username);
      expect(usernames).toContain(newUser.username);
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);
    }, 100000);
  
    test('fails with code 400 if no password is passed', async () => {
      const usersAtStart = await usersInDB();
      
      const newUser = {
        username: 'alejandro78',
        name: 'Alejandro Gonzales',
      };
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);
  
      const usersAtEnd = await usersInDB();
  
      expect(result.body.error).toContain('username and password are required');
      const usernames = usersAtEnd.map(user => user.username);
      expect(usernames).not.toContain(newUser.username);
      expect(usersAtEnd).toEqual(usersAtStart);
    }, 100000);
  
    test('fails with code 400 if no username is passed', async () => {
      const usersAtStart = await usersInDB();
      
      const newUser = {
        name: 'Alejandro Gonzales',
        password: 'secret.25'
      };
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);
  
      const usersAtEnd = await usersInDB();
  
      expect(result.body.error).toContain('username and password are required');
      const usernames = usersAtEnd.map(user => user.username);
      expect(usernames).not.toContain(newUser.username);
      expect(usersAtEnd).toEqual(usersAtStart);
    }, 100000);
  
    test('fails with code 400 if username already exist', async () => {
      const usersAtStart = await usersInDB();
      
      const newUser = {
        username: 'test123',
        name: 'Alejandro Gonzales',
        password: 'secret.25'
      };
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);
  
      const usersAtEnd = await usersInDB();
  
      expect(result.body.error).toContain('username already exist');
      const usernames = usersAtEnd.map(user => user.name);
      expect(usernames).not.toContain(newUser.name);
      expect(usersAtEnd).toEqual(usersAtStart);
    }, 100000);
  
    test('fails with code 400 if username length is less than 6 characters', async () => {
      const usersAtStart = await usersInDB();
      
      const newUser = {
        username: 'test',
        name: 'Alejandro Gonzales',
        password: 'secret.25'
      };
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);
  
      const usersAtEnd = await usersInDB();
  
      expect(result.body.error).toContain('username length must be more than 6 characters');
      const usernames = usersAtEnd.map(user => user.name);
      expect(usernames).not.toContain(newUser.name);
      expect(usersAtEnd).toEqual(usersAtStart);
    }, 100000);
  
    test('fails with code 400 if password does not contain at least 1 number', async () => {
      const usersAtStart = await usersInDB();
      
      const newUser = {
        username: 'alejandro78',
        name: 'Alejandro Gonzales',
        password: 'secretooooooo'
      };
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);
  
      const usersAtEnd = await usersInDB();
  
      expect(result.body.error).toContain('password requires at leats 1 number');
      const usernames = usersAtEnd.map(user => user.name);
      expect(usernames).not.toContain(newUser.name);
      expect(usersAtEnd).toEqual(usersAtStart);
    }, 100000);
  
    test('fails with code 400 if password does not contain at least 1 special character', async () => {
      const usersAtStart = await usersInDB();
      
      const newUser = {
        username: 'alejandro78',
        name: 'Alejandro Gonzales',
        password: 'secretoo47'
      };
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);
  
      const usersAtEnd = await usersInDB();
  
      expect(result.body.error).toContain('password requires at leats 1 special character');
      const usernames = usersAtEnd.map(user => user.name);
      expect(usernames).not.toContain(newUser.name);
      expect(usersAtEnd).toEqual(usersAtStart);
    }, 100000);

    test('fails with code 400 if password does not contain at least 1 letter', async () => {
      const usersAtStart = await usersInDB();
      
      const newUser = {
        username: 'alejandro78',
        name: 'Alejandro Gonzales',
        password: '47.5587575'
      };
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);
  
      const usersAtEnd = await usersInDB();
  
      expect(result.body.error).toContain('password requires at least 1 letter');
      const usernames = usersAtEnd.map(user => user.name);
      expect(usernames).not.toContain(newUser.name);
      expect(usersAtEnd).toEqual(usersAtStart);
    }, 100000);
  });
  
  describe('getting one user', () => {
    test('gets user with id', async () => {
      const result = await api
        .get(`/api/users/${userId}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
  
      expect(result.body.username).toEqual('test123');
    }, 100000);
  
    test('fails user with wrong id', async () => {
      const result = await api
        .get(`/api/users/4848484`)
        .expect(401)
        .expect('Content-Type', /application\/json/);
      
      expect(result.body.error).toContain('invalid user');
    }, 100000);
  });
});