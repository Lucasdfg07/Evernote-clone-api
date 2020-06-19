var express = require('express');
var router = express.Router();

const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_TOKEN;
const withAuth = require('../middlewares/auth');

router.get('/', async function(req, res) {
  try {
    const user = await User.find()
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({error: "Error listing Users"});
  }
});

router.put('/:id', withAuth, async function(req, res) {
  const { name, email, password } = req.body;
  const { id } = req.params;

  try {
    var user = await User.findById(id);

    user.name = name;
    user.email = email;
    user.password = password;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete('/', withAuth, async function(req, res) {
  try {
    let user = await User.findOne({_id: req.user._id });    
    await user.delete();
    
    res.json({message: 'OK'}).status(201);
  } catch (error) {
    res.status(500).json({error: error});
  }
});

router.post('/register', async function(req, res) {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });

  try {
    await user.save()
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({error: "Error registering new user please try again."});
  }
});

router.post('/login', async(req, res) => {
  const { email, password } = req.body;

  try { 
    let user = await User.findOne({ email });
    if(!user)
      res.status(401).json({error: 'Incorrect email or password'})
    else
      user.isCorrectPassword(password, function(err, same) {
        if(!same) {
          res.status(401).json({error: 'Incorrect email or password'})
        } else {
          const token = jwt.sign({email}, secret, {expiresIn: '30d'})
          res.json({user: user, token: token})
        }
      })
  } catch(error) {
    res.status(500).json({error: 'Internal error, please try again later.'})
  }
})

module.exports = router;
