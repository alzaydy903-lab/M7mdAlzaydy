import React from 'react';
import { Skill } from '../types';
import { X, Zap, Brain, Briefcase, Sword, Footprints, Star, Activity, TrendingUp, TrendingDown, Lightbulb, Globe, Cpu } from 'lucide-react';

interface SkillCardProps {
  skill: Skill;
  isAdmin?: boolean;
  onDelete?: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  Zap, Brain, Briefcase, Sword, Footprints, Star, Activity, TrendingUp, TrendingDown, Lightbulb, Globe, Cpu
};

const SkillCard: React.FC<SkillCardProps> = ({ skill, isAdmin, onDelete }) => {
  const IconComponent = iconMap[skill.iconName] || Star;

  return (
    <div className="relative group flex items-center gap-2 bg-[#1a1f2e] hover:bg-[#252b3d] border border-gray-700 rounded-lg px-4 py-3 transition-colors cursor-default">
      <span className="text-cyan-400"><IconComponent size={20} /></span>
      <span className="text-white font-medium">{skill.name}</span>
      
      {isAdmin && onDelete && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
          title="حذف"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};

export default SkillCard;