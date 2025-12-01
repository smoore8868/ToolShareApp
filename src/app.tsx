import React, { useState, useEffect } from 'react';
import { 
  Plus, Users, Home, Bell, Wrench, QrCode, Share2, 
  LayoutDashboard, Search, Calendar, ArrowRight, User as UserIcon, Check, History, LogOut, Settings, Clock, AlertCircle
} from 'lucide-react';
import { store } from './services/mockStore';
import { Tool, Group, Booking, User, ToolStatus, BookingStatus, ViewState } from './types';
import { ToolCard } from './components/ToolCard';
import { AddToolModal } from './components/AddToolModal';
import { BorrowModal } from './components/BorrowModal';
import { ManageToolModal } from './components/ManageToolModal';
import { CreateGroupModal, GroupSettingsModal, JoinGroupModal } from './components/GroupModals';
import { ShareToolsModal } from './components/ShareToolsModal';
import { Login } from './components/Login';

const App: React.FC = () => {
  // State
  const [currentUser, setCurrentUser] = useState<User | null>(store.getCurrentUser());
  const [users, setUsers] = useState<User[]>(store.getUsers());
  const [tools, setTools] = useState<Tool[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [view, setView] = useState<ViewState>('HOME');
  
  // Modals
  const [showAddTool, setShowAddTool] = useState(false);
  const [selectedToolForBorrow, setSelectedToolForBorrow] = useState<Tool | null>(null);
  const [initialBorrowDate, setInitialBorrowDate] = useState<string>(''); // For future requests

  const [showInvite, setShowInvite] = useState<Group | null>(null);
  const [toolToManage, setToolToManage] = useState<Tool | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);
  const [groupEditInitialTab, setGroupEditInitialTab] = useState<'USERS' | 'TOOLS'>('TOOLS');

  const [groupToShareWith, setGroupToShareWith] = useState<Group | null>(null);
  const [preSelectedGroupId, setPreSelectedGroupId] = useState<string | undefined>(undefined);

  // Load Initial Data
  useEffect(() => {
    setTools(store.getTools());
    setGroups(store.getGroups());
    setBookings(store.getBookings());
    setUsers(store.getUsers());
  }, [currentUser]);

  // Login Handling
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Refresh data in case user changed
    setTools(store.getTools());
    setGroups(store.getGroups());
    setBookings(store.getBookings());
  };

  const handleLogout = () => {
    store.logout();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // Helpers
  const myTools = tools.filter(t => t.ownerId === currentUser.id);
  
  // Get all groups I am a member of
  const myGroupIds = groups.filter(g => g.memberIds.includes(currentUser.id)).map(g => g.id);
  const myGroups = groups.filter(g => g.memberIds.includes(currentUser.id));

  // Market Tools: 
  // 1. Not owned by me
  // 2. Shared with a group I am in
  const marketTools = tools.filter(t => {
     const isNotMine = t.ownerId !== currentUser.id;
     const isSharedWithMyGroup = t.groupIds.some(gid => myGroupIds.includes(gid));
     return isNotMine && isSharedWithMyGroup;
  });

  const myBookings = bookings.filter(b => b.borrowerId === currentUser.id);
  const myLendingHistory = bookings.filter(b => b.ownerId === currentUser.id);
  
  const incomingRequests = bookings.filter(b => b.ownerId === currentUser.id && b.status === BookingStatus.PENDING);

  // Derived state for Home Dashboard
  const activeBorrows = bookings.filter(b => b.borrowerId === currentUser.id && b.status === BookingStatus.APPROVED);
  const myToolsBorrowedOut = tools.filter(t => t.ownerId === currentUser.id && t.status === ToolStatus.BORROWED);

  // Time calculations
  const getHoursRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    return (end - now) / (1000 * 60 * 60);
  };

  // Actions
  const handleAddTool = (newToolData: Omit<Tool, 'id' | 'ownerId'>) => {
    const newTool: Tool = {
      ...newToolData,
      id: Math.random().toString(36).substr(2, 9),
      ownerId: currentUser.id,
    };
    const updatedTools = [...tools, newTool];
    setTools(updatedTools);
    store.saveTools(updatedTools);
    setPreSelectedGroupId(undefined); // Reset
  };

  const handleUpdateTool = (updatedTool: Tool) => {
    const updatedTools = tools.map(t => t.id === updatedTool.id ? updatedTool : t);
    setTools(updatedTools);
    store.saveTools(updatedTools);
  };

  const handleDeleteTool = (toolId: string) => {
    const updatedTools = tools.filter(t => t.id !== toolId);
    setTools(updatedTools);
    store.saveTools(updatedTools);
  };

  const handleCreateBooking = (bookingData: any) => {
    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      ...bookingData,
      borrowerId: currentUser.id,
      ownerId: selectedToolForBorrow!.ownerId, // Non-null assertion safe due to flow
      status: BookingStatus.PENDING
    };
    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    store.saveBookings(updatedBookings);
    setSelectedToolForBorrow(null);
    setInitialBorrowDate('');
    setView('HISTORY');
  };

  const handleApproveBooking = (booking: Booking) => {
    // 1. Update booking status
    const updatedBookings = bookings.map(b => 
      b.id === booking.id ? { ...b, status: BookingStatus.APPROVED } : b
    );
    setBookings(updatedBookings);
    store.saveBookings(updatedBookings);

    // 2. Update tool status
    const updatedTools = tools.map(t => 
      t.id === booking.toolId ? { ...t, status: ToolStatus.BORROWED, currentHolderId: booking.borrowerId } : t
    );
    setTools(updatedTools);
    store.saveTools(updatedTools);
  };

  const handleReturnTool = (booking: Booking) => {
    // 1. Mark booking completed
    const updatedBookings = bookings.map(b => 
      b.id === booking.id ? { ...b, status: BookingStatus.COMPLETED } : b
    );
    setBookings(updatedBookings);
    store.saveBookings(updatedBookings);

    // 2. Mark tool available
    const updatedTools = tools.map(t => 
      t.id === booking.toolId ? { ...t, status: ToolStatus.AVAILABLE, currentHolderId: undefined } : t
    );
    setTools(updatedTools);
    store.saveTools(updatedTools);
  };

  const handleRequestExtension = (booking: Booking) => {
    alert(`Extension request sent to owner for ${booking.id}`);
  };

  const handleCreateGroup = (name: string) => {
    const newGroup: Group = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      ownerId: currentUser.id,
      memberIds: [currentUser.id],
      inviteCode: Math.random().toString(36).substr(2, 6).toUpperCase()
    };
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    store.saveGroups(updatedGroups);
  };

  const handleJoinGroup = (code: string) => {
    const group = groups.find(g => g.inviteCode === code);
    if (group) {
      if (group.memberIds.includes(currentUser.id)) {
        alert('You are already a member of this group.');
        return;
      }
      const updatedGroup = {
        ...group,
        memberIds: [...group.memberIds, currentUser.id]
      };
      handleUpdateGroup(updatedGroup);
      setShowJoinGroup(false);
    } else {
      alert('Invalid invite code. Please try again.');
    }
  };

  const handleUpdateGroup = (updatedGroup: Group) => {
    const updatedGroups = groups.map(g => g.id === updatedGroup.id ? updatedGroup : g);
    setGroups(updatedGroups);
    store.saveGroups(updatedGroups);
  };

  const handleDeleteGroup = (groupId: string) => {
    const updatedGroups = groups.filter(g => g.id !== groupId);
    setGroups(updatedGroups);
    store.saveGroups(updatedGroups);
  };

  const handleRemoveMember = (groupId: string, userId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const updatedGroup = {
      ...group,
      memberIds: group.memberIds.filter(id => id !== userId)
    };
    handleUpdateGroup(updatedGroup);
  };

  const handleGroupToolUpdate = (toolIds: string[], groupId: string) => {
    const updatedTools = tools.map(t => {
      // If tool is owned by me
      if (t.ownerId === currentUser.id) {
         // Should it be in the group?
         const shouldBeInGroup = toolIds.includes(t.id);
         const currentGroupIds = t.groupIds || [];
         
         let newGroupIds = [...currentGroupIds];
         if (shouldBeInGroup && !currentGroupIds.includes(groupId)) {
            newGroupIds.push(groupId);
         } else if (!shouldBeInGroup && currentGroupIds.includes(groupId)) {
            newGroupIds = newGroupIds.filter(id => id !== groupId);
         }
         return { ...t, groupIds: newGroupIds };
      }
      return t;
    });
    setTools(updatedTools);
    store.saveTools(updatedTools);
    setGroupToShareWith(null); // Close modal
  };

  const openCreateToolForGroup = () => {
    if (groupToShareWith) {
      setPreSelectedGroupId(groupToShareWith.id);
      setGroupToShareWith(null);
      setShowAddTool(true);
    }
  };

  const switchUser = (userId: string) => {
    const allUsers = store.getUsers();
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setView('HOME');
    }
  };

  // Views
  const renderHome = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome, {currentUser.name.split(' ')[0]}</h2>
          <p className="text-slate-500">Here's what's happening with your tools.</p>
        </div>
      </div>

      {/* 1. Request Alerts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            Requests
          </h3>
          {incomingRequests.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {incomingRequests.length}
            </span>
          )}
        </div>
        
        {incomingRequests.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-400">
            <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm">No pending requests to approve.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {incomingRequests.map(req => {
              const tool = tools.find(t => t.id === req.toolId);
              const borrower = users.find(u => u.id === req.borrowerId);
              return (
                <div key={req.id} className="bg-white p-4 rounded-xl border-l-4 border-amber-400 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <img src={borrower?.avatar} alt={borrower?.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          <span className="font-bold">{borrower?.name}</span> needs <span className="font-bold">{tool?.name}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{req.reason}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <span className="text-xs font-mono text-slate-500">{req.startDate} - {req.endDate}</span>
                    <button 
                      onClick={() => handleApproveBooking(req)}
                      className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. Tools I am Borrowing (Moved Up) */}
      <section>
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-green-600" />
          Tools You Have
        </h3>
        {activeBorrows.length === 0 ? (
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-500">
            You aren't borrowing anything right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {activeBorrows.map(booking => {
              const tool = tools.find(t => t.id === booking.toolId);
              const owner = users.find(u => u.id === booking.ownerId);
              const hoursLeft = getHoursRemaining(booking.endDate);
              const isUrgent = hoursLeft < 24 && hoursLeft > 0;
              const isOverdue = hoursLeft <= 0;

              return (
                <div key={booking.id} className={`bg-white p-3 rounded-xl border ${isUrgent ? 'border-amber-300 bg-amber-50' : isOverdue ? 'border-red-300 bg-red-50' : 'border-green-200 bg-green-50/30'} flex flex-col gap-2`}>
                  <div className="flex items-center gap-3">
                    <img src={tool?.image} alt={tool?.name} className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{tool?.name}</h4>
                      <p className="text-xs text-slate-500">From {owner?.name}</p>
                      
                      <div className={`flex items-center gap-1 mt-1 text-xs font-bold ${isUrgent ? 'text-amber-600' : isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                        <Clock className="w-3 h-3" />
                        {isOverdue ? 'Overdue!' : isUrgent ? `${Math.ceil(hoursLeft)} hours left` : `Due ${booking.endDate}`}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleReturnTool(booking)}
                      className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-600 shadow-sm"
                      title="Return Tool"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Extension Button for < 24h */}
                  {isUrgent && (
                     <button 
                       onClick={() => handleRequestExtension(booking)}
                       className="w-full py-1.5 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg flex items-center justify-center gap-1"
                     >
                       <AlertCircle className="w-3 h-3" />
                       Request Time Extension
                     </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Tools I have Borrowed Out (Moved Down) */}
      <section>
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-blue-500" />
          Your Tools Out
        </h3>
        {myToolsBorrowedOut.length === 0 ? (
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-500">
            All your tools are safe at home.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {myToolsBorrowedOut.map(tool => {
              // Find active booking to get dates
              const activeBooking = bookings.find(b => 
                b.toolId === tool.id && 
                b.status === BookingStatus.APPROVED
              );
              const holder = users.find(u => u.id === tool.currentHolderId);
              
              return (
                <div key={tool.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="relative">
                    <img src={tool.image} alt={tool.name} className="w-14 h-14 rounded-lg object-cover" />
                    <div className="absolute -bottom-1 -right-1 bg-blue-100 p-1 rounded-full border border-white">
                      <UserIcon className="w-3 h-3 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{tool.name}</h4>
                    <p className="text-xs text-slate-500">With {holder?.name}</p>
                    {activeBooking && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>Until {activeBooking.endDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">My Tools</h2>
        <button 
          onClick={() => {
            setPreSelectedGroupId(undefined);
            setShowAddTool(true);
          }}
          className="bg-primary hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Tool
        </button>
      </div>

      {myTools.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">You haven't added any tools yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myTools.map(tool => (
            <ToolCard 
              key={tool.id} 
              tool={tool} 
              isOwner={true} 
              onAction={(t) => setToolToManage(t)} 
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderMarketplace = () => (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Shared Tools</h2>
          <p className="text-sm text-slate-500">From your groups</p>
        </div>
      </div>
      
      {marketTools.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No tools shared with you yet.</p>
          <p className="text-sm text-slate-400 mt-2">Join more groups or invite friends!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketTools.map(tool => {
            // Find active booking if borrowed
            const activeBooking = bookings.find(b => 
              b.toolId === tool.id && b.status === BookingStatus.APPROVED
            );
            
            return (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                ownerName={users.find(u => u.id === tool.ownerId)?.name}
                isOwner={false}
                activeBooking={activeBooking}
                onAction={(t) => setSelectedToolForBorrow(t)}
                onFutureRequest={(t) => {
                  if (activeBooking) {
                    const nextDate = new Date(activeBooking.endDate);
                    nextDate.setDate(nextDate.getDate() + 1);
                    setInitialBorrowDate(nextDate.toISOString().split('T')[0]);
                    setSelectedToolForBorrow(t);
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-8 animate-in fade-in">
      
      {/* 1. Lending History (My Tools) */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-blue-500" />
          My Lending History (Tools I Shared)
        </h3>
        {myLendingHistory.length === 0 ? (
          <p className="text-slate-500 text-sm italic bg-slate-50 p-4 rounded-lg">No lending history yet.</p>
        ) : (
          <div className="space-y-3">
            {myLendingHistory.map(booking => {
              const tool = tools.find(t => t.id === booking.toolId);
              const borrower = users.find(u => u.id === booking.borrowerId);
              return (
                <div key={booking.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={tool?.image} className="w-12 h-12 rounded object-cover bg-slate-100" />
                    <div>
                      <p className="font-bold text-slate-800">{tool?.name}</p>
                      <p className="text-xs text-slate-500">Borrowed by <span className="font-bold">{borrower?.name}</span></p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{booking.startDate} to {booking.endDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-1 ${
                      booking.status === BookingStatus.APPROVED ? 'bg-green-100 text-green-700' : 
                      booking.status === BookingStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                      booking.status === BookingStatus.COMPLETED ? 'bg-slate-100 text-slate-600' :
                      'bg-red-50 text-red-500'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. Borrowing History (Tools I borrowed) */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-purple-500" />
          My Borrowing History
        </h3>
        {myBookings.length === 0 ? (
           <p className="text-slate-500 text-sm italic bg-slate-50 p-4 rounded-lg">No borrowing history yet.</p>
        ) : (
          <div className="space-y-3">
             {myBookings.map(booking => {
                const tool = tools.find(t => t.id === booking.toolId);
                const owner = users.find(u => u.id === booking.ownerId);
                return (
                  <div key={booking.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={tool?.image} className="w-12 h-12 rounded object-cover bg-slate-100" />
                      <div>
                        <p className="font-bold text-slate-800">{tool?.name}</p>
                        <p className="text-xs text-slate-500">From: {owner?.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{booking.startDate} to {booking.endDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-1 ${
                        booking.status === BookingStatus.APPROVED ? 'bg-green-100 text-green-700' : 
                        booking.status === BookingStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                        booking.status === BookingStatus.COMPLETED ? 'bg-slate-100 text-slate-600' :
                        'bg-red-50 text-red-500'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                )
             })}
          </div>
        )}
      </section>
    </div>
  );

  const renderGroups = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">My Groups</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowJoinGroup(true)}
            className="text-primary font-medium hover:underline text-sm"
          >
            Join Group
          </button>
          <span className="text-slate-300">|</span>
          <button 
            onClick={() => setShowCreateGroup(true)}
            className="text-primary font-medium hover:underline text-sm"
          >
            + Create Group
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{group.name}</h3>
                <p className="text-slate-500 text-sm">{group.memberIds.length} members</p>
              </div>
              <div className="flex -space-x-2">
                {group.memberIds.slice(0, 3).map(mid => {
                   const m = users.find(u => u.id === mid);
                   return <img key={mid} src={m?.avatar} className="w-8 h-8 rounded-full border-2 border-white" alt={m?.name} />;
                })}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => {
                  setGroupToEdit(group);
                  setGroupEditInitialTab('USERS');
                }}
                className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                title="Group Settings"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              
              <button
  onClick={() => onInvite(group)}
  className="inline-flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium shadow"
>
  <QrCode className="w-4 h-4" />
  Invite
</button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <h3 className="text-xl font-bold mb-2">Invite to {showInvite.name}</h3>
            <p className="text-slate-500 text-sm mb-6">Scan to join or share the link</p>
            
            <div className="bg-white p-4 rounded-xl border-2 border-slate-100 inline-block mb-6">
               <img 
                 src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://toolshare.app/join/${showInvite.inviteCode}`} 
                 alt="QR Code" 
                 className="w-32 h-32"
               />
            </div>
            
            <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg mb-4">
              <span className="text-lg font-mono font-bold text-slate-700 mx-auto tracking-widest">{showInvite.inviteCode}</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Enter this code in the "Join Group" menu</p>

            <button onClick={() => setShowInvite(null)} className="text-slate-500 hover:text-slate-800 text-sm font-medium">Close</button>
          </div>
        </div>
      )}
    </div>
  );

  // Bottom Navigation Item
  const NavItem = ({ id, icon: Icon, label }: { id: ViewState, icon: any, label: string }) => (
    <button 
      onClick={() => setView(id)}
      className={`flex flex-col items-center justify-center w-full py-3 transition-colors ${
        view === id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <Icon className={`w-6 h-6 mb-1 ${view === id ? 'fill-current opacity-20' : ''}`} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header - Always Visible */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
           <div className="flex items-center gap-2 text-primary font-bold text-lg">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
               <Wrench className="w-5 h-5" />
             </div>
             ToolShare
          </div>
          
          <div className="flex items-center gap-4">
             {/* Switcher for Demo */}
             <div className="hidden sm:flex items-center gap-2 border-r border-slate-200 pr-4 mr-2">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mr-2">Switch User</span>
                {users.map(u => (
                  <button 
                    key={u.id}
                    onClick={() => switchUser(u.id)}
                    className={`w-8 h-8 rounded-full overflow-hidden border transition-colors ${
                       currentUser.id === u.id ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                    title={`Switch to ${u.name}`}
                  >
                    <img src={u.avatar} className="w-full h-full" alt={u.name} />
                  </button>
                ))}
             </div>

             <div className="flex items-center gap-2">
               <span className="hidden sm:block text-sm font-bold text-slate-700">{currentUser.name}</span>
               <img src={currentUser.avatar} className="w-9 h-9 rounded-full border border-slate-100 shadow-sm" alt="Profile" />
               
               <button onClick={handleLogout} className="ml-2 text-slate-400 hover:text-red-500">
                  <LogOut className="w-5 h-5" />
               </button>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {view === 'HOME' && renderHome()}
        {view === 'INVENTORY' && renderInventory()}
        {view === 'MARKETPLACE' && renderMarketplace()}
        {view === 'GROUPS' && renderGroups()}
        {view === 'HISTORY' && renderHistory()}
      </main>

      {/* Bottom Nav - Always Visible */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around z-30 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex w-full max-w-lg justify-around">
          <NavItem id="HOME" icon={LayoutDashboard} label="Home" />
          <NavItem id="INVENTORY" icon={Wrench} label="My Tools" />
          <NavItem id="MARKETPLACE" icon={Search} label="Shared" />
          <NavItem id="GROUPS" icon={Users} label="Groups" />
          <NavItem id="HISTORY" icon={History} label="History" />
        </div>
      </div>

      {/* Modals */}
      {showAddTool && (
        <AddToolModal 
          onClose={() => setShowAddTool(false)} 
          onAdd={handleAddTool} 
          preSelectedGroupId={preSelectedGroupId}
        />
      )}

      {selectedToolForBorrow && (
        <BorrowModal 
          tool={selectedToolForBorrow}
          initialStartDate={initialBorrowDate}
          onClose={() => {
            setSelectedToolForBorrow(null);
            setInitialBorrowDate('');
          }}
          onSubmit={handleCreateBooking}
        />
      )}

      {toolToManage && (
        <ManageToolModal 
          tool={toolToManage}
          groups={myGroups} // Pass user's groups
          onClose={() => setToolToManage(null)}
          onUpdate={handleUpdateTool}
          onDelete={handleDeleteTool}
        />
      )}

      {showCreateGroup && (
        <CreateGroupModal 
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleCreateGroup}
        />
      )}

      {showJoinGroup && (
        <JoinGroupModal
          onClose={() => setShowJoinGroup(false)}
          onJoin={handleJoinGroup}
        />
      )}

      {groupToEdit && (
        <GroupSettingsModal 
          group={groupToEdit}
          members={users.filter(u => groupToEdit.memberIds.includes(u.id))}
          groupTools={tools.filter(t => t.groupIds.includes(groupToEdit.id))}
          currentUser={currentUser}
          initialTab={groupEditInitialTab}
          onClose={() => setGroupToEdit(null)}
          onUpdate={handleUpdateGroup}
          onDelete={handleDeleteGroup}
          onManageTools={() => {
            setGroupToShareWith(groupToEdit);
            setGroupToEdit(null); // Close settings, open share
          }}
          onRemoveMember={handleRemoveMember}
          onInvite={() => {
            setShowInvite(groupToEdit);
            setGroupToEdit(null);
          }}
        />
      )}

      {groupToShareWith && (
        <ShareToolsModal 
          group={groupToShareWith}
          myTools={myTools}
          onClose={() => setGroupToShareWith(null)}
          onUpdateTools={handleGroupToolUpdate}
          onCreateNew={openCreateToolForGroup}
        />
      )}
    </div>
  );
};

export default App;
