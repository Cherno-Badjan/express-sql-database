const client = require('../lib/client');
// import our seed data:
const { characters } = require('./characters.js');
const usersData = require('./users.js');
const gendersData = require('./genders.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
          [user.email, user.hash]);
      })
    );


    const genders = await Promise.all(
      gendersData.map(gender => {
        return client.query(`
                      INSERT INTO genders (name)
                      VALUES ($1)
                      RETURNING *;
                  `,
          [gender.name]);
      })
    );
    const user = users[0].rows[0];




    await Promise.all(
      characters.map(character => {
        return client.query(`
                    INSERT INTO characters (first_name, last_name, age,gender_id, vegetarian,owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
          [character.first_name, character.last_name, character.age, character.gender_id, character.vegetarian, user.id]);
      })
    );


    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}
