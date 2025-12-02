import React, { useState, useRef } from 'react';
import { Tool, ToolStatus, Group } from '../types';
import { X, Trash2, Save, AlertTriangle, Camera, Users } from 'lucide-react';

interface ManageToolModalProps {
  tool: Tool;
  groups: Group[]; // Groups the user is a member of
  onClose: () => void;
  onUpdate: (tool: Tool) => void;
  onDelete: (toolId: string) => void;
}

export const ManageToolModal: React.FC<ManageToolModalProps> = ({ tool, groups, onClose, onUpdate, onDelete }) => {
  const [name, setName] = useState(tool.name);
  const [description, setDescription] = useState(tool.description);
  const [price, setPrice] = useState(tool.price.toString());
  const [status, setStatus] = useState<ToolStatus>(tool.status);
  const [image, setImage] = useState(tool.image);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(tool.groupIds || []);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...tool,
      name,
      description,
      price: parseFloat(price) || 0,
      status,
      image,
      groupIds: selectedGroupIds,
    });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleGroup = (groupId: string) => {
    if (selectedGroupIds.includes(groupId)) {
      setSelectedGroupIds(selectedGroupIds.filter(id => id !== groupId));
    } else {
      setSelectedGroupIds([...selectedGroupIds, groupId]);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this tool? This cannot be undone.')) {
      onDelete(tool.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-black">Manage Tool</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-black/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex justify-center mb-4">
            <div 
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <img src={image} alt={name} className="h-40 w-full object-cover rounded-xl border border-slate-200" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                <div className="text-white flex items-center gap-2 font-medium">
                  <Camera className="w-5 h-5" />
                  <span>Change Photo</span>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ToolStatus)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-black"
              disabled={tool.status === ToolStatus.BORROWED}
            >
              <option value={ToolStatus.AVAILABLE}>Available</option>
              <option value={ToolStatus.MAINTENANCE}>Maintenance</option>
              <option value={ToolStatus.BORROWED} disabled>Borrowed (Cannot change manually)</option>
            </select>
            {tool.status === ToolStatus.BORROWED && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Tool is currently borrowed.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Price ($)</label>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-black"
              />
            </div>
          </div>

          {/* Group Sharing Section */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-black mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-black/60" />
              Share with Groups
            </label>
            {groups.length === 0 ? (
              <p className="text-xs text-black/60 italic bg-slate-50 p-3 rounded-lg">Join or create a group to share this tool.</p>
            ) : (
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-32 overflow-y-auto">
                {groups.map(group => (
                  <label key={group.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={selectedGroupIds.includes(group.id)}
                      onChange={() => toggleGroup(group.id)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-black">{group.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={handleDelete}
              className="flex-1 py-3 px-4 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button 
              type="submit" 
              className="flex-[2] py-3 px-4 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
