import React, { useState } from 'react';
import type { Group, User, Tool } from '../types';
import { X, Users, Trash2, Save, Wrench, Plus, UserPlus, LogOut, QrCode, Settings } from 'lucide-react';

interface CreateGroupModalProps {
  onClose: () => void;
  onCreate: (name: string) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Create Group</h2>
<button
  onClick={onClose}
  style={{
    backgroundColor: '#1f2937',  // dark gray
    color: '#f9fafb',            // near-white
    borderRadius: '9999px',      // full circle
    padding: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <X style={{ width: '20px', height: '20px' }} />
</button>


        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Group Name</label>
          <input 
            autoFocus
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none mb-6"
            placeholder="e.g. Neighborhood DIY"
          />
          <button type="submit" className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full shadow transition">
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};

interface JoinGroupModalProps {
  onClose: () => void;
  onJoin: (code: string) => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ onClose, onJoin }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onJoin(code.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Join Group</h2>
<button
  onClick={onClose}
  style={{
    backgroundColor: '#1f2937',
    color: '#f9fafb',
    borderRadius: '9999px',
    padding: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <X style={{ width: '20px', height: '20px' }} />
</button>

        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Invite Code</label>
          <div className="relative mb-6">
            <QrCode className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input 
              autoFocus
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none uppercase font-mono"
              placeholder="e.g. DIY-1234"
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 transition-colors">
            Join Group
          </button>
        </form>
      </div>
    </div>
  );
};

interface GroupSettingsModalProps {
  group: Group;
  members: User[];
  groupTools: Tool[]; // Tools belonging to this group
  currentUser: User;
  initialTab?: 'USERS' | 'TOOLS';
  onClose: () => void;
  onUpdate: (group: Group) => void;
  onDelete: (groupId: string) => void;
  onManageTools: () => void; // Trigger share modal
  onRemoveMember: (groupId: string, userId: string) => void;
  onInvite: () => void;
}

export const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({ 
  group, 
  members, 
  groupTools,
  currentUser,
  initialTab = 'USERS',
  onClose, 
  onUpdate, 
  onDelete,
  onManageTools,
  onRemoveMember,
  onInvite
}) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'TOOLS'>(initialTab);
  const [name, setName] = useState(group.name);
  const isOwner = currentUser.id === group.ownerId;

  const handleSaveName = () => {
    onUpdate({ ...group, name });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${group.name}"?`)) {
      onDelete(group.id);
      onClose();
    }
  };

  const handleRemove = (userId: string, userName: string) => {
    if (confirm(`Remove ${userName} from the group?`)) {
      onRemoveMember(group.id, userId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">{group.name}</h2>
<button
  onClick={onClose}
  style={{
    backgroundColor: '#1f2937',
    color: '#f9fafb',
    borderRadius: '9999px',
    padding: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <X style={{ width: '20px', height: '20px' }} />
</button>

        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('USERS')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'USERS' ? 'border-primary text-primary' : 'border-indigo-500 text-indigo-600':'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            Members ({members.length})
          </button>
          <button 
            onClick={() => setActiveTab('TOOLS')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'TOOLS' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Tools ({groupTools.length})
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'USERS' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Group Name</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    disabled={!isOwner}
                  />
                  {isOwner && (
                    <button 
                      onClick={handleSaveName}
                      className="px-3 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                   <h3 className="text-sm font-medium text-slate-700">Members ({members.length})</h3>
                   <button 
                      onClick={onInvite}
                      className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
                   >
                     <UserPlus className="w-3 h-3" />
                     Add / Invite
                   </button>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-2 max-h-60 overflow-y-auto space-y-2 border border-slate-100">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-white rounded shadow-sm">
                      <div className="flex items-center gap-2">
                        <img src={member.avatar} className="w-8 h-8 rounded-full border border-slate-100" alt={member.name} />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{member.name}</p>
                          {member.id === group.ownerId && <p className="text-[10px] text-amber-600 font-bold uppercase">Owner</p>}
                        </div>
                      </div>
                      
                      {isOwner && member.id !== currentUser.id && (
                        <button 
                          onClick={() => handleRemove(member.id, member.name)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Remove user from group"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {member.id === currentUser.id && (
                         <span className="text-xs text-slate-400 italic pr-2">You</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {isOwner ? (
                 <div className="pt-4 border-t border-slate-100">
                    <button 
                      onClick={handleDelete}
                      className="w-full py-2 px-4 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Group
                    </button>
                 </div>
              ) : (
                <div className="pt-4 border-t border-slate-100">
                   <button 
                      onClick={() => handleRemove(currentUser.id, "yourself")}
                      className="w-full py-2 px-4 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Leave Group
                    </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <button 
                onClick={onManageTools}
                className="w-full py-3 bg-indigo-50 text-primary font-bold rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 border border-indigo-100"
              >
                <Plus className="w-5 h-5" />
                Add / Remove My Tools
              </button>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-500">Shared in this group:</h3>
                {groupTools.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-4 italic">No tools shared yet.</p>
                ) : (
                  groupTools.map(tool => (
                    <div key={tool.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg bg-white">
                      <img src={tool.image} alt={tool.name} className="w-10 h-10 rounded object-cover" />
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{tool.name}</p>
                        <p className="text-xs text-slate-500">Owner: {members.find(m => m.id === tool.ownerId)?.name || 'Unknown'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
