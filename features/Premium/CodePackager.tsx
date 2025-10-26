import React, { useState, useEffect, useRef } from 'react';
import { generateBuildArtifacts } from '../../services/geminiService';
import type { BuildArtifacts } from '../../services/geminiService';
import { CubeTransparentIcon, CheckIcon, ArrowDownTrayIcon, SparklesIcon } from '../../components/icons/FeatureIcons';
import MessageContent from '../../components/MessageContent';

const INITIAL_BUILD_STEPS = [
  { text: 'Analyzing project structure...', status: 'pending' },
  { text: 'Validating `package.json`...', status: 'pending' },
  { text: 'Generating Capacitor config...', status: 'pending' },
  { text: 'Generating AndroidManifest snippet...', status: 'pending' },
  { text: 'Setting up Capacitor bridge...', status: 'pending' },
  { text: 'Generating Android project files...', status: 'pending' },
  { text: 'Compiling web assets (`npm run build`)...', status: 'pending' },
  { text: 'Running Gradle build...', status: 'pending' },
  { text: 'Packaging into .apk...', status: 'pending' },
  { text: 'Finalizing package...', status: 'pending' },
];

type BuildStep = { text: string; status: 'pending' | 'in-progress' | 'done' };
type BuildState = 'idle' | 'building' | 'success' | 'error';
type ResultTab = 'log' | 'capacitor' | 'manifest';

