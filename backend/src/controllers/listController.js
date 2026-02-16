const List = require('../models/List');
const Board = require('../models/Board');
const Task = require('../models/Task');

exports.createList = async (req, res) => {
  try {
    const { title } = req.body;
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const hasAccess = board.owner.equals(req.user._id) || 
                      board.members.includes(req.user._id);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const listCount = await List.countDocuments({ board: board._id });
    
    const list = new List({
      title,
      board: board._id,
      position: listCount
    });

    await list.save();
    res.status(201).json({ list });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateList = async (req, res) => {
  try {
    const { title } = req.body;
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const board = await Board.findById(list.board);
    const hasAccess = board.owner.equals(req.user._id) || 
                      board.members.includes(req.user._id);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    list.title = title;
    await list.save();

    res.json({ list });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const board = await Board.findById(list.board);
    const hasAccess = board.owner.equals(req.user._id) || 
                      board.members.includes(req.user._id);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Task.deleteMany({ list: list._id });
    await list.deleteOne();

    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
