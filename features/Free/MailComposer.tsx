import React, { useState } from 'react';
import { generateEmail } from '../../services/geminiService';
import { ClipboardIcon, CheckIcon } from '../../components/icons/FeatureIcons';

const TONES = ['Formal', 'Santai', 'Persuasif', 'Langsung ke Poin', 'Ramah'];

const MailComposer: React.FC = () => {
    const [to, setTo] = useState('');
    const [from, setFrom] = useState('');
    const [subject, setSubject] = useState('');
    const [tone, setTone] = useState(TONES[0]);
    const [points, setPoints] = useState('');
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !points.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedEmail('');
        setIsCopied(false);

        try {
            const result = await generateEmail(to, from, subject, tone, points);
            setGeneratedEmail(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!generatedEmail) return;
        navigator.clipboard.writeText(generatedEmail).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 md:p-6 shadow-2xl shadow-black/20">
            <div className="flex-shrink-0 mb-4">
                <h2 className="text-xl font-bold text-white">Mail Composer</h2>
                <p className="text-sm text-zinc-400">Buat draf email profesional atau santai dari poin-poin singkat.</p>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
                {/* Left Panel: Form */}
                <form onSubmit={handleSubmit} className="w-full md:w-1/2 flex flex-col space-y-4 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="to" className="block text-sm font-medium text-zinc-300 mb-2">Untuk (Opsional)</label>
                            <input id="to" type="email" value={to} onChange={(e) => setTo(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 focus:ring-violet-500 focus:outline-none focus:ring-1" placeholder="penerima@email.com"/>
                        </div>
                        <div>
                            <label htmlFor="from" className="block text-sm font-medium text-zinc-300 mb-2">Dari (Opsional)</label>
                            <input id="from" type="email" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 focus:ring-violet-500 focus:outline-none focus:ring-1" placeholder="pengirim@email.com"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-zinc-300 mb-2">Subjek</label>
                        <input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 focus:ring-violet-500 focus:outline-none focus:ring-1" placeholder="Contoh: Lamaran Posisi Frontend Developer" required/>
                    </div>
                    <div>
                        <label htmlFor="tone" className="block text-sm font-medium text-zinc-300 mb-2">Gaya Bahasa</label>
                        <select id="tone" value={tone} onChange={(e) => setTone(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 focus:ring-violet-500 focus:outline-none focus:ring-1">
                            {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label htmlFor="points" className="block text-sm font-medium text-zinc-300 mb-2">Poin-poin Utama</label>
                        <textarea id="points" rows={6} value={points} onChange={(e) => setPoints(e.target.value)} className="w-full flex-1 bg-zinc-950 border border-zinc-700 rounded-lg p-2 focus:ring-violet-500 focus:outline-none focus:ring-1" placeholder="- Perkenalkan diri&#10;- Sampaikan ketertarikan pada posisi X&#10;- Lampirkan CV" required/>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !subject.trim() || !points.trim()}
                        className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:shadow-none"
                    >
                        {isLoading ? 'Menulis...' : 'Generate Email'}
                    </button>
                </form>

                {/* Right Panel: Result */}
                <div className="w-full md:w-1/2 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-zinc-300">Hasil Draf</label>
                        <button onClick={handleCopy} disabled={!generatedEmail || isLoading} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white disabled:opacity-50 transition-colors">
                            {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                            {isCopied ? 'Tersalin!' : 'Salin'}
                        </button>
                    </div>
                    <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-zinc-300 whitespace-pre-wrap overflow-y-auto">
                        {isLoading && <p className="text-zinc-500 animate-pulse">Menyusun email...</p>}
                        {error && <p className="text-red-400">{error}</p>}
                        {generatedEmail}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MailComposer;