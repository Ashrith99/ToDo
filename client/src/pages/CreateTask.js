import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { Plus, Calendar, ArrowLeft } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CreateTask = () => {
  const { createTask } = useTask();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    startDate: new Date(),
    endDate: new Date()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleDateChange = (date, field) => {
    setFormData({
      ...formData,
      [field]: date
    });
    // Clear error when user changes date
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Task title cannot exceed 200 characters';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after or equal to start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    const taskData = {
      title: formData.title.trim(),
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate.toISOString()
    };

    const result = await createTask(taskData);
    
    if (result.success) {
      navigate('/today');
    }
    
    setIsSubmitting(false);
  };

  const formatDateRange = () => {
    if (!formData.startDate || !formData.endDate) return '';
    
    const start = formData.startDate.toLocaleDateString();
    const end = formData.endDate.toLocaleDateString();
    
    if (start === end) {
      return `Task will appear on: ${start}`;
    }
    
    const daysDiff = Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)) + 1;
    return `Task will appear for ${daysDiff} day${daysDiff !== 1 ? 's' : ''}: ${start} - ${end}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        
        <div className="flex items-center space-x-3 mb-2">
          <Plus className="text-primary-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
        </div>
        <p className="text-gray-600">
          Create a task that will appear daily within your specified date range
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className={`input-field ${errors.title ? 'border-red-300' : ''}`}
              placeholder="e.g., Gym, Skin Care, Read Book"
              maxLength={200}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            <p className="mt-1 text-sm text-gray-500">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <DatePicker
                selected={formData.startDate}
                onChange={(date) => handleDateChange(date, 'startDate')}
                className={`input-field ${errors.startDate ? 'border-red-300' : ''}`}
                dateFormat="MMM dd, yyyy"
                minDate={new Date()}
                placeholderText="Select start date"
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <DatePicker
                selected={formData.endDate}
                onChange={(date) => handleDateChange(date, 'endDate')}
                className={`input-field ${errors.endDate ? 'border-red-300' : ''}`}
                dateFormat="MMM dd, yyyy"
                minDate={formData.startDate || new Date()}
                placeholderText="Select end date"
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
            </div>
          </div>

          {/* Date Range Preview */}
          {formData.startDate && formData.endDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="text-blue-600" size={16} />
                <span className="text-sm text-blue-800 font-medium">
                  {formatDateRange()}
                </span>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">How it works:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Your task will appear every day from start date to end date</li>
              <li>• You can add subtasks after creating the main task</li>
              <li>• Each day's progress is tracked independently</li>
              <li>• Perfect for habits, routines, or multi-day projects</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Task...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;