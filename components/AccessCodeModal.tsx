import React, { useState } from 'react';

interface AccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: (code: string) => void;
  error: string | null;
}

const AccessCodeModal: React.FC<AccessCodeModalProps> = ({ isOpen, onClose, onUnlock, error }) => {
  const [code, setCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUnlock(code);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl p-8 border border-zinc-800 w-full max-w-md m-4 animate-zoom-in">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Akses Fitur Premium</h2>
            <p className="text-zinc-400 mt-1">Dapatkan akses penuh ke semua alat canggih.</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>
        
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-zinc-300">
                Untuk mendapatkan kode akses, silakan kirim email permintaan ke:
            </p>
            <a 
                href="mailto:yanoffcial040@gmail.com?subject=Permintaan%20Kode%20Akses%20Premium"
                className="font-semibold text-violet-400 hover:text-violet-300 transition-colors break-words"
            >
                yanoffcial040@gmail.com
            </a>
        </div>

        <div className="border-t border-zinc-800 pt-6">
            <p className="text-center text-zinc-400 mb-4 font-semibold">Sudah Punya Kode?</p>
            <form onSubmit={handleSubmit}>
              <div className="relative mb-4">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  placeholder="Masukkan kode akses di sini..."
                  aria-label="Access Code"
                />
                 <div className="absolute inset-0 rounded-lg border border-violet-500/30 blur-lg opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>

              {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
              
              <button 
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(139,92,246,0.4)]"
              >
                Unlock Now
              </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AccessCodeModal;
