const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const boardController = require('../controllers/boardController');
const listController = require('../controllers/listController');
const taskController = require('../controllers/taskController');

router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.getMe);

router.get('/boards', auth, boardController.getBoards);
router.post('/boards', auth, boardController.createBoard);
router.get('/boards/:id', auth, boardController.getBoard);
router.put('/boards/:id', auth, boardController.updateBoard);
router.delete('/boards/:id', auth, boardController.deleteBoard);
router.post('/boards/:id/members', auth, boardController.addMember);

router.post('/boards/:boardId/lists', auth, listController.createList);
router.put('/lists/:id', auth, listController.updateList);
router.delete('/lists/:id', auth, listController.deleteList);

router.post('/lists/:listId/tasks', auth, taskController.createTask);
router.put('/tasks/:id', auth, taskController.updateTask);
router.delete('/tasks/:id', auth, taskController.deleteTask);
router.put('/tasks/:id/move', auth, taskController.moveTask);
router.post('/tasks/:id/assign', auth, taskController.assignTask);

module.exports = router;
