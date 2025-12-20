import React, { createContext, useContext, useReducer } from 'react';
import { taskAPI, subtaskAPI } from '../services/api';
import toast from 'react-hot-toast';

const TaskContext = createContext();

const initialState = {
  tasks: [],
  todayTasks: [],
  isLoading: false,
  selectedDate: new Date().toISOString().split('T')[0],
};

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, isLoading: false };
    
    case 'SET_TODAY_TASKS':
      return { ...state, todayTasks: action.payload, isLoading: false };
    
    case 'ADD_TASK':
      return { 
        ...state, 
        tasks: [action.payload, ...state.tasks],
        todayTasks: isTaskActiveToday(action.payload) 
          ? [action.payload, ...state.todayTasks] 
          : state.todayTasks
      };
    
    case 'UPDATE_TASK':
      const updatedTasks = state.tasks.map(task => 
        task._id === action.payload._id ? action.payload : task
      );
      const updatedTodayTasks = state.todayTasks.map(task => 
        task._id === action.payload._id ? action.payload : task
      );
      return { 
        ...state, 
        tasks: updatedTasks,
        todayTasks: updatedTodayTasks
      };
    
    case 'DELETE_TASK':
      return { 
        ...state, 
        tasks: state.tasks.filter(task => task._id !== action.payload),
        todayTasks: state.todayTasks.filter(task => task._id !== action.payload)
      };
    
    case 'ADD_SUBTASK':
      const taskWithNewSubtask = state.tasks.map(task => {
        if (task._id === action.payload.taskId) {
          return { ...task, subtasks: [...task.subtasks, action.payload] };
        }
        return task;
      });
      const todayTaskWithNewSubtask = state.todayTasks.map(task => {
        if (task._id === action.payload.taskId) {
          return { ...task, subtasks: [...task.subtasks, action.payload] };
        }
        return task;
      });
      return { 
        ...state, 
        tasks: taskWithNewSubtask,
        todayTasks: todayTaskWithNewSubtask
      };
    
    case 'UPDATE_SUBTASK':
      const tasksWithUpdatedSubtask = state.tasks.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask => 
          subtask._id === action.payload._id ? action.payload : subtask
        )
      }));
      const todayTasksWithUpdatedSubtask = state.todayTasks.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask => 
          subtask._id === action.payload._id ? action.payload : subtask
        )
      }));
      return { 
        ...state, 
        tasks: tasksWithUpdatedSubtask,
        todayTasks: todayTasksWithUpdatedSubtask
      };
    
    case 'DELETE_SUBTASK':
      const tasksWithoutSubtask = state.tasks.map(task => ({
        ...task,
        subtasks: task.subtasks.filter(subtask => subtask._id !== action.payload)
      }));
      const todayTasksWithoutSubtask = state.todayTasks.map(task => ({
        ...task,
        subtasks: task.subtasks.filter(subtask => subtask._id !== action.payload)
      }));
      return { 
        ...state, 
        tasks: tasksWithoutSubtask,
        todayTasks: todayTasksWithoutSubtask
      };
    
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    
    default:
      return state;
  }
};

// Helper function to check if task is active today
const isTaskActiveToday = (task) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(task.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(task.endDate);
  endDate.setHours(23, 59, 59, 999);
  
  return today >= startDate && today <= endDate;
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskAPI.getAllTasks();
      dispatch({ type: 'SET_TASKS', payload: response.data.tasks });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      toast.error('Failed to fetch tasks');
    }
  };

  // Fetch today's tasks
  const fetchTodayTasks = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskAPI.getTodayTasks();
      dispatch({ type: 'SET_TODAY_TASKS', payload: response.data.tasks });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      toast.error('Failed to fetch today\'s tasks');
    }
  };

  // Fetch tasks for specific date
  const fetchTasksForDate = async (date) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskAPI.getTasksForDate(date);
      dispatch({ type: 'SET_TODAY_TASKS', payload: response.data.tasks });
      dispatch({ type: 'SET_SELECTED_DATE', payload: date });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      toast.error('Failed to fetch tasks for selected date');
    }
  };

  // Create task
  const createTask = async (taskData) => {
    try {
      const response = await taskAPI.createTask(taskData);
      dispatch({ type: 'ADD_TASK', payload: response.data.task });
      toast.success('Task created successfully');
      return { success: true, task: response.data.task };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Update task
  const updateTask = async (taskId, updates) => {
    try {
      const response = await taskAPI.updateTask(taskId, updates);
      dispatch({ type: 'UPDATE_TASK', payload: response.data.task });
      toast.success('Task updated successfully');
      return { success: true, task: response.data.task };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update task';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      dispatch({ type: 'DELETE_TASK', payload: taskId });
      toast.success('Task deleted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete task';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Create subtask
  const createSubtask = async (taskId, subtaskData) => {
    try {
      const response = await taskAPI.createSubtask(taskId, subtaskData);
      dispatch({ type: 'ADD_SUBTASK', payload: { ...response.data.subtask, taskId } });
      toast.success('Subtask created successfully');
      return { success: true, subtask: response.data.subtask };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create subtask';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Update subtask
  const updateSubtask = async (subtaskId, updates) => {
    try {
      const response = await subtaskAPI.updateSubtask(subtaskId, updates);
      dispatch({ type: 'UPDATE_SUBTASK', payload: response.data.subtask });
      return { success: true, subtask: response.data.subtask };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update subtask';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Delete subtask
  const deleteSubtask = async (subtaskId) => {
    try {
      await subtaskAPI.deleteSubtask(subtaskId);
      dispatch({ type: 'DELETE_SUBTASK', payload: subtaskId });
      toast.success('Subtask deleted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete subtask';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    ...state,
    fetchTasks,
    fetchTodayTasks,
    fetchTasksForDate,
    createTask,
    updateTask,
    deleteTask,
    createSubtask,
    updateSubtask,
    deleteSubtask,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};