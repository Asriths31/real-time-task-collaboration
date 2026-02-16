import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { boardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Boards.css';

function Boards() {
  const [boards, setBoards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const[isConfirm,setIsconfirm]=useState(false)
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const response = await boardAPI.getBoards();
      setBoards(response.data.boards);
    } catch (error) {
      console.error('Failed to load boards:', error);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    try {
      await boardAPI.createBoard({ title, description });
      setShowModal(false);
      setTitle('');
      setDescription('');
      loadBoards();
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this board?')) {
      try {
        await boardAPI.deleteBoard(id);
        loadBoards();
      } catch (error) {
        console.error('Failed to delete board:', error);
      }
    }
  };

  return (
    <div className="boards-page">
      <header>
        <h1>My Boards</h1>
        <div>
          <span>Hello, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="boards-grid">
        <div className="board-card create" onClick={() => setShowModal(true)}>
          <div className="plus">+</div>
          <p>Create Board</p>
        </div>

        {boards.map((board) => (
          <div key={board._id} className="board-card" onClick={() => navigate(`/board/${board._id}`)}>
            <h3>{board.title}</h3>
            <p>{board.description || 'No description'}</p>
            <button className="delete" onClick={(e) => handleDelete(board._id, e)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {
        isConfirm&&(
                  <div className="modal" onClick={() => handleDelete(board._id, e) }>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                Are you sure
                            </div>
                  </div>

        )
      }

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Board</h2>
            <form onSubmit={handleCreateBoard}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Board title"
                required
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows="3"
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Boards;
