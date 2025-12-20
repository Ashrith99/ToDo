const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subtasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subtask'
  }]
}, {
  timestamps: true
});

// Index for efficient queries
taskSchema.index({ userId: 1, startDate: 1, endDate: 1 });

// Virtual to check if task is active for a given date
taskSchema.methods.isActiveOnDate = function(date) {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  const start = new Date(this.startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(this.endDate);
  end.setHours(23, 59, 59, 999);
  
  return checkDate >= start && checkDate <= end;
};

// Static method to find tasks for a specific date
taskSchema.statics.findTasksForDate = function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    userId,
    startDate: { $lte: endOfDay },
    endDate: { $gte: startOfDay }
  }).populate('subtasks').sort({ createdAt: -1 }); // Sort by newest first
};

module.exports = mongoose.model('Task', taskSchema);