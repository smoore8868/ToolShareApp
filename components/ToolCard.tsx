import React from 'react';
import { Tool, ToolStatus } from '../types';
import { Clock, Tag, DollarSign, User } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
  ownerName?: string;
  isOwner: boolean;
  onAction: (tool: Tool) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, ownerName, isOwner, onAction }) => {
  const isAvailable = tool.status === ToolStatus.AVAILABLE;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="relative h-48 bg-slate-100">
        <img 
          src={tool.image} 
          alt={tool.name} 
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?blur=2'; }}
        />
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
          isAvailable ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {tool.status}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{tool.name}</h3>
          <span className="flex items-center text-slate-500 text-sm">
            <DollarSign className="w-3 h-3" />
            {tool.price}
          </span>
        </div>
        
        <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">{tool.description}</p>
        
        <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
          <Tag className="w-3 h-3" />
          <span>{tool.category}</span>
          {!isOwner && ownerName && (
            <>
              <span className="mx-1">•</span>
              <User className="w-3 h-3" />
              <span>{ownerName}</span>
            </>
          )}
        </div>

        <button 
          onClick={() => onAction(tool)}
          disabled={!isAvailable && !isOwner} // Owner can always manage, Borrower can only borrow available
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            isOwner 
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : isAvailable 
                ? 'bg-primary text-white hover:bg-indigo-600'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isOwner ? 'Manage Tool' : isAvailable ? 'Request to Borrow' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
};
