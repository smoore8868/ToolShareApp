import React, { useState } from 'react';
import { Tool, Group } from '../types';
import { X, Check } from 'lucide-react';

interface ShareToolsModalProps {
  group: Group;
  myTools: Tool[];
  onClose: () => void;
  onUpdateTools: (toolIds: string[], groupId: string) => void;
  onCreateNew: () => void;
}

export const ShareToolsModal: React.FC<ShareToolsModalProps> = ({ group, myTools, onClose, onUpdateTools, onCreateNew }) => {
  // Initialize with tools that already have this group's ID
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>(
    myTools.filter(t => t.groupIds.includes(group.id)).map(t => t.id)
  );

  const toggleTool = (toolId: string) => {
    if (selectedToolIds.includes(toolId)) {
      setSelectedToolIds(selectedToolIds.filter(id => id !== toolId));
    } else {
      setSelectedToolIds([...selectedToolIds, toolId]);
    }
  };

  const handleSave = () => {
    onUpdateTools(selectedToolIds, group.id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div>
             <h2 className="text-xl font-bold text-black">Add Tools to Group</h2>
             <p className="text-sm text-black/60">Sharing with: {group.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-black/60" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {myTools.length === 0 ? (
            <div className="text-center py-8 text-black/60">
              <p>You don't have any tools yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTools.map(tool => {
                 const isSelected = selectedToolIds.includes(tool.id);
                 return (
                  <div 
                    key={tool.id}
                    onClick={() => toggleTool(tool.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected ? 'border-primary bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                       isSelected ? 'bg-primary border-primary' : 'bg-white border-slate-300'
                    }`}>
                       {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <img src={tool.image} alt={tool.name} className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-black text-sm">{tool.name}</p>
                      <p className="text-xs text-black/60 line-clamp-1">{tool.description}</p>
                    </div>
                  </div>
                 )
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 space-y-3 bg-white rounded-b-2xl">
           <button 
             onClick={handleSave}
             className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors"
           >
             Save Selection
           </button>
           
           <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Or</span>
              <div className="flex-grow border-t border-slate-200"></div>
           </div>

           <button 
             onClick={onCreateNew}
             className="w-full py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-indigo-50 transition-colors"
           >
             Create New Tool for Group
           </button>
        </div>
      </div>
    </div>
  );
};