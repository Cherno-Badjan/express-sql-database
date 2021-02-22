require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns characters', async () => {

      const expectation = [
        {
          'id': 1,
          'first_name': 'Netty',
          'last_name': 'Lerven',
          'age': 35,
          'gender': 'Non-binary',
          'vegetarian': false,
          'owner_id': 1
        },
        {
          'id': 2,
          'first_name': 'Assu',
          'last_name': 'Baba',
          'age': 25,
          'gender': 'Male',
          'vegetarian': false,
          'owner_id': 1
        },
        {
          'id': 3,
          'first_name': 'Paul',
          'last_name': 'Bogle',
          'age': 30,
          'gender': 'Male',
          'vegetarian': false,
          'owner_id': 1
        },
        {
          'id': 4,
          'first_name': 'Miss',
          'last_name': 'Njie',
          'age': 28,
          'gender': 'Female',
          'vegetarian': true,
          'owner_id': 1
        },
        {
          'id': 5,
          'first_name': 'Sirius',
          'last_name': 'Black',
          'age': 35,
          'gender': 'Non-binary',
          'vegetarian': false,
          'owner_id': 1
        },
        {
          'id': 6,
          'first_name': 'James',
          'last_name': 'Potter',
          'age': 35,
          'gender': 'Male',
          'vegetarian': false,
          'owner_id': 1
        },
        {
          'id': 7,
          'first_name': 'Lucius',
          'last_name': 'Malfoy',
          'age': 40,
          'gender': 'Non-binary',
          'vegetarian': true,
          'owner_id': 1
        },
        {
          'id': 8,
          'first_name': 'Nearly Headless',
          'last_name': 'Nick',
          'age': 1500,
          'gender': 'Non-binary',
          'vegetarian': false,
          'owner_id': 1
        },
        {
          'id': 9,
          'first_name': 'Bloody',
          'last_name': 'Baron',
          'age': 2000,
          'gender': 'Male',
          'vegetarian': true,
          'owner_id': 1
        },
        {
          'id': 10,
          'first_name': 'Odell',
          'last_name': 'Beckham',
          'age': 26,
          'gender': 'Male',
          'vegetarian': false,
          'owner_id': 1
        }

      ];

      const data = await fakeRequest(app)
        .get('/characters')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns character 7', async () => {

      const expectation =
      {
        'id': 7,
        'first_name': 'Lucius',
        'last_name': 'Malfoy',
        'age': 40,
        'gender': 'Non-binary',
        'vegetarian': true,
        'owner_id': 1
      }
        ;

      const data = await fakeRequest(app)
        .get('/characters/7')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('creates a new character Hector Sparta in characters', async () => {

      const newCharacter = {
        first_name: 'Hector',
        last_name: 'Sparta',
        age: 301,
        gender: 'Male',
        vegetarian: false,
      };



      const expectedCharacter =
      {
        ...newCharacter,
        id: 11,
        owner_id: 1,
      }
        ;

      const data = await fakeRequest(app)
        .post('/characters')
        .send(newCharacter)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectedCharacter);

      const allCharacters = await fakeRequest(app)
        .get('/characters')
        .expect('Content-Type', /json/)
        .expect(200);

      const hectorSparta = allCharacters.body.find(character => character.first_name === 'Hector');

      expect(hectorSparta).toEqual(expectedCharacter);
    });


  });
});
