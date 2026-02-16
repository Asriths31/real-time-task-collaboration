import { io } from 'socket.io-client';

const WS_URL = 'http://localhost:5000';
let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(WS_URL);
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinBoard = (boardId) => {
  if (socket) {
    socket.emit('join_board', boardId);
  }
};

export const leaveBoard = (boardId) => {
  if (socket) {
    socket.emit('leave_board', boardId);
  }
};

export const getSocket = () => socket;
