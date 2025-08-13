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

    setIsAnalyzing(true);
    setProgress(0);
    setLogs([]);
    setAnalysisData(null);
    setTargetAddress(analysisAddress);
    setAnalysisStartTime(Date.now());

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
            const totalAnalysisTime = Date.now() - analysisStartTime;

            if (timeSinceActivity > 120000) {
              setLogs(prev => [...prev, 'Connection timeout - no activity for 2 minutes']);
              setLogs(prev => [...prev, '❌ Closing connection due to timeout']);
              cleanup();
              setIsAnalyzing(false);
              return;
            } else if (timeSinceActivity > 60000) {
              const remainingTime = Math.ceil((120000 - timeSinceActivity) / 1000);
              setLogs(prev => [...prev, `No activity for ${Math.floor(timeSinceActivity / 1000)}s (timeout in ${remainingTime}s)`]);
            }

            // FIX: Show total analysis time every minute - PERBAIKI BAGIAN INI
            if (totalAnalysisTime > 120000 && Math.floor(totalAnalysisTime / 120000) !== Math.floor((totalAnalysisTime - 30000) / 120000)) {
              const minutes = Math.floor(totalAnalysisTime / 60000);
              const seconds = Math.floor((totalAnalysisTime % 60000) / 1000);
              setLogs(prev => [...prev, `Analysis running for ${minutes}m ${seconds}s...`]);
            }
          }
        }, 30000);
        console.log('analysisStartTime:', analysisStartTime);
        // Connection health checker with timeout handling
        connectionCheckInterval = setInterval(() => {
          if (eventSource.readyState === 2 && !isManuallyStoped) { // Connection closed
            const timeSinceStart = Date.now() - analysisStartTime;

            if (timeSinceStart > 8 * 60 * 1000) { // Don't reconnect after 8 minutes
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

        eventSource.onopen = function (event) {
          console.log('EventSource connection opened:', event);
          setLogs(prev => [...prev, '✅ Successfully connected to analysis stream']);
          lastActivityTime = Date.now();
        };

        eventSource.onmessage = function (event) {
          lastActivityTime = Date.now(); // Reset activity timer
          console.log('EventSource message received:', event.data);

          // Handle completion
          if (event.data === '[DONE]') {
            const totalTime = Math.floor((Date.now() - analysisStartTime) / 1000);
            setLogs(prev => [...prev, `Analysis completed successfully in ${totalTime}s!`]);
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
              const elapsedSeconds = Math.floor((Date.now() - analysisStartTime) / 1000);
              const timeInfo = ` [${elapsedSeconds}s]`;
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

        eventSource.onerror = function (event) {
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
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-poppins transition-colors whitespace-nowrap ${activeView === 'overview' ? 'bg-sentry-accent text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
            >
              <Activity className="w-5 h-5" />
              Security Analysis
            </button>
            <button
              onClick={() => setActiveView('chat')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-poppins transition-colors whitespace-nowrap ${activeView === 'chat' ? 'bg-sentry-accent text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
            >
              <MessageSquare className="w-5 h-5" />
              AI Address Tracer
            </button>
            <button
              onClick={() => setActiveView('network')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-poppins transition-colors whitespace-nowrap ${activeView === 'network' ? 'bg-sentry-accent text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
            >
              <Network className="w-5 h-5" />
              Network Graph
            </button>
            <button
              onClick={() => setActiveView('flow')}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-poppins transition-colors whitespace-nowrap ${activeView === 'flow' ? 'bg-sentry-accent text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
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
