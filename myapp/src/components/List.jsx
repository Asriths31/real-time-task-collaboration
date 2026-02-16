import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Task from './Task';
import { listAPI, taskAPI } from '../services/api';
import './List.css';

function List({ list, onUpdate }) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      await taskAPI.createTask(list._id, { title: taskTitle });
      setTaskTitle('');
      setIsAddingTask(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleDeleteList = async () => {
    if (window.confirm('Delete this list and all tasks?')) {
      try {
        await listAPI.deleteList(list._id);
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Failed to delete list:', error);
      }
    }
  };

  return (
    <div className="list">
      <div className="list-header">
        <h3>{list.title}</h3>
        <button onClick={handleDeleteList}>×</button>
      </div>

      <Droppable droppableId={list._id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`list-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
          >
            {list.tasks && list.tasks.map((task, index) => (
              <Task
                key={task._id}
                task={task}
                index={index}
                onUpdate={onUpdate}
                onDelete={onUpdate}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="list-footer">
        {isAddingTask ? (
          <form onSubmit={handleAddTask}>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Task title..."
              autoFocus
            />
            <div className="actions">
              <button type="submit">Add</button>
              <button type="button" onClick={() => setIsAddingTask(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setIsAddingTask(true)}>+ Add Task</button>
        )}
      </div>
    </div>
  );
}

export default List;
