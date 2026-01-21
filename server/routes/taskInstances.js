const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const TaskInstance = require('../models/TaskInstance');
const Subtask = require('../models/Subtask');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper function to get or create task instance for a specific date
const getOrCreateTaskInstance = async (taskId, userId, date) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  let instance = await TaskInstance.findOne({
    taskId,
    userId,
    date: targetDate
  });

  if (!instance) {
    // Get the task and its subtasks
    const task = await Task.findById(taskId).populate('subtasks');
    if (!task) {
      throw new Error('Task not found');
    }

    // Create subtask instances
    const subtaskInstances = task.subtasks.map(subtask => ({
      subtaskId: subtask._id,
      completed: false
    }));

    instance = new TaskInstance({
      taskId,
      userId,
      date: targetDate,
      completed: false,
      subtaskInstances
    });

    await instance.save();
  }

  return instance;
};

// @route   GET /api/task-instances/date/:date
// @desc    Get task instances for a specific date
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

    // Find all tasks that should be active on this date
    const activeTasks = await Task.findTasksForDate(req.user._id, targetDate);
    
    // Get or create instances for each active task
    const taskInstances = [];
    for (const task of activeTasks) {
      const instance = await getOrCreateTaskInstance(task._id, req.user._id, targetDate);
      
      // Populate the task and subtask details
      await instance.populate([
        { path: 'taskId', select: 'title startDate endDate' },
        { path: 'subtaskInstances.subtaskId', select: 'title notes' }
      ]);
      
      taskInstances.push(instance);
    }
    
    res.json({ taskInstances, date });
  } catch (error) {
    console.error('Get task instances error:', error);
    res.status(500).json({ message: 'Server error while fetching task instances' });
  }
});

// @route   PUT /api/task-instances/:id/complete
// @desc    Toggle task instance completion
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const instance = await TaskInstance.findOne({ _id: id, userId: req.user._id });
    if (!instance) {
      return res.status(404).json({ message: 'Task instance not found' });
    }

    instance.completed = !instance.completed;
    
    // If task is being marked as complete, mark all subtasks as complete
    // If task is being marked as incomplete, mark all subtasks as incomplete
    instance.subtaskInstances.forEach(subtaskInstance => {
      subtaskInstance.completed = instance.completed;
    });

    await instance.save();

    // Populate for response
    await instance.populate([
      { path: 'taskId', select: 'title startDate endDate' },
      { path: 'subtaskInstances.subtaskId', select: 'title notes' }
    ]);

    res.json({ message: 'Task instance updated successfully', taskInstance: instance });
  } catch (error) {
    console.error('Update task instance error:', error);
    res.status(500).json({ message: 'Server error while updating task instance' });
  }
});

// @route   PUT /api/task-instances/:id/subtask/:subtaskId
// @desc    Toggle subtask instance completion
// @access  Private
router.put('/:id/subtask/:subtaskId', auth, async (req, res) => {
  try {
    const { id, subtaskId } = req.params;

    const instance = await TaskInstance.findOne({ _id: id, userId: req.user._id });
    if (!instance) {
      return res.status(404).json({ message: 'Task instance not found' });
    }

    const subtaskInstance = instance.subtaskInstances.find(
      si => si.subtaskId.toString() === subtaskId
    );

    if (!subtaskInstance) {
      return res.status(404).json({ message: 'Subtask instance not found' });
    }

    subtaskInstance.completed = !subtaskInstance.completed;
    
    // Check if all subtasks are completed to auto-complete the main task
    const allSubtasksCompleted = instance.subtaskInstances.every(si => si.completed);
    const anySubtaskIncomplete = instance.subtaskInstances.some(si => !si.completed);
    
    // Auto-complete task if all subtasks are completed
    if (allSubtasksCompleted && instance.subtaskInstances.length > 0) {
      instance.completed = true;
    }
    // Auto-incomplete task if any subtask is incomplete and task was previously completed
    else if (anySubtaskIncomplete && instance.completed) {
      instance.completed = false;
    }

    await instance.save();

    // Populate for response
    await instance.populate([
      { path: 'taskId', select: 'title startDate endDate' },
      { path: 'subtaskInstances.subtaskId', select: 'title notes' }
    ]);

    res.json({ message: 'Subtask instance updated successfully', taskInstance: instance });
  } catch (error) {
    console.error('Update subtask instance error:', error);
    res.status(500).json({ message: 'Server error while updating subtask instance' });
  }
});

module.exports = router;