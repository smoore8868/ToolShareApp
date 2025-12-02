import React, { useState, useRef } from 'react';
import { Camera, Sparkles, X, Upload, Loader2 } from 'lucide-react';
import { analyzeToolImage } from '../services/geminiService';
import { Tool, ToolStatus } from '../types';

interface AddToolModalProps {
  onClose: () => void;
  onAdd: (tool: Omit<Tool, 'id' | 'ownerId'>) => void;
  preSelectedGroupId?: string;
}

export const AddToolModal: React.FC<AddToolModalProps> = ({ onClose, onAdd, preSelectedGroupId }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('General');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImage(base64);
        
        // Auto-trigger AI analysis
        setIsAnalyzing(true);
        const analysis = await analyzeToolImage(base64);
        setIsAnalyzing(false);

        if (analysis) {
          setName(analysis.name);
          setDescription(analysis.description);
          setPrice(analysis.estimatedPrice.toString());
          setCategory(analysis.category);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return; // Validation needed in real app
    
    onAdd({
      name,
      description,
      price: parseFloat(price) || 0,
      image,
      category,
      status: ToolStatus.AVAILABLE,
      groupIds: preSelectedGroupId ? [preSelectedGroupId] : [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-black">Add New Tool</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-black/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload Area */}
          <div 
            className="relative w-full h-48 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden group"
            onClick={() => fileInputRef.current?.click()}
          >
            {image ? (
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera className="w-8 h-8 text-black/40 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-black/60 font-medium">Click to take photo or upload</span>
              </>
            )}
            
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-sm font-medium">AI Analyzing tool...</span>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Tool Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded-lg pr-8 focus:ring-2 focus:ring-primary focus:outline-none text-black"
                  placeholder="e.g. Cordless Drill"
                  required
                />
                {isAnalyzing && <Sparkles className="absolute right-2 top-2.5 w-4 h-4 text-purple-500 animate-pulse" />}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-black"
              >
                <option>Power Tools</option>
                <option>Hand Tools</option>
                <option>Garden</option>
                <option>Painting</option>
                <option>Automotive</option>
                <option>General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-black"
                rows={3}
                placeholder="Briefly describe condition and specs..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Estimated Value ($)</label>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-black"
                placeholder="0.00"
              />
            </div>
          </div>
          
          {preSelectedGroupId && (
            <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Will be automatically added to group
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Add to Inventory
          </button>
        </form>
      </div>
    </div>
  );
};