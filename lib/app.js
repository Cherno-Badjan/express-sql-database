const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this protected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/characters', async (req, res) => {
  try {
    const data = await client.query(`
    SELECT 
      characters.id,
      characters.first_name,
      characters.last_name,
      characters.age,
      genders.name as gender,
      characters.vegetarian,
      characters.gender_id,
      characters.owner_id 
     FROM characters 
     JOIN genders 
     ON characters.gender_id = genders.id`);

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});
app.get('/genders', async (req, res) => {
  try {
    const data = await client.query('SELECT * FROM genders');

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});


app.get('/characters/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('SELECT characters.id,characters.first_name, characters.last_name,characters.age, genders.name as gender, characters.gender_id, characters.vegetarian,characters.owner_id FROM characters JOIN genders ON characters.gender_id = genders.id WHERE characters.id=$1', [id]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});


app.post('/characters', async (req, res) => {
  try {
    const data = await client.query(`INSERT INTO characters (first_name, last_name, age, vegetarian, gender_id, owner_id)
    VALUES($1, $2, $3, $4, $5, $6)
    RETURNING * `,

      [req.body.first_name, req.body.last_name, req.body.age, req.body.vegetarian, req.body.gender_id, 1]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});
app.put('/characters/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const data = await client.query(`UPDATE characters SET first_name = $1, last_name =$2, age=$3, gender_id=$4, vegetarian=$5
    WHERE id=$6
    RETURNING * `,

      [req.body.first_name, req.body.last_name, req.body.age, req.body.gender_id, req.body.vegetarian, id]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});
app.delete('/characters/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query(`DELETE FROM characters 
    WHERE id=$1
    RETURNING * `, [id]);


    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
