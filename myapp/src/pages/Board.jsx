import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import List from '../components/List';
import { boardAPI, listAPI, taskAPI } from '../services/api';
import { joinBoard, leaveBoard } from '../services/socket';
import './Board.css';

function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [isAddingList, setIsAddingList] = useState(false);
  const [listTitle, setListTitle] = useState('');

  useEffect(() => {
    loadBoard();
    joinBoard(id);
    return () => leaveBoard(id);
  }, [id]);

  const loadBoard = async () => {
    try {
      const response = await boardAPI.getBoard(id);
      setBoard(response.data.board);
      setLists(response.data.lists);
    } catch (error) {
      console.error('Failed to load board:', error);
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!listTitle.trim()) return;

    try {
      await listAPI.createList(id, { title: listTitle });
      setListTitle('');
      setIsAddingList(false);
      loadBoard();
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && 
        destination.index === source.index) return;

    try {
      await taskAPI.moveTask(draggableId, {
        listId: destination.droppableId,
        position: destination.index
      });
      loadBoard();
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  if (!board) return <div className="loading">Loading...</div>;

  return (
    <div className="board-page">
      <header>
        <button onClick={() => navigate('/boards')}>← Back</button>
        <h1>{board.title}</h1>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-content">
          {lists.map((list) => (
            <List key={list._id} list={list} onUpdate={loadBoard} />
          ))}

          <div className="list add-list">
            {isAddingList ? (
              <form onSubmit={handleAddList}>
                <input
                  type="text"
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                  placeholder="List title..."
                  autoFocus
                />
                <div className="actions">
                  <button type="submit">Add</button>
                  <button type="button" onClick={() => setIsAddingList(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button onClick={() => setIsAddingList(true)}>+ Add List</button>
            )}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}

export default Board;
