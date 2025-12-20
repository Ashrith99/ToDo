import React, { useState } from 'react';
import { Calendar, Plus, Trash2, ChevronDown, ChevronRight, Target, Clock } from 'lucide-react';
import { useTask } from '../context/TaskContext';
import SubtaskItem from './SubtaskItem';
import SubtaskForm from './SubtaskForm';
import ConfirmModal from './ConfirmModal';
import { useConfirm } from '../hooks/useConfirm';

const TaskCard = ({ task, showDateRange = true }) => {
  const { deleteTask } = useTask();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const { confirmState, showConfirm, hideConfirm, handleConfirm } = useConfirm();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDelete = async () => {
    await showConfirm({
      title: "Delete Task",
      message: `Are you sure you want to delete "${task.title}" and all its subtasks? This action cannot be undone.`,
      confirmText: "Delete Task",
      cancelText: "Keep Task",
      type: "danger",
      onConfirm: async () => {
        await deleteTask(task._id);
      }
    });
  };

  const completedSubtasks = task.subtasks?.filter(subtask => subtask.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <>
      <div className="floating-card p-4 md:p-6 animate-slide-up">
        {/* Task Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
              >
                {isExpanded ? 
                  <ChevronDown size={18} className="group-hover:scale-110 transition-transform" /> : 
                  <ChevronRight size={18} className="group-hover:scale-110 transition-transform" />
                }
              </button>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">{task.title}</h3>
                {showDateRange && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar size={14} className="mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {formatDate(task.startDate)} - {formatDate(task.endDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Progress Section */}
            {totalSubtasks > 0 && (
              <div className="ml-11 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Target size={14} className="text-blue-500" />
                    <span className="text-gray-600 font-medium">
                      {completedSubtasks} of {totalSubtasks} completed
                    </span>
                  </div>
                  <span className="text-blue-600 font-bold">{Math.round(progressPercentage)}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  {progressPercentage === 100 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setShowSubtaskForm(!showSubtaskForm)}
              className="p-2 md:p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
              title="Add subtask"
            >
              <Plus size={16} className="group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 md:p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
              title="Delete task"
            >
              <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Subtask Form */}
        {showSubtaskForm && (
          <div className="mb-6 ml-11 animate-slide-up">
            <SubtaskForm
              taskId={task._id}
              onSuccess={() => setShowSubtaskForm(false)}
              onCancel={() => setShowSubtaskForm(false)}
            />
          </div>
        )}

        {/* Subtasks */}
        {isExpanded && task.subtasks && task.subtasks.length > 0 && (
          <div className="ml-11 space-y-3">
            {task.subtasks.map((subtask, index) => (
              <div key={subtask._id} style={{ animationDelay: `${index * 0.1}s` }}>
                <SubtaskItem subtask={subtask} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {isExpanded && (!task.subtasks || task.subtasks.length === 0) && (
          <div className="ml-11 text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-500 text-sm mb-4">No subtasks yet</p>
            <button
              onClick={() => setShowSubtaskForm(true)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline transition-colors"
            >
              Add your first subtask
            </button>
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={hideConfirm}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        isLoading={confirmState.isLoading}
      />
    </>
  );
};

export default TaskCard;