const CodePackager: React.FC = () => {
    const [zipFile, setZipFile] = useState<File | null>(null);
    const [appName, setAppName] = useState('');
    const [packageName, setPackageName] = useState('');
    const [packageJsonContent, setPackageJsonContent] = useState('');
    const [buildState, setBuildState] = useState<BuildState>('idle');
    const [buildSteps, setBuildSteps] = useState<BuildStep[]>(INITIAL_BUILD_STEPS);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [buildArtifacts, setBuildArtifacts] = useState<BuildArtifacts | null>(null);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<number | null>(null);
    const [activeTab, setActiveTab] = useState<ResultTab>('log');

    useEffect(() => {
        if (appName) {
            const sanitizedAppName = appName.toLowerCase().replace(/[^a-z0-9]/g, '');
            setPackageName(`com.yanofficial.${sanitizedAppName || 'app'}`);
        } else {
            setPackageName('');
        }
    }, [appName]);

    useEffect(() => {
        if (buildState === 'building' && !buildArtifacts) {
            // Start the build process
            const processBuild = async () => {
                if (!zipFile || !appName || !packageName || !packageJsonContent) return;

                try {
                    const artifacts = await generateBuildArtifacts(appName, packageName, packageJsonContent);
                    setBuildArtifacts(artifacts);
                } catch (aiError) {
                    console.error("Failed to generate build artifacts:", aiError);
                    setError(aiError instanceof Error ? aiError.message : "An AI error occurred during artifact generation.");
                    setBuildState('error');
                    if (intervalRef.current) clearInterval(intervalRef.current);
                }
            };
            processBuild();
            
            // Start the visual simulation
            intervalRef.current = window.setInterval(() => {
                setCurrentStepIndex(prevIndex => {
                    const nextIndex = prevIndex + 1;
                    if (nextIndex >= buildSteps.length) {
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        // The actual success is determined by the AI call finishing
                        return prevIndex;
                    }
                    setBuildSteps(prevSteps => {
                        const newSteps = [...prevSteps];
                        if (prevIndex < newSteps.length) newSteps[prevIndex].status = 'done';
                        if (nextIndex < newSteps.length) newSteps[nextIndex].status = 'in-progress';
                        return newSteps;
                    });
                    return nextIndex;
                });
            }, 800);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [buildState, buildSteps.length, appName, packageName, packageJsonContent, zipFile, buildArtifacts]);
    
    // Transition to success state only when simulation is done AND artifacts are ready
    useEffect(() => {
        if (currentStepIndex >= buildSteps.length -1 && buildArtifacts) {
            setBuildState('success');
        }
    }, [currentStepIndex, buildArtifacts, buildSteps.length]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/zip') {
            setZipFile(file);
            setAppName(file.name.replace('.zip', ''));
            handleReset();
        } else {
            setError('Please upload a valid .zip file.');
            setZipFile(null);
        }
    };
    
    const handleBuild = () => {
        if (!zipFile || !appName || !packageName || !packageJsonContent) {
            setError('Please provide a zip file, application name, and package.json content.');
            return;
        }
        setError(null);
        setBuildState('building');
        setBuildSteps(INITIAL_BUILD_STEPS.map((step, index) => ({...step, status: index === 0 ? 'in-progress' : 'pending'})));
        setCurrentStepIndex(0);
    };
    
    const handleDownload = () => {
        const dummyContent = `This is a placeholder APK for "${appName}" generated by YAN OFFICIAL AI. In a real environment, this would be a compiled Android application.`;
        const blob = new Blob([dummyContent], { type: 'application/vnd.android.package-archive' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${appName.replace(/\s+/g, '_')}.apk`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        // Keep file and app name, but reset everything else
        setPackageJsonContent('');
        setBuildState('idle');
        setBuildArtifacts(null);
        setError(null);
        setBuildSteps(INITIAL_BUILD_STEPS);
        setCurrentStepIndex(0);
        setActiveTab('log');
    };

    const TabButton: React.FC<{tabId: ResultTab; label: string}> = ({ tabId, label }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabId ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 md:p-6 shadow-2xl shadow-black/20">
            <div className="flex-shrink-0 mb-4">
                <h2 className="text-xl font-bold text-white">APK Builder</h2>
                <p className="text-sm text-zinc-400">Analisis `package.json` Anda untuk membuat APK dan semua file konfigurasi yang diperlukan.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {buildState === 'idle' && (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <label htmlFor="zip-upload" className="block text-sm font-medium text-zinc-300 mb-2">1. Project .zip File</label>
                            <div className="mt-1 flex justify-center rounded-lg border border-dashed border-zinc-700 px-6 py-10 hover:border-violet-500 transition-colors">
                                <div className="text-center">
                                    <CubeTransparentIcon className="mx-auto h-12 w-12 text-zinc-500"/>
                                    <div className="mt-4 flex text-sm leading-6 text-zinc-400">
                                        <label htmlFor="zip-upload" className="relative cursor-pointer rounded-md bg-transparent font-semibold text-violet-400 focus-within:outline-none hover:text-violet-500">
                                            <span>{zipFile ? 'Ganti file' : 'Upload file'}</span>
                                            <input id="zip-upload" name="zip-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".zip"/>
                                        </label>
                                    </div>
                                    <p className="text-xs leading-5 text-zinc-500">{zipFile ? zipFile.name : 'ZIP file up to 50MB'}</p>
                                </div>
                            </div>
                        </div>
                        {zipFile && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label htmlFor="appName" className="block text-sm font-medium text-zinc-300 mb-2">2. Application Name</label>
                                    <input id="appName" type="text" value={appName} onChange={(e) => setAppName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 focus:ring-violet-500 focus:outline-none focus:ring-1" placeholder="My Awesome App"/>
                                </div>
                                 <div>
                                    <label htmlFor="packageJsonContent" className="block text-sm font-medium text-zinc-300 mb-2">3. Paste `package.json` content</label>
                                    <textarea id="packageJsonContent" rows={6} value={packageJsonContent} onChange={(e) => setPackageJsonContent(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 font-mono text-xs focus:ring-violet-500 focus:outline-none focus:ring-1" placeholder={`{
  "name": "my-react-app",
  "version": "0.1.0",
  ...
}`}/>
                                </div>
                            </div>
                        )}
                        <div className="pt-2">
                             <button onClick={handleBuild} disabled={!zipFile || !appName || !packageJsonContent.trim()} className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:shadow-none disabled:cursor-not-allowed">
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                Build My APK
                            </button>
                        </div>
                    </div>
                )}

                {(buildState === 'building' || buildState === 'error') && (
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg animate-fade-in">
                        <h3 className="font-semibold text-white mb-4">Build in Progress...</h3>
                        <ul className="space-y-2">
                            {buildSteps.map((step, index) => (
                                <li key={index} className="flex items-center gap-3 text-sm">
                                    {step.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-zinc-600"></div>}
                                    {step.status === 'in-progress' && <svg className="animate-spin h-4 w-4 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>}
                                    {step.status === 'done' && <CheckIcon className="w-4 h-4 text-green-500" />}
                                    <span className={step.status === 'pending' ? 'text-zinc-500' : 'text-zinc-300'}>{step.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {buildState === 'success' && buildArtifacts && (
                     <div className="animate-fade-in space-y-4">
                        <div className="text-center p-6 bg-zinc-950 border border-green-800 rounded-lg space-y-4">
                            <CheckIcon className="w-16 h-16 text-green-500 bg-green-900/20 p-3 rounded-full mx-auto" />
                            <div>
                                <h3 className="text-2xl font-bold text-white">Build Successful!</h3>
                                <p className="text-zinc-400 mt-1">Your APK for "{appName}" is ready to download.</p>
                            </div>
                            <button onClick={handleDownload} className="w-full max-w-sm mx-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                                Download APK
                            </button>
                        </div>
                        
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                            <h3 className="font-semibold text-white mb-3">Build Artifacts</h3>
                            <div className="flex items-center gap-2 p-1 bg-zinc-900 rounded-lg mb-3">
                                <TabButton tabId="log" label="Build Log" />
                                <TabButton tabId="capacitor" label="capacitor.config.json" />
                                <TabButton tabId="manifest" label="AndroidManifest.xml" />
                            </div>
                            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 max-h-60 overflow-y-auto">
                                {activeTab === 'log' && <MessageContent text={`\`\`\`bash\n${buildArtifacts.buildLog}\n\`\`\``} />}
                                {activeTab === 'capacitor' && <MessageContent text={`\`\`\`json\n${buildArtifacts.capacitorConfig}\n\`\`\``} />}
                                {activeTab === 'manifest' && <MessageContent text={`\`\`\`xml\n${buildArtifacts.androidManifest}\n\`\`\``} />}
                            </div>
                        </div>

                        <div className="text-center">
                            <button onClick={handleReset} className="text-violet-400 hover:text-violet-300 text-sm font-semibold mt-2">
                                Build Another App
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodePackager;