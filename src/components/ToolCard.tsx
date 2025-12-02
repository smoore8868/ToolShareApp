import React from 'react';
import { Tool, ToolStatus, Booking } from '../types';
import { Clock, Tag, DollarSign, User, Calendar, AlertTriangle } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
  ownerName?: string;
  isOwner: boolean;
  activeBooking?: Booking; // For Marketplace view
  onAction: (tool: Tool) => void;
  onFutureRequest?: (tool: Tool) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, ownerName, isOwner, activeBooking, onAction, onFutureRequest }) => {
  const isAvailable = tool.status === ToolStatus.AVAILABLE;
  const isBorrowed = tool.status === ToolStatus.BORROWED;

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
          <h3 className="text-lg font-bold text-black line-clamp-1">{tool.name}</h3>
          <span className="flex items-center text-black/60 text-sm">
            <DollarSign className="w-3 h-3" />
            {tool.price}
          </span>
        </div>
        
        <p className="text-black/70 text-sm mb-4 line-clamp-2 flex-1">{tool.description}</p>
        
        {/* Borrowed Date Range Info for Shared Tools */}
        {isBorrowed && activeBooking && !isOwner && (
          <div className="mb-4 bg-amber-50 border border-amber-100 p-2 rounded-lg flex items-center gap-2 text-xs text-amber-800">
             <Calendar className="w-3.5 h-3.5" />
             <span>Borrowed: {activeBooking.startDate} — {activeBooking.endDate}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 mb-4 text-xs text-black/50">
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

        {/* Action Button Logic */}
        {isOwner ? (
          <button 
            onClick={() => onAction(tool)}
            className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors bg-slate-100 text-black hover:bg-slate-200"
          >
            Manage Tool
          </button>
        ) : (
          <button 
            onClick={() => {
              if (isAvailable) {
                onAction(tool);
              } else if (onFutureRequest) {
                onFutureRequest(tool);
              }
            }}
            disabled={!isAvailable && !onFutureRequest}
            className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              isAvailable 
                ? 'bg-primary text-white hover:bg-indigo-600'
                : onFutureRequest
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isAvailable 
              ? 'Request to Borrow' 
              : activeBooking 
                ? `Request when available (${activeBooking.endDate})`
                : 'Unavailable'
            }
          </button>
        )}
      </div>
    </div>
  );
};
