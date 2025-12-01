import React, { useState, useEffect } from 'react';
import { Tool } from '../types';
import { X, Calendar, MapPin } from 'lucide-react';

interface BorrowModalProps {
  tool: Tool;
  initialStartDate?: string;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({ tool, initialStartDate, onClose, onSubmit }) => {
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [logistics, setLogistics] = useState('PICKUP');
  const [logisticsDetails, setLogisticsDetails] = useState('');

  // Update start date if prop changes
  useEffect(() => {
    if (initialStartDate) setStartDate(initialStartDate);
  }, [initialStartDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      toolId: tool.id,
      startDate,
      endDate,
      reason,
      logistics,
      logisticsDetails
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-slate-800">Borrow Request</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <img src={tool.image} alt={tool.name} className="w-12 h-12 rounded object-cover" />
            <div>
              <p className="font-semibold text-slate-900">{tool.name}</p>
              <p className="text-sm text-slate-500">Owner will approve your request</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">From</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  required
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  required
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Why do you need it?</label>
            <textarea 
              required
              rows={2}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Building a birdhouse for my daughter..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Logistics</label>
            <select 
              className="w-full p-2 border rounded-lg mb-2"
              value={logistics}
              onChange={(e) => setLogistics(e.target.value)}
            >
              <option value="PICKUP">I will pick it up at your place</option>
              <option value="MEET">Let's meet somewhere</option>
              <option value="DROP">Can you drop it off?</option>
            </select>
            
            {(logistics === 'MEET' || logistics === 'DROP') && (
              <div className="relative animate-in fade-in slide-in-from-top-2">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  required
                  placeholder={logistics === 'MEET' ? "Where should we meet?" : "Drop off address"}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  value={logisticsDetails}
                  onChange={(e) => setLogisticsDetails(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-600 transition-all active:scale-95"
            >
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
