import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChatBox } from '@/components/ChatBox';
import { NetworkGraph } from '@/components/NetworkGraph';
import { TransactionFlow } from '@/components/TransactionFlow';
import { Activity, Shield, TrendingUp, Eye, MessageSquare, Network, BarChart3, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
    const { publicKey, connected } = useWallet();
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [activeView, setActiveView] = useState<'overview' | 'chat' | 'network' | 'flow'>('overview');
    const [targetAddress, setTargetAddress] = useState<string>('');

    const startAnalysis = async (addressToAnalyze?: string) => {
        const analysisAddress = addressToAnalyze || publicKey?.toString();
        if (!analysisAddress) return;
        
        setIsAnalyzing(true);
        setProgress(0);
        setLogs([]);
        setAnalysisData(null);
        setTargetAddress(analysisAddress);

        try {
            // Connect to the backend analysis endpoint
            const backendUrl = window.location.origin; // Use same origin as frontend
            const analyzeUrl = `${backendUrl}/analyze/${analysisAddress}`;

            console.log('Attempting to connect to:', analyzeUrl);
            setLogs(prev => [...prev, `Connecting to: ${analyzeUrl}`]);

            // First check if backend is available
            try {
                const healthCheck = await fetch(`${backendUrl}/health`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });

                if (!healthCheck.ok) {
                    throw new Error(`Backend health check failed: ${healthCheck.status}`);
                }

                setLogs(prev => [...prev, 'Backend is healthy, starting analysis...']);
            } catch (healthError) {
                console.error('Backend health check failed:', healthError);
                setLogs(prev => [...prev, `Backend Error: ${healthError.message}`]);
                setLogs(prev => [...prev, 'Note: Backend service is not responding']);
                setIsAnalyzing(false);
                return;
            }

            const eventSource = new EventSource(analyzeUrl);

            eventSource.onopen = function(event) {
                console.log('EventSource connection opened:', event);
                setLogs(prev => [...prev, 'Successfully connected to analysis stream']);
            };

            eventSource.onmessage = function(event) {
                console.log('EventSource message received:', event.data);

                if (event.data === '[DONE]') {
                    eventSource.close();
                    setIsAnalyzing(false);
                    setLogs(prev => [...prev, 'Analysis completed successfully']);
                    return;
                }

                try {
                    const data = JSON.parse(event.data);
                    setProgress(data.progress || 0);

                    if (data.status) {
                        setLogs(prev => [...prev, `Step ${data.step || 0}: ${data.status} (${data.progress || 0}%)`]);
                    }

                    if (data.data || data.analysis_result || data.detailed_data || data.transaction_graph) {
                        setAnalysisData(data.data || data);
                    }

                    if (data.error) {
                        setLogs(prev => [...prev, `Error: ${data.status || 'Unknown error occurred'}`]);
                    }
                } catch (e) {
                    console.error('Error parsing EventSource data:', e, 'Raw data:', event.data);
                    setLogs(prev => [...prev, `Parse Error: ${e.message}`]);
                }
            };

            eventSource.onerror = function(event) {
                console.error('EventSource error:', event);
                console.error('EventSource readyState:', eventSource.readyState);
                console.error('EventSource url:', analyzeUrl);

                const readyStateMap = {
                    0: 'CONNECTING',
                    1: 'OPEN',
                    2: 'CLOSED'
                };

                const stateText = readyStateMap[eventSource.readyState] || 'UNKNOWN';

                setLogs(prev => [...prev, `Connection Error: EventSource state is ${stateText}`]);

                // If connection failed to establish or lost connection
                if (eventSource.readyState === 2) {
                    setLogs(prev => [...prev, 'Analysis stream connection lost']);
                    eventSource.close();
                    setIsAnalyzing(false);
                }
            };

            // Set a timeout to close connection if it takes too long
            const timeout = setTimeout(() => {
                if (eventSource.readyState !== 2) {
                    setLogs(prev => [...prev, 'Analysis timeout - closing connection']);
                    eventSource.close();
                    setIsAnalyzing(false);
                }
            }, 15000); // 15 second timeout (should be enough for 6 steps)

            // Clean up timeout when done
            const originalClose = eventSource.close;
            eventSource.close = function() {
                clearTimeout(timeout);
                originalClose.call(this);
            };
        } catch (error) {
            console.error('Analysis error:', error);
            setIsAnalyzing(false);
        }
    };

    const handleChatAddressAnalyze = (address: string) => {
        setTargetAddress(address);
        setActiveView('overview');
        startAnalysis(address);
    };

    const getRiskColor = (riskScore: number) => {
        if (riskScore < 30) return 'text-green-400';
        if (riskScore < 70) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getRiskBgColor = (riskScore: number) => {
        if (riskScore < 30) return 'bg-green-500/20 border-green-500/30';
        if (riskScore < 70) return 'bg-yellow-500/20 border-yellow-500/30';
        return 'bg-red-500/20 border-red-500/30';
    };

    const getRiskLevel = (riskScore: number) => {
        if (riskScore < 30) return 'LOW';
        if (riskScore < 70) return 'MEDIUM';
        return 'HIGH';
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
                        <span className="text-white/60 font-poppins text-sm">Security Dashboard</span>
                    </div>
                    <WalletMultiButton className="!bg-sentry-sage !text-black !font-poppins !rounded-full hover:!bg-sentry-sage/90" />
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                {/* Navigation Tabs */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-2 mb-8">
                    <div className="flex gap-2 overflow-x-auto">
                        <button
                            onClick={() => setActiveView('overview')}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-poppins transition-colors whitespace-nowrap ${
                                activeView === 'overview' ? 'bg-sentry-accent text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Activity className="w-5 h-5" />
                            Security Analysis
                        </button>
                        <button
                            onClick={() => setActiveView('chat')}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-poppins transition-colors whitespace-nowrap ${
                                activeView === 'chat' ? 'bg-sentry-accent text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <MessageSquare className="w-5 h-5" />
                            AI Address Tracer
                        </button>
                        <button
                            onClick={() => setActiveView('network')}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-poppins transition-colors whitespace-nowrap ${
                                activeView === 'network' ? 'bg-sentry-accent text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Network className="w-5 h-5" />
                            Network Graph
                        </button>
                        <button
                            onClick={() => setActiveView('flow')}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-poppins transition-colors whitespace-nowrap ${
                                activeView === 'flow' ? 'bg-sentry-accent text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <BarChart3 className="w-5 h-5" />
                            Fund Flow
                        </button>
                    </div>
                </div>

                {/* Welcome Section */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-8">
                    <h1 className="text-white font-poppins text-3xl font-bold mb-4">
                        SentrySol Security Dashboard
                    </h1>
                    <p className="text-white/70 font-poppins text-lg mb-6">
                        AI-powered behavioral security analysis for Solana wallets
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-black/20 rounded-2xl p-4">
                            <p className="text-white/60 font-poppins text-sm mb-2">Connected Wallet:</p>
                            <p className="text-white font-mono text-sm break-all">
                                {publicKey?.toString()}
                            </p>
                        </div>
                        {targetAddress && targetAddress !== publicKey?.toString() && (
                            <div className="bg-black/20 rounded-2xl p-4">
                                <p className="text-white/60 font-poppins text-sm mb-2">Analyzing Address:</p>
                                <p className="text-white font-mono text-sm break-all">
                                    {targetAddress}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content based on active view */}
                {activeView === 'overview' && (
                    <div className="space-y-8">
                        {/* Analysis Section */}
                        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-white font-poppins text-2xl font-bold">
                                    Security Analysis
                                </h2>
                                <button
                                    onClick={() => startAnalysis()}
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
                                <div className="space-y-6">
                                    {/* Risk Assessment */}
                                    {analysisData.analysis_result && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className={`${getRiskBgColor(analysisData.analysis_result.risk_score || 0)} border rounded-xl p-6 text-center`}>
                                                <div className="flex items-center justify-center gap-2 mb-2">
                                                    {analysisData.analysis_result.risk_score < 30 ? (
                                                        <CheckCircle className="w-6 h-6 text-green-400" />
                                                    ) : analysisData.analysis_result.risk_score < 70 ? (
                                                        <Clock className="w-6 h-6 text-yellow-400" />
                                                    ) : (
                                                        <AlertTriangle className="w-6 h-6 text-red-400" />
                                                    )}
                                                    <span className="text-white/70 font-poppins text-sm">Risk Level</span>
                                                </div>
                                                <div className={`font-poppins text-2xl font-bold ${getRiskColor(analysisData.analysis_result.risk_score || 0)}`}>
                                                    {getRiskLevel(analysisData.analysis_result.risk_score || 0)}
                                                </div>
                                                <div className="text-white/60 font-poppins text-sm">
                                                    Score: {analysisData.analysis_result.risk_score || 0}/100
                                                </div>
                                            </div>
                                            
                                            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6 text-center">
                                                <div className="flex items-center justify-center gap-2 mb-2">
                                                    <Eye className="w-6 h-6 text-blue-400" />
                                                    <span className="text-blue-300 font-poppins text-sm">Transactions</span>
                                                </div>
                                                <div className="text-white font-poppins text-2xl font-bold">
                                                    {analysisData.analysis_result.transaction_count || 0}
                                                </div>
                                                <div className="text-blue-300 font-poppins text-sm">
                                                    Total found
                                                </div>
                                            </div>
                                            
                                            <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-6 text-center">
                                                <div className="flex items-center justify-center gap-2 mb-2">
                                                    <Shield className="w-6 h-6 text-purple-400" />
                                                    <span className="text-purple-300 font-poppins text-sm">Threat Level</span>
                                                </div>
                                                <div className="text-white font-poppins text-2xl font-bold">
                                                    {analysisData.analysis_result.threat_level || 'UNKNOWN'}
                                                </div>
                                                <div className="text-purple-300 font-poppins text-sm">
                                                    Assessment
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Analysis */}
                                    {analysisData.analysis_result?.ai_analysis && (
                                        <div className="bg-black/20 rounded-2xl p-6">
                                            <h3 className="text-white font-poppins text-xl font-semibold mb-4">AI Security Analysis</h3>
                                            <div className="text-white/80 font-poppins leading-relaxed whitespace-pre-wrap">
                                                {analysisData.analysis_result.ai_analysis}
                                            </div>
                                        </div>
                                    )}

                                    {/* Raw Data */}
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

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                <div className="w-12 h-12 bg-sentry-sage rounded-xl flex items-center justify-center mb-4">
                                    <Shield className="w-6 h-6 text-black" />
                                </div>
                                <h3 className="text-white font-poppins text-lg font-semibold mb-2">Real-time Protection</h3>
                                <p className="text-white/70 font-poppins text-sm">
                                    Continuous monitoring of wallet activity for suspicious behavior patterns
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                <div className="w-12 h-12 bg-sentry-accent rounded-xl flex items-center justify-center mb-4">
                                    <MessageSquare className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-white font-poppins text-lg font-semibold mb-2">AI Address Tracer</h3>
                                <p className="text-white/70 font-poppins text-sm">
                                    Chat with AI to trace and analyze any Solana wallet address
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                <div className="w-12 h-12 bg-sentry-blue-gray rounded-xl flex items-center justify-center mb-4">
                                    <Network className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-white font-poppins text-lg font-semibold mb-2">Network Analysis</h3>
                                <p className="text-white/70 font-poppins text-sm">
                                    Visualize transaction networks and fund flows with interactive graphs
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'chat' && (
                    <ChatBox 
                        onAddressAnalyze={handleChatAddressAnalyze}
                        isAnalyzing={isAnalyzing}
                    />
                )}

                {activeView === 'network' && (
                    <div className="space-y-6">
                        {analysisData?.transaction_graph ? (
                            <NetworkGraph 
                                graphData={analysisData.transaction_graph}
                                height="600px"
                            />
                        ) : (
                            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
                                <Network className="w-16 h-16 text-white/40 mx-auto mb-4" />
                                <h3 className="text-white font-poppins text-xl font-semibold mb-2">
                                    No Network Data Available
                                </h3>
                                <p className="text-white/60 font-poppins">
                                    Run a security analysis first to generate the transaction network graph
                                </p>
                                <button
                                    onClick={() => {
                                        setActiveView('overview');
                                        startAnalysis();
                                    }}
                                    className="mt-4 bg-sentry-accent text-white px-6 py-3 rounded-full font-poppins hover:bg-sentry-accent/80 transition-colors"
                                >
                                    Start Analysis
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'flow' && (
                    <TransactionFlow 
                        walletAddress={targetAddress || publicKey?.toString() || ''}
                        isVisible={true}
                    />
                )}
            </div>
        </div>
    );
}
