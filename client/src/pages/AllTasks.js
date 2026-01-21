import React, { useEffect, useState } from 'react';
import { useTask } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { List, Search, Filter, Calendar, CheckCircle, Clock } from 'lucide-react';

const AllTasks = () => {
  const { tasks, isLoading, fetchTasks } = useTask();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, completed
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, title

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter and sort tasks
  const filteredAndSortedTasks = React.useMemo(() => {
    let filtered = tasks.filter(task => {
      // Search filter
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const isCompleted = task.completed;
      
      let matchesStatus = true;
      if (filterStatus === 'active') {
        matchesStatus = !isCompleted;
      } else if (filterStatus === 'completed') {
        matchesStatus = isCompleted;
      }
      
      return matchesSearch && matchesStatus;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [tasks, searchTerm, filterStatus, sortBy]);

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;
    
    return { total, active, completed };
  };

  const stats = getTaskStats();

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
          <List className="text-primary-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
        </div>
        
        {/* Stats */}
        <div className="flex items-center space-x-6 text-sm mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-gray-600">{stats.total} total</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
            <span className="text-gray-600">{stats.active} active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">{stats.completed} completed</span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400" size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field w-auto"
              >
                <option value="all">All Tasks</option>
                <option value="active">Active Only</option>
                <option value="completed">Completed Only</option>
              </select>
            </div>
            
            {/* Sort */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field w-auto"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredAndSortedTasks.length > 0 ? (
          filteredAndSortedTasks.map((task) => (
            <TaskCard key={task._id} task={task} showDateRange={true} />
          ))
        ) : (
          <div className="text-center py-12">
            {searchTerm || filterStatus !== 'all' ? (
              // Filtered empty state
              <div>
                <Search className="mx-auto text-gray-300 mb-4" size={64} />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-500 mb-6">
                  No tasks match your current search and filter criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              // No tasks at all
              <div>
                <List className="mx-auto text-gray-300 mb-4" size={64} />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-gray-500 mb-6">
                  You haven't created any tasks yet. Create your first task to get started!
                </p>
                <a
                  href="/create-task"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <span>Create Your First Task</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      {filteredAndSortedTasks.length > 0 && (searchTerm || filterStatus !== 'all') && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
        </div>
      )}
    </div>
  );
};

export default AllTasks;