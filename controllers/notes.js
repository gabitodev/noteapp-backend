const notesRouter = require('express').Router();
const Note = require('../models/note');

notesRouter.get('/', async (request, response) => {
  const { user } = request;
  if (!user) {
    return response.sendStatus(401);
  }
  const notes = await Note.find({ user: user._id });
  return response.status(200).json(notes);
});

notesRouter.post('/', async (request, response) => {
  const { user } = request;
  if (!user) {
    return response.sendStatus(403);
  }

  const { title, content, category } = request.body;
  if (!(title && content)) {
    return response.status(400).json({ error: 'title and content are required' });
  }

  const note = new Note({
    title,
    content,
    category,
    user: user._id
  });

  const savedNote = await note.save();
  await savedNote.populate('user', { username: 1, name: 1 });

  user.notes = user.notes.concat(savedNote._id);

  await user.save();

  response.status(201).json(savedNote);
});

notesRouter.delete('/:id', async (request, response) => {
  const { user } = request;
  if (!user) {
    return response.sendStatus(403);
  }
  const note = await Note.findById(request.params.id);
  if (note.user.toString() === user.id.toString()) {
    await Note.deleteOne(note);
    return response.status(204).end();
  } else {
    response.status(401).json({ error: 'wrong user' });
  }
});

notesRouter.put('/:id', async (request, response) => {
  const { user, body } = request;
  if (!user) {
    return response.sendStatus(403);
  }

  const updateDetails = {
    title: body.title,
    content: body.content,
    category: body.category
  };

  const note = await Note.findById(request.params.id);

  if (note.user.toString() === user.id.toString()) {
    const updatedNote = await Note.findByIdAndUpdate(request.params.id, updateDetails, { new: true });
    return response.status(200).json(updatedNote);
  } else {
    response.status(401).json({ error: 'wrong user' });
  }
});

module.exports = notesRouter;