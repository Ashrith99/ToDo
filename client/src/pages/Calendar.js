import React, { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import TaskInstanceCard from '../components/TaskInstanceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Calendar = () => {
  const { taskInstances, isLoading, fetchTaskInstancesForDate, selectedDate } = useTask();
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

  useEffect(() => {
    const dateString = currentDate.toISOString().split('T')[0];
    fetchTaskInstancesForDate(dateString);
  }, [currentDate]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const completedTasks = taskInstances.filter(instance => instance.completed);
  const incompleteTasks = taskInstances.filter(instance => !instance.completed);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <CalendarIcon className="text-primary-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600">Browse date-based tasks by date</p>
          </div>
        </div>
        
        {/* Date Navigation */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Previous day"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {formatDate(currentDate)}
              </h2>
              {isToday(currentDate) && (
                <span className="text-sm text-primary-600 font-medium">Today</span>
              )}
            </div>
            
            <button
              onClick={() => navigateDate(1)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Next day"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            {!isToday(currentDate) && (
              <button
                onClick={goToToday}
                className="btn-secondary text-sm"
              >
                Go to Today
              </button>
            )}
            
            <div className="relative">
              <DatePicker
                selected={currentDate}
                onChange={setCurrentDate}
                className="input-field text-sm w-32"
                dateFormat="MMM dd, yyyy"
                placeholderText="Pick a date"
              />
            </div>
          </div>
        </div>
        
        {/* Stats */}
        {taskInstances.length > 0 && (
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
              <span className="text-gray-600">
                {incompleteTasks.length} active task{incompleteTasks.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">
                {completedTasks.length} completed task{completedTasks.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="space-y-6">
        {/* Active Tasks */}
        {incompleteTasks.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Tasks</h2>
            <div className="space-y-4">
              {incompleteTasks.map((taskInstance) => (
                <TaskInstanceCard key={taskInstance._id} taskInstance={taskInstance} showDateRange={true} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Completed Tasks</span>
            </h2>
            <div className="space-y-4 opacity-75">
              {completedTasks.map((taskInstance) => (
                <TaskInstanceCard key={taskInstance._id} taskInstance={taskInstance} showDateRange={true} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {taskInstances.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No tasks for {isToday(currentDate) ? 'today' : 'this date'}
            </h3>
            <p className="text-gray-500 mb-6">
              {isToday(currentDate) 
                ? "You don't have any tasks scheduled for today."
                : `No tasks are scheduled for ${formatDate(currentDate)}.`
              }
            </p>
            <a
              href="/create-task"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>Create a Task</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;