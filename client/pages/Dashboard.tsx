import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { publicKey, connected } = useWallet();
    const [analysisData, setAnalysisData] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    const startAnalysis = async () => {
        if (!publicKey) return;
        
        setIsAnalyzing(true);
        setProgress(0);
        setLogs([]);
        setAnalysisData(null);

        try {
            // Connect to the backend analysis endpoint
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
            const eventSource = new EventSource(`${backendUrl}/analyze/${publicKey.toString()}`);
            
            eventSource.onmessage = function(event) {
                if (event.data === '[DONE]') {
                    eventSource.close();
                    setIsAnalyzing(false);
                    return;
                }
                
                try {
                    const data = JSON.parse(event.data);
                    setProgress(data.progress);
                    setLogs(prev => [...prev, `Step ${data.step}: ${data.status} (${data.progress}%)`]);
                    
                    if (data.analysis_result || data.detailed_data) {
                        setAnalysisData(data);
                    }
                } catch (e) {
                    console.error('Error parsing data:', e);
                    setLogs(prev => [...prev, 'Error: Failed to parse response data']);
                }
            };
            
            eventSource.onerror = function(event) {
                console.error('EventSource error:', event);
                eventSource.close();
                setIsAnalyzing(false);
                setLogs(prev => [...prev, 'Connection Error: Unable to connect to analysis server']);
            };
        } catch (error) {
            console.error('Analysis error:', error);
            setIsAnalyzing(false);
        }
    };

    if (!connected) {
        return (
            <div className="min-h-screen main-gradient flex items-center justify-center px-4">
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8 max-w-md w-full text-center">
                    <h2 className="text-white font-poppins text-2xl font-bold mb-4">
                        Connect Your Wallet
                    </h2>
                    <p className="text-white/70 font-poppins mb-6">
                        Please connect your Solana wallet to access the SentrySol dashboard
                    </p>
                    <WalletMultiButton className="!bg-sentry-sage !text-black !font-poppins !rounded-full hover:!bg-sentry-sage/90" />
                    <div className="mt-6">
                        <Link 
                            to="/" 
                            className="text-white/60 font-poppins text-sm hover:text-white transition-colors"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen main-gradient">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-3">
                            <img 
                                src="https://api.builder.io/api/v1/image/assets/TEMP/7a2765d9790496907d7a42bab916df1a729b35e2?width=78" 
                                alt="SentrySol Logo" 
                                className="w-8 h-8"
                            />
                            <span className="text-white font-poppins text-xl font-bold">
                                SENTRYSOL
                            </span>
                        </Link>
                        <span className="text-white/60 font-poppins text-sm">Dashboard</span>
                    </div>
                    <WalletMultiButton className="!bg-sentry-sage !text-black !font-poppins !rounded-full hover:!bg-sentry-sage/90" />
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                {/* Welcome Section */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-8">
                    <h1 className="text-white font-poppins text-3xl font-bold mb-4">
                        Welcome to SentrySol Dashboard
                    </h1>
                    <p className="text-white/70 font-poppins text-lg mb-6">
                        AI behavioral security analysis for your Solana wallet
                    </p>
                    <div className="bg-black/20 rounded-2xl p-4">
                        <p className="text-white/60 font-poppins text-sm mb-2">Connected Wallet:</p>
                        <p className="text-white font-mono text-lg break-all">
                            {publicKey?.toString()}
                        </p>
                    </div>
                </div>

                {/* Analysis Section */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-white font-poppins text-2xl font-bold">
                            Security Analysis
                        </h2>
                        <button
                            onClick={startAnalysis}
                            disabled={isAnalyzing}
                            className="bg-sentry-sage text-black font-poppins text-lg font-normal px-6 py-3 rounded-full hover:bg-sentry-sage/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
                        </button>
                    </div>

                    {/* Progress Bar */}
                    {isAnalyzing && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-white/70 font-poppins">Analysis Progress</span>
                                <span className="text-white font-poppins">{progress}%</span>
                            </div>
                            <div className="w-full bg-black/20 rounded-full h-3">
                                <div 
                                    className="bg-gradient-to-r from-sentry-sage to-sentry-accent h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Logs */}
                    {logs.length > 0 && (
                        <div className="bg-black/20 rounded-2xl p-4 mb-6 max-h-60 overflow-y-auto">
                            <h3 className="text-white font-poppins text-lg font-semibold mb-3">Analysis Logs</h3>
                            {logs.map((log, index) => (
                                <div key={index} className="text-white/70 font-mono text-sm mb-2 p-2 bg-black/20 rounded">
                                    {log}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Analysis Results */}
                    {analysisData && (
                        <div className="bg-black/20 rounded-2xl p-6">
                            <h3 className="text-white font-poppins text-xl font-semibold mb-4">Analysis Results</h3>
                            
                            {/* Risk Level */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 text-center">
                                    <div className="text-green-300 font-poppins text-sm mb-1">Security Score</div>
                                    <div className="text-white font-poppins text-2xl font-bold">Safe</div>
                                </div>
                                <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4 text-center">
                                    <div className="text-blue-300 font-poppins text-sm mb-1">Threats Detected</div>
                                    <div className="text-white font-poppins text-2xl font-bold">0</div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4 text-center">
                                    <div className="text-purple-300 font-poppins text-sm mb-1">Data Sources</div>
                                    <div className="text-white font-poppins text-2xl font-bold">5</div>
                                </div>
                            </div>

                            {/* Raw Data (for development) */}
                            <details className="bg-black/20 rounded-xl p-4">
                                <summary className="text-white font-poppins cursor-pointer mb-2">
                                    View Raw Analysis Data
                                </summary>
                                <pre className="text-white/70 font-mono text-xs overflow-auto max-h-60">
                                    {JSON.stringify(analysisData, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <div className="w-12 h-12 bg-sentry-sage rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-white font-poppins text-lg font-semibold mb-2">Real-time Protection</h3>
                        <p className="text-white/70 font-poppins text-sm">
                            Continuous monitoring of your wallet activity for suspicious behavior
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <div className="w-12 h-12 bg-sentry-accent rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-poppins text-lg font-semibold mb-2">AI Analysis</h3>
                        <p className="text-white/70 font-poppins text-sm">
                            Advanced AI algorithms analyze transaction patterns and detect threats
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <div className="w-12 h-12 bg-sentry-blue-gray rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-white font-poppins text-lg font-semibold mb-2">Privacy First</h3>
                        <p className="text-white/70 font-poppins text-sm">
                            Your data never leaves your device. All analysis is performed locally
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
