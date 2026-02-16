const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');
const User = require('../models/User');

exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .sort({createdAt:1});

    res.json({ boards });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check access
    const hasAccess = board.owner._id.equals(req.user._id) || 
                      board.members.some(member => member._id.equals(req.user._id));
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get lists and tasks
    const lists = await List.find({ board: board._id }).sort('position');
    const tasks = await Task.find({ 
      list: { $in: lists.map(l => l._id) } 
    })
    .populate('assignees', 'name email')
    .sort('position');

    // Organize tasks by list
    const listsWithTasks = lists.map(list => ({
      ...list.toObject(),
      tasks: tasks.filter(task => task.list.equals(list._id))
    }));

    res.json({
      board,
      lists: listsWithTasks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;

    const board = new Board({
      title,
      description,
      owner: req.user._id,
      members: [req.user._id]
    });

    await board.save();
    await board.populate('owner', 'name email');

    res.status(201).json({ board });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const { title, description } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (!board.owner.equals(req.user._id)) {
      return res.status(403).json({ error: 'Only owner can update board' });
    }

    board.title = title;
    board.description = description;
    await board.save();

    res.json({ board });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (!board.owner.equals(req.user._id)) {
      return res.status(403).json({ error: 'Only owner can delete board' });
    }

    // Delete all lists and tasks
    const lists = await List.find({ board: board._id });
    await Task.deleteMany({ list: { $in: lists.map(l => l._id) } });
    await List.deleteMany({ board: board._id });
    await board.deleteOne();

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (!board.owner.equals(req.user._id)) {
      return res.status(403).json({ error: 'Only owner can add members' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (board.members.includes(user._id)) {
      return res.status(400).json({ error: 'User already a member' });
    }

    board.members.push(user._id);
    await board.save();

    res.json({ message: 'Member added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
