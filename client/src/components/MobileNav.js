import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Plus, List } from 'lucide-react';

const MobileNav = () => {
  const navItems = [
    {
      to: '/today',
      icon: Home,
      label: 'Today'
    },
    {
      to: '/calendar',
      icon: Calendar,
      label: 'Calendar'
    },
    {
      to: '/create-task',
      icon: Plus,
      label: 'Create'
    },
    {
      to: '/all-tasks',
      icon: List,
      label: 'All Tasks'
    }
  ];

  return (
    <nav className="mobile-nav">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `mobile-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;