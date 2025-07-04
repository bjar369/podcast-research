'use client';

import { useState } from 'react';
import { User, Search } from 'lucide-react';

interface PersonSearchProps {
  onSearch: (name: string) => void;
  loading?: boolean;
}

export default function PersonSearch({ onSearch, loading }: PersonSearchProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSearch(name.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="flex-1 relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter person's name (e.g., Elon Musk, Joe Rogan)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Search className="w-5 h-5" />
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
    </div>
  );
}