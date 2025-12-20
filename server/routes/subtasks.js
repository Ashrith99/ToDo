const express = require('express');
const { body, validationResult } = require('express-validator');
const Subtask = require('../models/Subtask');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   PUT /api/subtasks/:id
// @desc    Update a subtask
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 1, max: 150 }).withMessage('Title must be 1-150 characters'),
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    // Find subtask and verify it belongs to user's task
    const subtask = await Subtask.findById(id).populate('taskId');
    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    // Verify the task belongs to the authenticated user
    if (subtask.taskId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(subtask, updates);
    await subtask.save();

    res.json({ message: 'Subtask updated successfully', subtask });
  } catch (error) {
    console.error('Update subtask error:', error);
    res.status(500).json({ message: 'Server error while updating subtask' });
  }
});

// @route   DELETE /api/subtasks/:id
// @desc    Delete a subtask
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find subtask and verify it belongs to user's task
    const subtask = await Subtask.findById(id).populate('taskId');
    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    // Verify the task belongs to the authenticated user
    if (subtask.taskId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove subtask from task's subtasks array
    await Task.findByIdAndUpdate(
      subtask.taskId._id,
      { $pull: { subtasks: id } }
    );

    // Delete the subtask
    await Subtask.findByIdAndDelete(id);

    res.json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    console.error('Delete subtask error:', error);
    res.status(500).json({ message: 'Server error while deleting subtask' });
  }
});

// @route   GET /api/subtasks/task/:taskId
// @desc    Get all subtasks for a task
// @access  Private
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const { taskId } = req.params;

    // Verify task exists and belongs to user
    const task = await Task.findOne({ _id: taskId, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const subtasks = await Subtask.find({ taskId }).sort({ createdAt: 1 });

    res.json({ subtasks });
  } catch (error) {
    console.error('Get subtasks error:', error);
    res.status(500).json({ message: 'Server error while fetching subtasks' });
  }
});

module.exports = router;