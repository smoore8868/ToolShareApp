import React, { useState, useEffect } from 'react';
import {
  Plus, Users, Bell, Wrench, QrCode, Share2,
  LayoutDashboard, Search, Calendar, ArrowRight, User as UserIcon, Check, History, LogOut, Settings, Clock, AlertCircle
} from 'lucide-react';
import { Tool, Group, Booking, ViewState } from './types';
import { ToolCard } from './components/ToolCard';
import { AddToolModal } from './components/AddToolModal';
import { BorrowModal } from './components/BorrowModal';
import { ManageToolModal } from './components/ManageToolModal';
import { CreateGroupModal, GroupSettingsModal, JoinGroupModal } from './components/GroupModals';
import { ShareToolsModal } from './components/ShareToolsModal';
import { Login } from './components/Login';

// Zustand stores
import { useAuthStore } from './stores/useAuthStore';
import { useToolStore } from './stores/useToolStore';
import { useGroupStore } from './stores/useGroupStore';
import { useBookingStore } from './stores/useBookingStore';

// Custom hooks
import { useAppData } from './hooks/useAppData';
import { useBookingActions } from './hooks/useBookingActions';
import { useDerivedData } from './hooks/useDerivedData';

const App: React.FC = () => {
  // Initialize app data
  useAppData();

  // Global state from stores
  const currentUser = useAuthStore(state => state.currentUser);
  const users = useAuthStore(state => state.users);
  const logout = useAuthStore(state => state.logout);
  const setCurrentUser = useAuthStore(state => state.setCurrentUser);

  const tools = useToolStore(state => state.tools);
  const addTool = useToolStore(state => state.addTool);
  const updateTool = useToolStore(state => state.updateTool);
  const deleteTool = useToolStore(state => state.deleteTool);
  const updateToolGroups = useToolStore(state => state.updateToolGroups);

  const groups = useGroupStore(state => state.groups);
  const createGroup = useGroupStore(state => state.createGroup);
  const updateGroup = useGroupStore(state => state.updateGroup);
  const deleteGroup = useGroupStore(state => state.deleteGroup);
  const joinGroup = useGroupStore(state => state.joinGroup);
  const removeMember = useGroupStore(state => state.removeMember);

  const bookings = useBookingStore(state => state.bookings);
  const createBooking = useBookingStore(state => state.createBooking);

  // Derived data (memoized)
  const {
    myTools,
    myGroups,
    marketTools,
    myBookings,
    myLendingHistory,
    incomingRequests,
    activeBorrows,
    myToolsBorrowedOut,
  } = useDerivedData();

  // Booking actions
  const { handleApproveBooking, handleReturnTool } = useBookingActions();

  // Local UI state
  const [view, setView] = useState<ViewState>('HOME');

  // Modals
  const [showAddTool, setShowAddTool] = useState(false);
  const [selectedToolForBorrow, setSelectedToolForBorrow] = useState<Tool | null>(null);
  const [initialBorrowDate, setInitialBorrowDate] = useState<string>('');

  const [showInvite, setShowInvite] = useState<Group | null>(null);
  const [toolToManage, setToolToManage] = useState<Tool | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);

  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);
  const [groupEditInitialTab, setGroupEditInitialTab] = useState<'USERS' | 'TOOLS'>('TOOLS');

  const [groupToShareWith, setGroupToShareWith] = useState<Group | null>(null);
  const [preSelectedGroupId, setPreSelectedGroupId] = useState<string | undefined>(undefined);

  // Update Title
  useEffect(() => {
    const titles: Record<ViewState, string> = {
      HOME: 'Home',
      INVENTORY: 'My Tools',
      MARKETPLACE: 'Shared Tools',
      GROUPS: 'My Groups',
      HISTORY: 'History',
      PROFILE: 'Profile'
    };
    document.title = `ToolShare - ${titles[view]}`;
  }, [view]);

  // Login Handling
  const handleLogin = (user: typeof currentUser) => {
    if (user) {
      setCurrentUser(user);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // Time calculations
  const getHoursRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    return (end - now) / (1000 * 60 * 60);
  };

  // Actions
  const handleAddTool = (newToolData: Omit<Tool, 'id' | 'ownerId'>) => {
    addTool({
      ...newToolData,
      ownerId: currentUser.id,
    });
    setPreSelectedGroupId(undefined);
  };

  const handleCreateBooking = (bookingData: Omit<Booking, 'id' | 'borrowerId' | 'ownerId' | 'status'>) => {
    if (!selectedToolForBorrow) return;

    createBooking({
      ...bookingData,
      toolId: bookingData.toolId,
      borrowerId: currentUser.id,
      ownerId: selectedToolForBorrow.ownerId,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      reason: bookingData.reason,
      logistics: bookingData.logistics,
    });

    setSelectedToolForBorrow(null);
    setInitialBorrowDate('');
    setView('HISTORY');
  };

  const handleRequestExtension = (booking: Booking) => {
    alert(`Extension request sent to owner for ${booking.id}`);
  };

  const handleCreateGroup = (name: string) => {
    createGroup(name, currentUser.id);
  };

  const handleJoinGroup = (code: string) => {
    const group = joinGroup(code, currentUser.id);
    if (group) {
      const wasAlreadyMember = groups.find(g => g.id === group.id && g.memberIds.includes(currentUser.id));
      if (wasAlreadyMember) {
        alert('You are already a member of this group.');
      }
      setShowJoinGroup(false);
    } else {
      alert('Invalid invite code. Please try again.');
    }
  };

  const handleRemoveMember = (groupId: string, userId: string) => {
    removeMember(groupId, userId);
  };

  const handleGroupToolUpdate = (toolIds: string[], groupId: string) => {
    updateToolGroups(toolIds, groupId, currentUser.id);
    setGroupToShareWith(null);
  };

  const openCreateToolForGroup = () => {
    if (groupToShareWith) {
      setPreSelectedGroupId(groupToShareWith.id);
      setGroupToShareWith(null);
      setShowAddTool(true);
    }
  };

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
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
          <h2 className="text-2xl font-bold text-black">Welcome, {currentUser.name.split(' ')[0]}</h2>
          <p className="text-black/80">Here's what's happening with your tools.</p>
        </div>
      </div>

      {/* 1. Request Alerts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-black flex items-center gap-2">
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
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-black/40">
            <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6 text-black/20" />
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
                        <p className="font-medium text-black text-sm">
                          <span className="font-bold">{borrower?.name}</span> needs <span className="font-bold">{tool?.name}</span>
                        </p>
                        <p className="text-xs text-black/80 mt-1 line-clamp-1">{req.reason}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <span className="text-xs font-mono text-black/60">{req.startDate} - {req.endDate}</span>
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

      {/* 2. Tools I am Borrowing */}
      <section>
        <h3 className="font-bold text-black mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-green-600" />
          Tools You Have
        </h3>
        {activeBorrows.length === 0 ? (
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-black/60">
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
                      <h4 className="font-bold text-black text-sm truncate">{tool?.name}</h4>
                      <p className="text-xs text-black/80">From {owner?.name}</p>

                      <div className={`flex items-center gap-1 mt-1 text-xs font-bold ${isUrgent ? 'text-amber-600' : isOverdue ? 'text-red-600' : 'text-black/60'}`}>
                        <Clock className="w-3 h-3" />
                        {isOverdue ? 'Overdue!' : isUrgent ? `${Math.ceil(hoursLeft)} hours left` : `Due ${booking.endDate}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleReturnTool(booking)}
                      className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-black shadow-sm"
                      title="Return Tool"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

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

      {/* 3. Tools I have Borrowed Out */}
      <section>
        <h3 className="font-bold text-black mb-3 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-blue-500" />
          Your Tools Out
        </h3>
        {myToolsBorrowedOut.length === 0 ? (
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-black/60">
            All your tools are safe at home.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {myToolsBorrowedOut.map(tool => {
              const activeBooking = bookings.find(b =>
                b.toolId === tool.id &&
                b.status === 'APPROVED'
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
                    <h4 className="font-bold text-black text-sm truncate">{tool.name}</h4>
                    <p className="text-xs text-black/80">With {holder?.name}</p>
                    {activeBooking && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-black/60">
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
        <h2 className="text-2xl font-bold text-black">My Tools</h2>
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
          <p className="text-black/60">You haven't added any tools yet.</p>
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
          <h2 className="text-2xl font-bold text-black">Shared Tools</h2>
          <p className="text-sm text-black/60">From your groups</p>
        </div>
      </div>

      {marketTools.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-black/60">No tools shared with you yet.</p>
          <p className="text-sm text-black/40 mt-2">Join more groups or invite friends!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketTools.map(tool => {
            const activeBooking = bookings.find(b =>
              b.toolId === tool.id && b.status === 'APPROVED'
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
                    setInitialBorrowDate(nextDate.toISOString().split('T')[0] || '');
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

      {/* 1. Lending History */}
      <section>
        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-blue-500" />
          My Lending History (Tools I Shared)
        </h3>
        {myLendingHistory.length === 0 ? (
          <p className="text-black/60 text-sm italic bg-slate-50 p-4 rounded-lg">No lending history yet.</p>
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
                      <p className="font-bold text-black">{tool?.name}</p>
                      <p className="text-xs text-black/80">Borrowed by <span className="font-bold">{borrower?.name}</span></p>
                      <p className="text-[10px] text-black/40 mt-0.5">{booking.startDate} to {booking.endDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-1 ${
                      booking.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      booking.status === 'COMPLETED' ? 'bg-slate-100 text-slate-600' :
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

      {/* 2. Borrowing History */}
      <section>
        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-purple-500" />
          My Borrowing History
        </h3>
        {myBookings.length === 0 ? (
           <p className="text-black/60 text-sm italic bg-slate-50 p-4 rounded-lg">No borrowing history yet.</p>
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
                        <p className="font-bold text-black">{tool?.name}</p>
                        <p className="text-xs text-black/80">From: {owner?.name}</p>
                        <p className="text-[10px] text-black/40 mt-0.5">{booking.startDate} to {booking.endDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-1 ${
                        booking.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        booking.status === 'COMPLETED' ? 'bg-slate-100 text-slate-600' :
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
        <h2 className="text-2xl font-bold text-black">My Groups</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowJoinGroup(true)}
            className="text-primary font-medium hover:underline text-sm"
          >
            Join Group
          </button>
          <span className="text-black/20">|</span>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="text-primary font-medium hover:underline text-sm"
          >
            + Create Group
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myGroups.map(group => (
          <div key={group.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-black">{group.name}</h3>
                <p className="text-black/60 text-sm">{group.memberIds.length} members</p>
              </div>
              <div className="flex -space-x-2">
                {group.memberIds.slice(0, 3).map(mid => {
                   const m = users.find(u => u.id === mid);
                   return <img key={mid} src={m?.avatar} className="w-8 h-8 rounded-full border-2 border-white" alt={m?.name} />;
                })}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setGroupToEdit(group);
                  setGroupEditInitialTab('USERS');
                }}
                className="flex-1 bg-white border border-slate-200 text-black py-2 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                title="Group Settings"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>

              <button
                onClick={() => setShowInvite(group)}
                className="flex-1 bg-primary text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                title="Invite to Group"
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
            <h3 className="text-xl font-bold text-black mb-2">Invite to {showInvite.name}</h3>
            <p className="text-black/60 text-sm mb-6">Scan to join or share the link</p>

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
            <p className="text-xs text-black/60 mb-4">Enter this code in the "Join Group" menu</p>

            <button onClick={() => setShowInvite(null)} className="text-black/60 hover:text-black text-sm font-medium">Close</button>
          </div>
        </div>
      )}
    </div>
  );

  // Bottom Navigation Item
  const NavItem = ({ id, icon: Icon, label }: { id: ViewState, icon: React.ElementType, label: string }) => (
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
      {/* Header */}
      <header className="border-b border-slate-200 sticky top-0 z-20 px-4 py-3 shadow-sm" style={{ backgroundColor: '#7393B3' }}>
        <div className="max-w-5xl mx-auto flex justify-between items-center">
           <div className="flex items-center gap-2 text-white font-bold text-lg">
             <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white backdrop-blur-sm">
               <Wrench className="w-5 h-5" />
             </div>
             ToolShare
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 border-r border-white/20 pr-4 mr-2">
                <span className="text-xs text-white/80 font-medium uppercase tracking-wider mr-2">Switch User</span>
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => switchUser(u.id)}
                    className={`w-8 h-8 rounded-full overflow-hidden border transition-colors ${
                       currentUser.id === u.id ? 'border-white ring-2 ring-white/30' : 'border-white/40 opacity-70 hover:opacity-100'
                    }`}
                    title={`Switch to ${u.name}`}
                  >
                    <img src={u.avatar} className="w-full h-full" alt={u.name} />
                  </button>
                ))}
             </div>

             <div className="flex items-center gap-2">
               <span className="hidden sm:block text-sm font-bold text-white">{currentUser.name}</span>
               <img src={currentUser.avatar} className="w-9 h-9 rounded-full border-2 border-white/50 shadow-sm" alt="Profile" />

               <button onClick={handleLogout} className="ml-2 text-white/70 hover:text-white">
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

      {/* Bottom Nav */}
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
          groups={myGroups}
          onClose={() => setToolToManage(null)}
          onUpdate={updateTool}
          onDelete={deleteTool}
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
          onUpdate={updateGroup}
          onDelete={deleteGroup}
          onManageTools={() => {
            setGroupToShareWith(groupToEdit);
            setGroupToEdit(null);
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
