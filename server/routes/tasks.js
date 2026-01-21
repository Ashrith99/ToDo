const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Subtask = require('../models/Subtask');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all user tasks
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id })
      .populate('subtasks')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
});

// @route   GET /api/tasks/static
// @desc    Get static tasks (tasks without dates)
// @access  Private
router.get('/static', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ 
      userId: req.user._id,
      $or: [
        { startDate: null },
        { endDate: null },
        { $and: [{ startDate: { $exists: false } }, { endDate: { $exists: false } }] }
      ]
    })
      .populate('subtasks')
      .sort({ createdAt: -1 });
    
    res.json({ tasks });
  } catch (error) {
    console.error('Get static tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching static tasks' });
  }
});

// @route   GET /api/tasks/today
// @desc    Get today's tasks
// @access  Private
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    const tasks = await Task.findTasksForDate(req.user._id, today);
    
    res.json({ tasks, date: today.toISOString().split('T')[0] });
  } catch (error) {
    console.error('Get today tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching today\'s tasks' });
  }
});

// @route   GET /api/tasks/date/:date
// @desc    Get tasks for specific date (YYYY-MM-DD)
// @access  Private
router.get('/date/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date' });
    }
    
    const tasks = await Task.findTasksForDate(req.user._id, targetDate);
    
    res.json({ tasks, date });
  } catch (error) {
    console.error('Get tasks by date error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks for date' });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { title, startDate, endDate } = req.body;
    
    // Validate date range if both dates are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end < start) {
        return res.status(400).json({ message: 'End date must be after or equal to start date' });
      }
    }

    // Validate that if one date is provided, both should be provided
    if ((startDate && !endDate) || (!startDate && endDate)) {
      return res.status(400).json({ message: 'Both start date and end date must be provided together, or leave both empty for static tasks' });
    }

    const taskData = {
      title,
      userId: req.user._id
    };

    // Only add dates if both are provided
    if (startDate && endDate) {
      taskData.startDate = new Date(startDate);
      taskData.endDate = new Date(endDate);
    }

    const task = new Task(taskData);
    await task.save();
    await task.populate('subtasks');

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findOne({ _id: id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Validate date range if dates are being updated
    if (updates.startDate || updates.endDate) {
      const startDate = updates.startDate ? new Date(updates.startDate) : task.startDate;
      const endDate = updates.endDate ? new Date(updates.endDate) : task.endDate;
      
      if (endDate < startDate) {
        return res.status(400).json({ message: 'End date must be after or equal to start date' });
      }
    }

    // If task completion is being toggled, update all subtasks accordingly
    if (updates.hasOwnProperty('completed')) {
      await Subtask.updateMany(
        { taskId: id },
        { completed: updates.completed }
      );
    }

    Object.assign(task, updates);
    await task.save();
    await task.populate('subtasks');

    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error while updating task' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task and its subtasks
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Delete all subtasks first
    await Subtask.deleteMany({ taskId: id });
    
    // Delete the task
    await Task.findByIdAndDelete(id);

    res.json({ message: 'Task and its subtasks deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
});

// @route   POST /api/tasks/:taskId/subtasks
// @desc    Create a subtask for a task
// @access  Private
router.post('/:taskId/subtasks', [
  auth,
  body('title').trim().isLength({ min: 1, max: 150 }).withMessage('Title must be 1-150 characters'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { taskId } = req.params;
    const { title, notes } = req.body;

    // Verify task exists and belongs to user
    const task = await Task.findOne({ _id: taskId, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const subtask = new Subtask({
      title,
      notes: notes || '',
      taskId
    });

    await subtask.save();

    // Add subtask to task's subtasks array
    task.subtasks.push(subtask._id);
    await task.save();

    res.status(201).json({ message: 'Subtask created successfully', subtask });
  } catch (error) {
    console.error('Create subtask error:', error);
    res.status(500).json({ message: 'Server error while creating subtask' });
  }
});

module.exports = router;