const Task = require('../models/Task');
const List = require('../models/List');
const Board = require('../models/Board');

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const list = await List.findById(req.params.listId);

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const board = await Board.findById(list.board);
    const hasAccess = board.owner.equals(req.user._id) || 
                      board.members.includes(req.user._id);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const taskCount = await Task.countDocuments({ list: list._id });
    
    const task = new Task({
      title,
      description,
      list: list._id,
      position: taskCount,
      dueDate,
      assignees: []
    });

    await task.save();
    await task.populate('assignees', 'name email');

    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const list = await List.findById(task.list);
    const board = await Board.findById(list.board);
    const hasAccess = board.owner.equals(req.user._id) || 
                      board.members.includes(req.user._id);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    task.title = title;
    task.description = description;
    task.dueDate = dueDate;
    await task.save();
    await task.populate('assignees', 'name email');

    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const list = await List.findById(task.list);
    const board = await Board.findById(list.board);
    const hasAccess = board.owner.equals(req.user._id) || 
                      board.members.includes(req.user._id);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.moveTask = async (req, res) => {
  try {
    const { listId, position } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const list = await List.findById(task.list);
    const board = await Board.findById(list.board);
    const hasAccess = board.owner.equals(req.user._id) || 
                      board.members.includes(req.user._id);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    task.list = listId;
    task.position = position;
    await task.save();

    res.json({ message: 'Task moved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignTask = async (req, res) => {
  try {
    const { userId } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const list = await List.findById(task.list);
    const board = await Board.findById(list.board);
    const hasAccess = board.owner.equals(req.user._id) || 
                      board.members.includes(req.user._id);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!board.members.includes(userId)) {
      return res.status(400).json({ error: 'User is not a board member' });
    }

    if (!task.assignees.includes(userId)) {
      task.assignees.push(userId);
      await task.save();
    }

    await task.populate('assignees', 'name email');
    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
