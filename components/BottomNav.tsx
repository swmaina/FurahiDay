
import React from 'react';
import { Screen } from '../types';
import { Icon } from './Icon';

type BottomNavProps = {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
};

const NavItem: React.FC<{
  iconName: 'home' | 'saved' | 'search';
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ iconName, label, isActive, onClick }) => {
  const activeClass = 'text-brand-green';
  const inactiveClass = 'text-medium-text';
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center flex-1 space-y-1">
      <Icon name={iconName} className={`w-7 h-7 transition-colors ${isActive ? activeClass : inactiveClass}`} />
      <span className={`text-xs font-medium transition-colors ${isActive ? activeClass : inactiveClass}`}>{label}</span>
    </button>
  );
};

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-card-bg border-t border-gray-700 flex justify-around items-center px-4 max-w-lg mx-auto">
      <NavItem
        iconName="home"
        label="Home"
        isActive={activeScreen === 'home'}
        onClick={() => onNavigate('home')}
      />
      <NavItem
        iconName="saved"
        label="Saved"
        isActive={activeScreen === 'saved'}
        onClick={() => onNavigate('saved')}
      />
      <NavItem
        iconName="search"
        label="Search"
        isActive={activeScreen === 'search'}
        onClick={() => onNavigate('search')}
      />
    </div>
  );
};
