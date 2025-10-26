import React, { useState } from 'react';
import { reviewCode } from '../../services/geminiService';
import type { CodeReviewResult } from '../../services/geminiService';
import MessageContent from '../../components/MessageContent';
import { SparklesIcon } from '../../components/icons/FeatureIcons';

const LANGUAGES = ['JavaScript', 'Python', 'TypeScript', 'Java', 'Go', 'HTML', 'CSS', 'SQL'];

const CodeRefiner: React.FC = () => {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState(LANGUAGES[0]);
    const [result, setResult] = useState<CodeReviewResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const reviewResult = await reviewCode(code, language);
            setResult(reviewResult);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please check the code and try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const ResultSection: React.FC<{ title: string; items: string[] | undefined; icon: React.ReactNode }> = ({ title, items, icon }) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="p-4 bg-zinc-900 rounded-lg">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    {icon}
                    {title}
                </h4>
                 <ul className="space-y-3">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-start gap-2.5">
                            <div className="text-zinc-500 pt-1">&#x2022;</div>
                            <div className="flex-1">
                                <MessageContent text={item} />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 md:p-6 shadow-2xl shadow-black/20">
            <div className="flex-shrink-0 mb-4">
                <h2 className="text-xl font-bold text-white">Code Refiner</h2>
                <p className="text-sm text-zinc-400">Dapatkan review kode mendalam untuk menemukan bug, meningkatkan performa, dan menerapkan praktik terbaik.</p>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
                {/* Left Panel: Form */}
                <form onSubmit={handleSubmit} className="w-full md:w-1/2 flex flex-col space-y-4 overflow-y-auto pr-2">
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-zinc-300 mb-2">Bahasa Pemrograman</label>
                        <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 focus:ring-violet-500 focus:outline-none focus:ring-1">
                            {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label htmlFor="code-input" className="block text-sm font-medium text-zinc-300 mb-2">Tempelkan Kode Anda</label>
                        <div className="flex-1 relative">
                             <textarea
                                id="code-input"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full h-full absolute inset-0 bg-zinc-950 border border-zinc-700 rounded-lg p-3 font-mono text-xs focus:ring-violet-500 focus:outline-none focus:ring-1 resize-none"
                                placeholder={`function example() {\n  // Your code here...\n}`}
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !code.trim()}
                        className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:shadow-none"
                    >
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        {isLoading ? 'Menganalisis...' : 'Refine Code'}
                    </button>
                </form>

                {/* Right Panel: Result */}
                <div className="w-full md:w-1/2 flex flex-col">
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Hasil Review</label>
                    <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-y-auto">
                        {isLoading && <p className="text-zinc-500 animate-pulse text-center pt-10">Menganalisis kode Anda...</p>}
                        {error && <p className="text-red-400">{error}</p>}
                        {result && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <h3 className="font-semibold text-lg text-white mb-2">Ringkasan</h3>
                                    <div className="text-sm text-zinc-300">
                                        <MessageContent text={result.summary} />
                                    </div>
                                </div>
                                <ResultSection title="Potential Bugs" items={result.bugs} icon={<span>🐞</span>} />
                                <ResultSection title="Performance" items={result.performance} icon={<span>🚀</span>} />
                                <ResultSection title="Style & Readability" items={result.style} icon={<span>🎨</span>} />
                                <ResultSection title="Best Practices" items={result.bestPractices} icon={<span>✅</span>} />
                            </div>
                        )}
                         {!isLoading && !result && !error && (
                            <div className="flex items-center justify-center h-full text-center text-zinc-500">
                                <p>Hasil review kode akan muncul di sini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeRefiner;