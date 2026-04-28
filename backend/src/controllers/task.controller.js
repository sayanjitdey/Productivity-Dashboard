const Task = require('../models/task.model');
const User = require('../models/user.model');

exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId }).select('title status').lean();
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const {title, status} = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    if (title.length > 100) {
      return res.status(400).json({ error: 'Title must be less than 100 characters' });
    }
    const task  = await Task.create({ title, status, userId: req.user.userId });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { id} = req.params;
    const updated = await Task.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        req.body,
        { new: true , runValidators: true}
    );

    if(!updated) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const {id} = req.params;
    const deleted = await Task.findOneAndDelete({ _id: id, userId: req.user.userId });
    if(!deleted) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
