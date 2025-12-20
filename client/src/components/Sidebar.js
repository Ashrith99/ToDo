import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Home, Plus, List, CheckSquare } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    {
      to: '/today',
      icon: Home,
      label: 'Today',
      description: 'Today\'s tasks'
    },
    {
      to: '/calendar',
      icon: Calendar,
      label: 'Calendar',
      description: 'Browse by date'
    },
    {
      to: '/create-task',
      icon: Plus,
      label: 'Create Task',
      description: 'Add new task'
    },
    {
      to: '/all-tasks',
      icon: List,
      label: 'All Tasks',
      description: 'View all tasks'
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <CheckSquare className="text-primary-600" size={24} />
          <span className="text-xl font-bold text-gray-900">TodoApp</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} className="mr-3" />
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </NavLink>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Built with React & Node.js
        </div>
      </div>
    </div>
  );
};

export default Sidebar;