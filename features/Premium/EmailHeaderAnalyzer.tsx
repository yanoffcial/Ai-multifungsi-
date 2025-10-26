import React, { useState } from 'react';
import { analyzeEmailHeader } from '../../services/geminiService';
import type { EmailAnalysisResult } from '../../services/geminiService';
import { ShieldCheckIcon, CheckIcon, XCircleIcon } from '../../components/icons/FeatureIcons';

const EmailHeaderAnalyzer: React.FC = () => {
    const [header, setHeader] = useState('');
    const [result, setResult] = useState<EmailAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!header.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const analysisResult = await analyzeEmailHeader(header);
            setResult(analysisResult);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please check the header and try again.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const RiskBadge: React.FC<{ level: EmailAnalysisResult['summary']['riskLevel'] }> = ({ level }) => {
        const styles = {
            Low: 'bg-green-900/50 text-green-300 border-green-700/50',
            Medium: 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50',
            High: 'bg-red-900/50 text-red-300 border-red-700/50',
            Informational: 'bg-blue-900/50 text-blue-300 border-blue-700/50',
        };
        return <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${styles[level]}`}>{level} Risk</span>;
    };
    
    const SecurityCheckRow: React.FC<{ name: string; result: string; details: string }> = ({ name, result, details }) => {
        const isPass = result.toLowerCase().includes('pass');
        return (
            <div className="flex items-start p-3 bg-zinc-900 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                    {isPass ? <CheckIcon className="w-5 h-5 text-green-500" /> : <XCircleIcon className="w-5 h-5 text-red-500" />}
                </div>
                <div className="ml-3 flex-1">
                    <p className="font-semibold text-white">{name}: <span className={isPass ? 'text-green-400' : 'text-red-400'}>{result}</span></p>
                    <p className="text-sm text-zinc-400">{details}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 md:p-6 shadow-2xl shadow-black/20">
            <div className="flex-shrink-0 mb-4">
                <h2 className="text-xl font-bold text-white">Email Header Analyzer</h2>
                <p className="text-sm text-zinc-400">Analisis jejak email dan periksa protokol keamanan untuk mendeteksi ancaman.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mb-4">
                <div>
                    <label htmlFor="header-input" className="block text-sm font-medium text-zinc-300 mb-2">
                        Tempelkan Header Email Mentah
                    </label>
                    <textarea
                        id="header-input"
                        rows={8}
                        value={header}
                        onChange={(e) => setHeader(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                        placeholder="Received: from mail-sor-f69.google.com (mail-sor-f69.google.com [209.85.220.69])..."
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !header.trim()}
                    className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:shadow-none"
                >
                    {isLoading ? 'Menganalisis...' : 'Analyze Header'}
                </button>
            </form>

            <div className="flex-1 overflow-y-auto pr-2">
                {isLoading && (
                    <div className="flex items-center justify-center h-full text-zinc-500 animate-pulse">
                        <ShieldCheckIcon className="w-10 h-10 mr-4" />
                        <p>Memeriksa jejak digital...</p>
                    </div>
                )}
                {error && <p className="text-red-400 text-center p-4 bg-red-900/20 border border-red-800 rounded-lg">{error}</p>}
                
                {result && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Summary */}
                        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-3">Analysis Summary</h3>
                            <div className="flex items-center justify-between mb-3">
                                <RiskBadge level={result.summary.riskLevel} />
                            </div>
                            <p className="font-semibold text-zinc-200 mb-1">{result.summary.verdict}</p>
                            <p className="text-sm text-zinc-400">{result.summary.recommendation}</p>
                        </div>

                        {/* Security Checks */}
                        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-3">Authentication Checks</h3>
                            <div className="space-y-2">
                                <SecurityCheckRow name="SPF" result={result.securityChecks.spf.result} details={result.securityChecks.spf.details} />
                                <SecurityCheckRow name="DKIM" result={result.securityChecks.dkim.result} details={result.securityChecks.dkim.details} />
                                <SecurityCheckRow name="DMARC" result={result.securityChecks.dmarc.result} details={result.securityChecks.dmarc.details} />
                            </div>
                        </div>

                        {/* Path Trace */}
                        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-3">Delivery Path</h3>
                            <div className="space-y-3">
                                {result.path.map((hop) => (
                                    <div key={hop.hop} className="text-xs font-mono p-3 bg-zinc-900 rounded-lg relative">
                                        <span className="absolute -top-2 -left-2 bg-violet-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-sans font-bold">{hop.hop}</span>
                                        <p><span className="text-zinc-500">From:</span> <span className="text-zinc-300">{hop.from}</span></p>
                                        <p><span className="text-zinc-500">By:  </span> <span className="text-zinc-300">{hop.by}</span></p>
                                        <p><span className="text-zinc-500">With:</span> <span className="text-zinc-300">{hop.with}</span> | <span className="text-zinc-500">Delay:</span> <span className="text-yellow-400">{hop.delay}</span></p>
                                        <p className="text-zinc-500 mt-1">{hop.timestamp}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailHeaderAnalyzer;