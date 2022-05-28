const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const User = require('../models/user');
const bcrypt = require('bcrypt');

const usersInDB = async () => {
  const users = await User.find({});
  return users.map(b => b.toJSON());
};

beforeEach(async () => {
  await User.deleteMany({});
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('secret', saltRounds);
  const user = new User({username: 'test123', name:'el tester', passwordHash});
  await user.save();
}, 100000);


describe('addition of a user', () => {
  test('susceeds with code 201 if data is valid', async () => {
    const usersAtStart = await usersInDB();
    
    const newUser = {
      username: 'alejandro78',
      name: 'Alejandro Gonzales',
      password: 'secret.25'
    };

    await api
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

  test('fails with code 400 if password does not contain a number', async () => {
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

  test('fails with code 400 if password does not contain a special character', async () => {
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
});