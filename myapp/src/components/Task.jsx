import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { taskAPI } from '../services/api';
import './Task.css';

function Task({ task, index, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  const handleSave = async () => {
    try {
      await taskAPI.updateTask(task._id, { title, description });
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this task?')) {
      try {
        await taskAPI.deleteTask(task._id);
        if (onDelete) onDelete();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task ${snapshot.isDragging ? 'dragging' : ''}`}
        >
          {isEditing ? (
            <div className="task-edit">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description..."
                rows="3"
              />
              <div className="actions">
                <button onClick={handleSave}>Save</button>
                <button onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="task-view">
              <h4>{task.title}</h4>
              {task.description && <p>{task.description}</p>}
              <div className="actions">
                <button onClick={() => setIsEditing(true)}>Edit</button>
                <button onClick={handleDelete}>Delete</button>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

export default Task;
