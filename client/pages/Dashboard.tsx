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
    const [analysisTimeout, setAnalysisTimeout] = useState<NodeJS.Timeout | null>(null);
    const [connectionTimeout, setConnectionTimeout] = useState<NodeJS.Timeout | null>(null);
    const [analysisStartTime, setAnalysisStartTime] = useState<number>(0);

    const stopAnalysis = () => {
        setLogs(prev => [...prev, '🛑 Analysis stopped by user']);
        setIsAnalyzing(false);
        setProgress(0);
        
        // Clear all timeouts
        if (analysisTimeout) {
            clearTimeout(analysisTimeout);
            setAnalysisTimeout(null);
        }
        if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            setConnectionTimeout(null);
        }
    };

    const startAnalysis = async (addressToAnalyze?: string) => {
        const analysisAddress = addressToAnalyze || publicKey?.toString();
        if (!analysisAddress) return;
        
        const startTime = Date.now();
        setAnalysisStartTime(startTime);

        setIsAnalyzing(true);
        setProgress(0);
        setLogs([]);
        setAnalysisData(null);
        setTargetAddress(analysisAddress);

        // Set overall analysis timeout (10 minutes)
        const overallTimeout = setTimeout(() => {
            setLogs(prev => [...prev, 'Analysis timeout reached (10 minutes) - stopping analysis']);
            setIsAnalyzing(false);
        }, 10 * 60 * 1000);
        setAnalysisTimeout(overallTimeout);

        try {
            // Connect to the Python backend analysis endpoint
            const backendUrl = import.meta.env.DEV ? 'https://sentrysol-beta-production.up.railway.app' : window.location.origin;
            const analyzeUrl = `${backendUrl}/analyze/${analysisAddress}`;

            setLogs(prev => [...prev, `Connecting to SentrySol-Core`]);

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
                if (analysisTimeout) clearTimeout(analysisTimeout);
                return;
            }

            let eventSource: EventSource;
            let lastActivityTime = Date.now();
            let keepAliveInterval: NodeJS.Timeout;
            let connectionCheckInterval: NodeJS.Timeout;
            let isManuallyStoped = false;

            const connectToStream = () => {
                if (eventSource && eventSource.readyState !== 2) {
                    eventSource.close();
                }

                eventSource = new EventSource(analyzeUrl);
                lastActivityTime = Date.now();

                // Enhanced keep alive checker with connection timeout
                keepAliveInterval = setInterval(() => {
                    if (eventSource.readyState === 1) {
                        const timeSinceActivity = Date.now() - lastActivityTime;
                        // FIX: Use startTime instead of analysisStartTime
                        const totalAnalysisTime = Date.now() - startTime;
                        
                        if (timeSinceActivity > 120000) {
                            setLogs(prev => [...prev, 'Connection timeout - no activity for 2 minutes']);
                            setLogs(prev => [...prev, '❌ Closing connection due to timeout']);
                            cleanup();
                            setIsAnalyzing(false);
                            return;
                        } else if (timeSinceActivity > 60000) {
                            const remainingTime = Math.ceil((120000 - timeSinceActivity) / 1000);
                            setLogs(prev => [...prev, `No activity for ${Math.floor(timeSinceActivity/1000)}s (timeout in ${remainingTime}s)`]);
                        }

                        // FIX: Use startTime for total analysis time
                        if (totalAnalysisTime > 120000 && Math.floor(totalAnalysisTime / 120000) !== Math.floor((totalAnalysisTime - 30000) / 120000)) {
                            const minutes = Math.floor(totalAnalysisTime / 60000);
                            const seconds = Math.floor((totalAnalysisTime % 60000) / 1000);
                            const ms = totalAnalysisTime % 1000;
                            setLogs(prev => [...prev, `Analysis running for ${minutes}m ${seconds}s ${ms}ms...`]);
                        }

                    }
                }, 30000);
                console.log('analysisStartTime:', analysisStartTime);
                // Connection health checker with timeout handling
                connectionCheckInterval = setInterval(() => {
                    if (eventSource.readyState === 2 && !isManuallyStoped) {
                        // FIX: Use startTime instead of analysisStartTime
                        const timeSinceStart = Date.now() - startTime;
                        
                        if (timeSinceStart > 8 * 60 * 1000) {
                            setLogs(prev => [...prev, 'Maximum analysis time reached - not reconnecting']);
                            cleanup();
                            setIsAnalyzing(false);
                            return;
                        }
                        
                        setLogs(prev => [...prev, '🔄 Connection lost, attempting reconnect...']);
                        clearInterval(keepAliveInterval);
                        clearInterval(connectionCheckInterval);
                        
                        // Exponential backoff for reconnection
                        const reconnectDelay = Math.min(5000, 1000 + Math.random() * 2000);
                        setTimeout(() => {
                            if (!isManuallyStoped) {
                                connectToStream();
                            }
                        }, reconnectDelay);
                    }
                }, 5000); // Check every 5 seconds

                eventSource.onopen = function(event) {
                    console.log('EventSource connection opened:', event);
                    setLogs(prev => [...prev, '✅ Successfully connected to analysis stream']);
                    lastActivityTime = Date.now();
                };

                eventSource.onmessage = function(event) {
                    lastActivityTime = Date.now(); // Reset activity timer
                    console.log('EventSource message received:', event.data);

                    // Handle completion
                    if (event.data === '[DONE]') {
                        const totalTime = Date.now() - startTime; // Hapus pembagian 1000
                        setLogs(prev => [...prev, `Analysis completed successfully in ${totalTime}ms!`]);
                        cleanup();
                        setIsAnalyzing(false);
                        setProgress(100);
                        return;
                    }

                    // Handle keepalive messages
                    if (event.data === 'keepalive' || event.data === 'ping' || event.data.includes('heartbeat')) {
                        setLogs(prev => [...prev, 'Heartbeat received - connection active']);
                        return;
                    }

                    // Handle empty messages
                    if (!event.data || event.data.trim() === '') {
                        return;
                    }

                    try {
                        const data = JSON.parse(event.data);
                        
                        // Update progress
                        if (data.progress !== undefined) {
                            setProgress(data.progress);
                        }

                        // Update status dan logs
                        if (data.status) {
                            const stepInfo = data.step ? `Step ${data.step}: ` : '';
                            const progressInfo = data.progress !== undefined ? ` (${data.progress}%)` : '';
                            const elapsedMs = Date.now() - startTime; // Hapus pembagian 1000
                            const timeInfo = ` [${elapsedMs}ms]`;
                            setLogs(prev => [...prev, `${stepInfo}${data.status}${progressInfo}${timeInfo}`]);
                            
                            // Special message for AI analysis
                            if (data.step === 7 || data.progress >= 95) {
                                setLogs(prev => [...prev, 'AI analysis is running - this process takes time...']);
                            }
                        }

                        // Handle analysis result data
                        if (data.data || data.analysis_result || data.detailed_data || data.transaction_graph || data.threat_analysis) {
                            const finalData = data.data || data;
                            console.log('Setting analysis data:', finalData);
                            setAnalysisData(finalData);
                            
                            if (finalData.analysis_result || finalData.detailed_data) {
                                setLogs(prev => [...prev, 'Analysis data received, processing results...']);
                            }
                        }

                        // Handle error but don't disconnect
                        if (data.error) {
                            setLogs(prev => [...prev, `⚠️ Warning: ${data.error}`]);
                            // Don't disconnect unless critical error
                            if (data.critical === true) {
                                setLogs(prev => [...prev, '❌ Critical error detected, stopping analysis']);
                                cleanup();
                                setIsAnalyzing(false);
                            } else {
                                setLogs(prev => [...prev, 'Non-critical error, continuing analysis...']);
                            }
                        }

                    } catch (parseError) {
                        console.error('Error parsing EventSource data:', parseError, 'Raw data:', event.data);
                        setLogs(prev => [...prev, `⚠️ Parse error: ${parseError.message}`]);
                        
                        // Try to extract data from corrupted response
                        if (event.data.includes('"analysis_result"') || event.data.includes('"detailed_data"')) {
                            try {
                                const jsonMatch = event.data.match(/\{[\s\S]*\}/);
                                if (jsonMatch) {
                                    const extractedData = JSON.parse(jsonMatch[0]);
                                    setAnalysisData(extractedData);
                                    setLogs(prev => [...prev, '✅ Successfully extracted data from corrupted response']);
                                }
                            } catch (extractError) {
                                console.error('Failed to extract JSON:', extractError);
                            }
                        }
                        
                        // Don't disconnect due to parse error
                        setLogs(prev => [...prev, '🔄 Continuing streaming despite parse error...']);
                    }
                };
                
                eventSource.onerror = function(event) {
                    console.error('EventSource error:', event);
                    
                    const readyState = eventSource.readyState;
                    const stateNames = ['CONNECTING', 'OPEN', 'CLOSED'];
                    const stateName = stateNames[readyState] || 'UNKNOWN';
                    
                    setLogs(prev => [...prev, `🔗 Connection state: ${stateName} (${readyState})`]);

                    // Only log error, don't disconnect immediately
                    if (readyState === 0) { // CONNECTING
                        setLogs(prev => [...prev, '🔄 Attempting to connect...']);
                    } else if (readyState === 1) { // OPEN
                        setLogs(prev => [...prev, '✅ Connection still active, waiting for data...']);
                    } else if (readyState === 2) { // CLOSED
                        setLogs(prev => [...prev, '❌ Connection closed']);
                        // Reconnection will be handled by connectionCheckInterval
                    }
                };
            };

            const cleanup = () => {
                isManuallyStoped = true;
                if (keepAliveInterval) clearInterval(keepAliveInterval);
                if (connectionCheckInterval) clearInterval(connectionCheckInterval);
                if (analysisTimeout) {
                    clearTimeout(analysisTimeout);
                    setAnalysisTimeout(null);
                }
                if (connectionTimeout) {
                    clearTimeout(connectionTimeout);
                    setConnectionTimeout(null);
                }
                if (eventSource && eventSource.readyState !== 2) {
                    eventSource.close();
                }
            };

            // Mulai koneksi pertama
            connectToStream();

            // Cleanup function untuk komponen unmount
            const handleBeforeUnload = () => {
                cleanup();
            };

            window.addEventListener('beforeunload', handleBeforeUnload);

            // Return cleanup function
            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
                cleanup();
            };

        } catch (error) {
            console.error('Analysis error:', error);
            setLogs(prev => [...prev, `❌ Error: ${error.message}`]);
            setIsAnalyzing(false);
            if (analysisTimeout) clearTimeout(analysisTimeout);
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

    const parseAnalysisResult = (rawResult: any) => {
        try {
            if (typeof rawResult === 'string') {
                let cleanResult = rawResult;
                if (rawResult.startsWith('```json\n')) {
                    cleanResult = rawResult.replace(/^```json\n/, '').replace(/\n```$/, '');
                } else if (rawResult.startsWith('```\n')) {
                    cleanResult = rawResult.replace(/^```\n/, '').replace(/\n```$/, '');
                }
                return JSON.parse(cleanResult);
            } else {
                return rawResult;
            }
        } catch (e) {
            console.error('Failed to parse analysis result:', e);
            return null;
        }
    };

    const formatThreatAnalysis = (threatData: any) => {
        if (!threatData || !threatData.threat_analysis) return null;
        
        const analysis = threatData.threat_analysis;
        return {
            overallRiskLevel: analysis.overall_risk_level,
            riskScore: analysis.risk_score,
            metadata: analysis.metadata,
            potentialThreats: analysis.potential_threats || [],
            ioc: analysis.ioc
        };
    };

    const [displayElapsedTime, setDisplayElapsedTime] = useState(0);
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAnalyzing && analysisStartTime > 0) {
            interval = setInterval(() => {
                setDisplayElapsedTime(Date.now() - analysisStartTime); // Hapus pembagian 1000
            }, 100); // Update setiap 100ms untuk real-time
        } else {
            setDisplayElapsedTime(0);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isAnalyzing, analysisStartTime]);

    const getThreatCardBorderColor = (confidence: string) => {
        switch (confidence?.toLowerCase()) {
            case 'high':
                return 'border-l-red-500';
            case 'medium':
                return 'border-l-yellow-500';
            case 'low':
                return 'border-l-blue-500';
            default:
                return 'border-l-gray-500';
        }
    };

    const getConfidenceBadgeColor = (confidence: string) => {
        switch (confidence?.toLowerCase()) {
            case 'high':
                return 'bg-red-500/20 text-red-300';
            case 'medium':
                return 'bg-yellow-500/20 text-yellow-300';
            case 'low':
                return 'bg-blue-500/20 text-blue-300';
            default:
                return 'bg-gray-500/20 text-gray-300';
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
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => startAnalysis()}
                                        disabled={isAnalyzing}
                                        className="bg-sentry-sage text-black font-poppins text-lg font-normal px-6 py-3 rounded-full hover:bg-sentry-sage/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
                                    </button>
                                    {isAnalyzing && (
                                        <button
                                            onClick={stopAnalysis}
                                            className="bg-red-500 text-white font-poppins text-lg font-normal px-6 py-3 rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            Stop
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar with elapsed time */}
                            {isAnalyzing && (
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-white/70 font-poppins">Analysis Progress</span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-white/60 font-poppins text-sm">
                                              {displayElapsedTime}ms elapsed
                                            </span>
                                            <span className="text-white font-poppins">{progress}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-black/20 rounded-full h-3">
                                        <div 
                                            className="bg-gradient-to-r from-sentry-sage to-sentry-accent h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="mt-2 text-center">
                                        <span className="text-white/50 font-poppins text-xs">
                                            Maximum analysis time: 10 minutes | Connection timeout: 2 minutes of inactivity
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Enhanced Logs with scroll to bottom */}
                            {logs.length > 0 && (
                                <div className="bg-black/20 rounded-2xl p-4 mb-6 max-h-60 overflow-y-auto" ref={(el) => el?.scrollTo(0, el.scrollHeight)}>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-white font-poppins text-lg font-semibold">Analysis Logs</h3>
                                        <button
                                            onClick={() => setLogs([])}
                                            className="text-white/60 hover:text-white text-sm font-poppins"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    {logs.map((log, index) => (
                                        <div key={index} className="text-white/70 font-mono text-sm mb-2 p-2 bg-black/20 rounded">
                                            <span className="text-white/50 mr-2">{new Date().toLocaleTimeString()}</span>
                                            {log}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Analysis Results */}
                            {analysisData && (
                                <div className="space-y-6">
                                    {(() => {
                                        // Parse threat analysis
                                        let threatAnalysis = null;
                                        let parsedAnalysis = null;
                                        
                                        if (analysisData.analysis_result) {
                                            parsedAnalysis = parseAnalysisResult(analysisData.analysis_result);
                                            if (parsedAnalysis && parsedAnalysis.threat_analysis) {
                                                threatAnalysis = formatThreatAnalysis(parsedAnalysis);
                                            }
                                        }

                                        return (
                                            <>
                                                {/* Threat Analysis Section */}
                                                {threatAnalysis && (
                                                    <div className="space-y-6">
                                                        {/* Overall Risk Level */}
                                                        <div className={`${getRiskBgColor(threatAnalysis.riskScore)} border rounded-xl p-6 text-center`}>
                                                            <div className="flex items-center justify-center gap-3 mb-2">
                                                                {threatAnalysis.riskScore < 30 ? (
                                                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                                                ) : threatAnalysis.riskScore < 70 ? (
                                                                    <Clock className="w-8 h-8 text-yellow-400" />
                                                                ) : (
                                                                    <AlertTriangle className="w-8 h-8 text-red-400" />
                                                                )}
                                                                <span className="text-white font-poppins text-lg">Overall Risk Level</span>
                                                            </div>
                                                            <div className={`font-poppins text-3xl font-bold ${getRiskColor(threatAnalysis.riskScore)} mb-2`}>
                                                                {threatAnalysis.overallRiskLevel}
                                                            </div>
                                                            <div className="text-white/60 font-poppins">
                                                                Score: {threatAnalysis.riskScore}/100
                                                            </div>
                                                        </div>

                                                        {/* Metadata Grid */}
                                                        {threatAnalysis.metadata && (
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                                                    <div className="flex items-center justify-center gap-2 mb-2">
                                                                        <Eye className="w-5 h-5 text-blue-400" />
                                                                        <span className="text-white/70 font-poppins text-sm">Target Address</span>
                                                                    </div>
                                                                    <div className="text-white font-mono text-sm">
                                                                        {threatAnalysis.metadata.target_address ? 
                                                                            `${threatAnalysis.metadata.target_address.substring(0, 8)}...${threatAnalysis.metadata.target_address.substring(threatAnalysis.metadata.target_address.length - 8)}` : 
                                                                            'N/A'
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                                                    <div className="flex items-center justify-center gap-2 mb-2">
                                                                        <Network className="w-5 h-5 text-purple-400" />
                                                                        <span className="text-white/70 font-poppins text-sm">Chain</span>
                                                                    </div>
                                                                    <div className="text-white font-poppins text-lg font-bold">
                                                                        {threatAnalysis.metadata.chain || 'Solana'}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-white/5 rounded-xl p-4 text-center">
                                                                    <div className="flex items-center justify-center gap-2 mb-2">
                                                                        <Shield className="w-5 h-5 text-green-400" />
                                                                        <span className="text-white/70 font-poppins text-sm">Data Sources</span>
                                                                    </div>
                                                                    <div className="text-white font-poppins text-lg font-bold">
                                                                        {threatAnalysis.metadata.data_sources?.length || 0}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Potential Threats */}
                                                        {threatAnalysis.potentialThreats && threatAnalysis.potentialThreats.length > 0 && (
                                                            <div className="space-y-6">
                                                                <h3 className="text-white font-poppins text-2xl font-semibold flex items-center gap-2">
                                                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                                                    Identified Threats
                                                                </h3>
                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                    {threatAnalysis.potentialThreats.map((threat: any, index: number) => (
                                                                        <div key={index} className={`bg-black/20 border-l-4 ${getThreatCardBorderColor(threat.confidence)} rounded-xl p-6`}>
                                                                            <div className="flex justify-between items-center mb-4">
                                                                                <h4 className="text-white font-poppins text-lg font-semibold">
                                                                                    {threat.threat_type}
                                                                                </h4>
                                                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceBadgeColor(threat.confidence)}`}>
                                                                                    {threat.confidence}
                                                                                </span>
                                                                            </div>
                                                                            
                                                                            <p className="text-white/80 font-poppins mb-4 leading-relaxed">
                                                                                {threat.reason}
                                                                            </p>

                                                                            {/* Supporting Evidence */}
                                                                            {threat.supporting_evidence && (
                                                                                <div className="bg-white/5 rounded-lg p-4 mb-4">
                                                                                    <h5 className="text-white/70 font-poppins text-sm font-semibold mb-3 flex items-center gap-2">
                                                                                        <Eye className="w-4 h-4" />
                                                                                        Supporting Evidence
                                                                                    </h5>
                                                                                    {Object.entries(threat.supporting_evidence).map(([key, value]) => (
                                                                                        <div key={key} className="text-white/70 font-poppins text-sm mb-2 pb-2 border-b border-white/10 last:border-b-0">
                                                                                            <strong className="text-white">{key.replace(/_/g, ' ').toUpperCase()}:</strong> {String(value)}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}

                                                                            {/* Recommended Actions */}
                                                                            {threat.recommended_actions && threat.recommended_actions.length > 0 && (
                                                                                <div className="bg-white/5 rounded-lg p-4">
                                                                                    <h5 className="text-white/70 font-poppins text-sm font-semibold mb-3 flex items-center gap-2">
                                                                                        <CheckCircle className="w-4 h-4" />
                                                                                        Recommended Actions
                                                                                    </h5>
                                                                                    {threat.recommended_actions.map((action: string, actionIndex: number) => (
                                                                                        <div key={actionIndex} className="text-white/70 font-poppins text-sm mb-2 pb-2 border-b border-white/10 last:border-b-0">
                                                                                            {action}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* IOC (Indicators of Compromise) */}
                                                        {threatAnalysis.ioc && (
                                                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
                                                                <h3 className="text-yellow-400 font-poppins text-2xl font-semibold mb-6 flex items-center gap-2">
                                                                    <AlertTriangle className="w-6 h-6" />
                                                                    Indicators of Compromise
                                                                </h3>
                                                                
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                                    {threatAnalysis.ioc.addresses && threatAnalysis.ioc.addresses.length > 0 && (
                                                                        <div className="bg-black/20 rounded-xl p-4">
                                                                            <h4 className="text-white font-poppins font-semibold mb-3 flex items-center gap-2">
                                                                                <Eye className="w-4 h-4 text-blue-400" />
                                                                                Addresses
                                                                            </h4>
                                                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                                                {threatAnalysis.ioc.addresses.map((addr: string, index: number) => (
                                                                                    <div key={index} className="bg-white/5 rounded p-2 font-mono text-xs text-white/80 break-all">
                                                                                        {addr.substring(0, 6)}...{addr.substring(addr.length - 4)}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {threatAnalysis.ioc.transaction_signatures && threatAnalysis.ioc.transaction_signatures.length > 0 && (
                                                                        <div className="bg-black/20 rounded-xl p-4">
                                                                            <h4 className="text-white font-poppins font-semibold mb-3 flex items-center gap-2">
                                                                                <Activity className="w-4 h-4 text-green-400" />
                                                                                Transaction Signatures
                                                                            </h4>
                                                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                                                {threatAnalysis.ioc.transaction_signatures.map((sig: string, index: number) => (
                                                                                    <div key={index} className="bg-white/5 rounded p-2 font-mono text-xs text-white/80 break-all">
                                                                                        {sig.substring(0, 8)}...{sig.substring(sig.length - 8)}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {threatAnalysis.ioc.suspicious_mints && threatAnalysis.ioc.suspicious_mints.length > 0 && (
                                                                        <div className="bg-black/20 rounded-xl p-4">
                                                                            <h4 className="text-white font-poppins font-semibold mb-3 flex items-center gap-2">
                                                                                <TrendingUp className="w-4 h-4 text-yellow-400" />
                                                                                Suspicious Mints
                                                                            </h4>
                                                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                                                {threatAnalysis.ioc.suspicious_mints.map((mint: string, index: number) => (
                                                                                    <div key={index} className="bg-white/5 rounded p-2 font-mono text-xs text-white/80 break-all">
                                                                                        {mint.substring(0, 8)}...{mint.substring(mint.length - 8)}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {threatAnalysis.ioc.related_programs && threatAnalysis.ioc.related_programs.length > 0 && (
                                                                        <div className="bg-black/20 rounded-xl p-4">
                                                                            <h4 className="text-white font-poppins font-semibold mb-3 flex items-center gap-2">
                                                                                <Shield className="w-4 h-4 text-purple-400" />
                                                                                Related Programs
                                                                            </h4>
                                                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                                                {threatAnalysis.ioc.related_programs.map((program: string, index: number) => (
                                                                                    <div key={index} className="bg-white/5 rounded p-2 font-mono text-xs text-white/80 break-all">
                                                                                        {program.substring(0, 8)}...{program.substring(program.length - 8)}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Detailed Data Analysis */}
                                                {analysisData.detailed_data && (
                                                    <div className="space-y-6">
                                                        {/* Wallet Information */}
                                                        {analysisData.detailed_data.wallet_info && (
                                                            <div className="bg-black/20 rounded-2xl p-6">
                                                                <h3 className="text-white font-poppins text-xl font-semibold mb-4 flex items-center gap-2">
                                                                    <Eye className="w-5 h-5 text-blue-400" />
                                                                    Wallet Information
                                                                </h3>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="bg-white/5 rounded-xl p-4">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                                            <span className="text-white/70 font-poppins text-sm">Address</span>
                                                                        </div>
                                                                        <div className="text-white font-mono text-sm">
                                                                            {analysisData.detailed_data.wallet_info.address ? 
                                                                                `${analysisData.detailed_data.wallet_info.address.substring(0, 8)}...${analysisData.detailed_data.wallet_info.address.substring(analysisData.detailed_data.wallet_info.address.length - 8)}` : 
                                                                                'N/A'
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-white/5 rounded-xl p-4">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                                            <span className="text-white/70 font-poppins text-sm">Address Name</span>
                                                                        </div>
                                                                        <div className="text-white font-poppins">
                                                                            {analysisData.detailed_data.wallet_info.owner ? 
                                                                                `${analysisData.detailed_data.wallet_info.owner.substring(0, 8)}...${analysisData.detailed_data.wallet_info.owner.substring(analysisData.detailed_data.wallet_info.owner.length - 8)}` : 
                                                                                'Unknown'
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-white/5 rounded-xl p-4">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                                                            <span className="text-white/70 font-poppins text-sm">Risk Score</span>
                                                                        </div>
                                                                        <div className="text-white font-poppins text-xl font-bold">
                                                                            {threatAnalysis?.riskScore || analysisData.analysis_result?.risk_score || 0}/100
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Transaction Summary */}
                                                        {analysisData.detailed_data.transaction_summary && (
                                                            <div className="bg-black/20 rounded-2xl p-6">
                                                                <h3 className="text-white font-poppins text-xl font-semibold mb-4 flex items-center gap-2">
                                                                    <Activity className="w-5 h-5 text-green-400" />
                                                                    Transaction Summary
                                                                </h3>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div className="bg-white/5 rounded-xl p-4 text-center">
                                                                        <div className="text-2xl font-bold text-white mb-2">
                                                                            {analysisData.detailed_data.transaction_summary.total_transactions || 0}
                                                                        </div>
                                                                        <div className="text-white/70 font-poppins text-sm">Total Transactions</div>
                                                                    </div>
                                                                    <div className="bg-white/5 rounded-xl p-4 text-center">
                                                                        <div className="text-2xl font-bold text-white mb-2">
                                                                            {analysisData.detailed_data.transaction_summary.recent_signatures || 0}
                                                                        </div>
                                                                        <div className="text-white/70 font-poppins text-sm">Recent Signatures</div>
                                                                    </div>
                                                                    <div className="bg-white/5 rounded-xl p-4 text-center">
                                                                        <div className="text-2xl font-bold text-white mb-2">
                                                                            {analysisData.detailed_data.transaction_summary.balance_changes || 0}
                                                                        </div>
                                                                        <div className="text-white/70 font-poppins text-sm">Balance Changes</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Token & NFT Analysis */}
                                                        {analysisData.detailed_data.token_analysis && (
                                                            <div className="bg-black/20 rounded-2xl p-6">
                                                                <h3 className="text-white font-poppins text-xl font-semibold mb-4 flex items-center gap-2">
                                                                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                                                                    Token & NFT Analysis
                                                                </h3>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                                    <div className="bg-white/5 rounded-xl p-4 text-center">
                                                                        <div className="text-2xl font-bold text-white mb-2">
                                                                            {analysisData.detailed_data.token_analysis.tokens_found || 0}
                                                                        </div>
                                                                        <div className="text-white/70 font-poppins text-sm">Tokens Found</div>
                                                                    </div>
                                                                    <div className="bg-white/5 rounded-xl p-4 text-center">
                                                                        <div className="text-2xl font-bold text-white mb-2">
                                                                            {analysisData.detailed_data.token_analysis.nfts_found || 0}
                                                                        </div>
                                                                        <div className="text-white/70 font-poppins text-sm">NFTs Found</div>
                                                                    </div>
                                                                </div>

                                                                {/* NFT Display */}
                                                                {analysisData.detailed_data.token_analysis.nft_metadata && analysisData.detailed_data.token_analysis.nft_metadata.length > 0 && (
                                                                    <div>
                                                                        <h4 className="text-white font-poppins text-lg font-semibold mb-3 flex items-center gap-2">
                                                                            <Eye className="w-5 h-5 text-purple-400" />
                                                                            Recent NFTs
                                                                        </h4>
                                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                            {analysisData.detailed_data.token_analysis.nft_metadata.slice(0, 8).map((nft: any, index: number) => (
                                                                                <div key={index} className="bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:border-sentry-accent/50 transition-colors">
                                                                                    <div className="w-full h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-3 flex items-center justify-center">
                                                                                        <Eye className="w-8 h-8 text-white/50" />
                                                                                    </div>
                                                                                    <div className="text-white font-poppins text-sm font-semibold mb-1 truncate">
                                                                                        {nft.name || 'Unknown NFT'}
                                                                                    </div>
                                                                                    <div className="text-white/60 font-poppins text-xs truncate">
                                                                                        {nft.symbol || ''}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* AI Analysis Text (fallback) */}
                                                {!threatAnalysis && (analysisData.analysis_result?.ai_analysis || 
                                                  analysisData.ai_analysis ||
                                                  (typeof analysisData.analysis_result === 'string' && analysisData.analysis_result.length > 0)) && (
                                                    <div className="bg-black/20 rounded-2xl p-6">
                                                        <h3 className="text-white font-poppins text-xl font-semibold mb-4 flex items-center gap-2">
                                                            <MessageSquare className="w-5 h-5 text-sentry-accent" />
                                                            AI Security Analysis
                                                        </h3>
                                                        <div className="text-white/80 font-poppins leading-relaxed whitespace-pre-wrap">
                                                            {analysisData.analysis_result?.ai_analysis || 
                                                             analysisData.ai_analysis ||
                                                             (typeof analysisData.analysis_result === 'string' ? analysisData.analysis_result : 'No AI analysis available')}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Debug Data (development only) */}
                                                {process.env.NODE_ENV === 'development' && (
                                                    <details className="bg-black/20 rounded-xl p-4">
                                                        <summary className="text-white font-poppins cursor-pointer flex justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <Eye /> View Raw Analysis Data
                                                            </div>
                                                            <div className="flex items-center">
                                                                <svg 
                                                                    className="w-4 h-4 transform transition-transform duration-200" 
                                                                    fill="none" 
                                                                    stroke="currentColor" 
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </div>
                                                        </summary>
                                                        <pre className="text-white/70 font-mono text-xs overflow-auto max-h-60 mt-2 bg-black/30 rounded p-4">
                                                            {JSON.stringify(analysisData, null, 2)}
                                                        </pre>
                                                    </details>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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
