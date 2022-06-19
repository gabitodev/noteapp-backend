const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const User = require('../models/user');
const bcrypt = require('bcrypt');

describe('login router', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('secret.65', saltRounds);
    const user = new User({ username: 'test123', name:'el tester', passwordHash });
    await user.save();
  }, 100000);

  test('suceeds with code 200 if credentials are correct', async () => {

    const user = {
      username: 'test123',
      password: 'secret.65'
    };

    const response = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body.username).toEqual(user.username);
  });

  test('fails with code 401 if username is incorrect', async () => {

    const user = {
      username: 'test1234456',
      password: 'secret.65'
    };

    const response = await api
      .post('/api/login')
      .send(user)
      .expect(401)
      .expect('Content-Type', /application\/json/);

    expect(response.body.error).toBe('invalid username or password');
  });

  test('fails with code 401 if password is incorrect', async () => {

    const user = {
      username: 'test123',
      password: 'secretooooo'
    };

    const response = await api
      .post('/api/login')
      .send(user)
      .expect(401)
      .expect('Content-Type', /application\/json/);

    expect(response.body.error).toBe('invalid username or password');
  });
});