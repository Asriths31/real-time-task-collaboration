const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: true
  },
  position: {
    type: Number,
    default: 0
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dueDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
