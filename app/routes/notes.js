var express = require('express');
var router = express.Router();

const Note = require('../models/note.js');

const withAuth = require('../middlewares/auth');

router.post('/', withAuth, async (req, res) => {
    const {title, body} = req.body;

    try {
        let note = new Note({title: title, body: body, author: req.user._id});
        await user.save();
        res.status(200).json(note);
    } catch(error) {
        res.status(500).json({error: 'Problem to create a new note'});
    }
})

router.get('/:id', withAuth, async (req, res) => {
    try {
        const { id } = req.params;
        let note = await Note.findById(id);

        if(isOwner(req.user, note))
            res.json(note);
        else
            res.status(403).json({error: 'Permission denied'});
    } catch(error) {
        res.status(500).json({error: 'Problem to get a note'});
    }
})

const isOwner = (use, note) => {
    if(JSON.stringify(user._id) == JSON.stringify(note.author._id))
        return true;
    else
        return false;
}

router.get('/', withAuth, async function(req, res) {
    try {
        let notes = await Note.find({author: req.user._id })
        res.send(notes)
    } catch (error) {
        res.json({error: error}).status(500)
    }
});

router.get('/search', withAuth, async (req, res) => {
    const {query} = req.query;

    try {
        let notes = await Note.find({ author: req.user._id }).find({ $text: { $search: query }});
        res.json(notes);
    } catch(error) {
        res.json({error, error}).status(500);
    }
});

router.put('/:id', withAuth, async function(req, res) {
    const { title, body } = req.body;
    const { id } = req.params;

    try {
        var note = await Note.findOneAndUpdate(
            {_id: id}, 
            { $set: { title: title, body: body}}, 
            { upsert: true, 'new': true }
        )
        res.json(note);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.delete('/:id', withAuth, async function(req, res) {
    const { id } = req.params;  

    try {
        let note = await Note.findById(id);
        
        if(note && is_owner(req.user, note)){
            await note.delete();
            res.json({message: 'OK'}).status(204);
        } else {
          res.json({error: 'Forbidden'}).status(403);
        }
    } catch (err) {
        res.status(500).send(err);
    }
});


module.exports = router;