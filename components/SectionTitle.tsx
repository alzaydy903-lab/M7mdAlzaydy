import React from 'react';

interface SectionTitleProps {
  title: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center mb-12">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">{title}</h2>
      <div className="h-1.5 w-16 bg-[#3b82f6] rounded-full"></div>
    </div>
  );
};

export default SectionTitle;