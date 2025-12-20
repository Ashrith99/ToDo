import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Edit3, ChevronDown, ChevronRight } from 'lucide-react';
import { useTask } from '../context/TaskContext';
import SubtaskItem from './SubtaskItem';
import SubtaskForm from './SubtaskForm';

const TaskCard = ({ task, showDateRange = true }) => {
  const { deleteTask } = useTask();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task and all its subtasks?')) {
      setIsDeleting(true);
      await deleteTask(task._id);
      setIsDeleting(false);
    }
  };

  const completedSubtasks = task.subtasks?.filter(subtask => subtask.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div className="card animate-fade-in">
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
          </div>
          
          {showDateRange && (
            <div className="flex items-center text-sm text-gray-500 ml-6">
              <Calendar size={14} className="mr-1" />
              <span>
                {formatDate(task.startDate)} - {formatDate(task.endDate)}
              </span>
            </div>
          )}
          
          {/* Progress Bar */}
          {totalSubtasks > 0 && (
            <div className="ml-6 mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{completedSubtasks} of {totalSubtasks} completed</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSubtaskForm(!showSubtaskForm)}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Add subtask"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Subtask Form */}
      {showSubtaskForm && (
        <div className="mb-4 ml-6">
          <SubtaskForm
            taskId={task._id}
            onSuccess={() => setShowSubtaskForm(false)}
            onCancel={() => setShowSubtaskForm(false)}
          />
        </div>
      )}

      {/* Subtasks */}
      {isExpanded && task.subtasks && task.subtasks.length > 0 && (
        <div className="ml-6 space-y-2">
          {task.subtasks.map((subtask) => (
            <SubtaskItem key={subtask._id} subtask={subtask} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {isExpanded && (!task.subtasks || task.subtasks.length === 0) && (
        <div className="ml-6 text-gray-500 text-sm italic">
          No subtasks yet. Click the + button to add one.
        </div>
      )}
    </div>
  );
};

export default TaskCard;