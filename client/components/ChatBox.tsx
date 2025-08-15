import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, Search, AlertTriangle, CheckCircle, Activity, Shield, TrendingUp, Eye, Network, BarChart3, MessageSquare, Clock } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  analysis?: {
    address?: string;
    risk_score?: number;
    recent_transactions?: number;
  };
  isStreaming?: boolean;
  analysisData?: any;
}

interface ChatBoxProps {
  onAddressAnalyze: (address: string) => void;
  isAnalyzing: boolean;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ onAddressAnalyze, isAnalyzing }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m SentrySol AI. I can help you trace and analyze Solana wallet addresses. Just paste an address or ask me questions about wallet security.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, analysisLogs]);

  // Function to handle streaming chat with Mistral
  const streamChatWithMistral = async (message: string, messageId: string) => {
    try {
      const backendUrl = import.meta.env.DEV ? 'https://sentrysol-beta-production.up.railway.app' : window.location.origin;

      const response = await fetch(`${backendUrl}/chat-sentrysol-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          system_prompt: `You are SentrySol AI, a security assistant for Solana blockchain analysis. 

IMPORTANT INSTRUCTIONS:
1. If the user message contains a Solana or Ethereum address (32-44 characters, base58 for Solana, 42 characters starting with 0x for Ethereum), respond with JSON format: {"type": "address_detected", "address": "the_address", "response": "your_message_about_starting_analysis"}

2. For regular conversations about blockchain security, wallets, or general questions, respond with normal string

3. Always be helpful, professional, and focus on blockchain security topics.

4. Keep responses concise but informative.`,
          temperature: 0.7,
          max_tokens: 2000
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`Chat API failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      let buffer = '';
      let streamingContent = '';
      let detectedAddress: string | null = null;
      let isStreamComplete = false;

      // Update message to show streaming
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, content: '🤖 Thinking...', isStreaming: true }
          : msg
      ));

      while (!isStreamComplete) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = new TextDecoder().decode(value);
        buffer += chunk;

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              isStreamComplete = true;
              break;
            }

            try {
              const jsonData = JSON.parse(data);

              // Handle status messages
              if (jsonData.status) {
                setMessages(prev => prev.map(msg =>
                  msg.id === messageId
                    ? { ...msg, content: `🤖 ${jsonData.message || jsonData.status}`, isStreaming: true }
                    : msg
                ));
                continue;
              }

              // Handle content streaming
              if (jsonData.type === 'content' && jsonData.content !== undefined) {
                streamingContent += jsonData.content;

                // Update streaming message with accumulated content
                setMessages(prev => prev.map(msg =>
                  msg.id === messageId
                    ? { ...msg, content: streamingContent || '🤖 Processing...', isStreaming: true }
                    : msg
                ));
              }

              // Handle completion
              if (jsonData.type === 'done') {
                isStreamComplete = true;

                // Try to parse the accumulated content for address detection
                try {
                  // Check if the entire response is a JSON object
                  const parsedResponse = JSON.parse(streamingContent);
                  if (parsedResponse.type === 'address_detected' && parsedResponse.address) {
                    detectedAddress = parsedResponse.address;
                    streamingContent = parsedResponse.response || streamingContent;
                  } else if (parsedResponse.type === 'chat' && parsedResponse.response) {
                    streamingContent = parsedResponse.response;
                  }
                } catch (e) {
                  // Content is not JSON, use as-is
                  // Check for address pattern in plain text
                  const addressPattern = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b|0x[a-fA-F0-9]{40}\b/g;
                  const foundAddresses = streamingContent.match(addressPattern);
                  if (foundAddresses && foundAddresses.length > 0) {
                    detectedAddress = foundAddresses[0];
                  }
                }
                break;
              }
            } catch (e) {
              console.warn('Failed to parse streaming data:', data, e);
              continue;
            }
          }
        }
      }

      // Finalize the message
      const finalContent = streamingContent || 'I apologize, but I encountered an issue processing your request.';
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? {
            ...msg,
            content: finalContent,
            isStreaming: false
          }
          : msg
      ));

      return {
        content: finalContent,
        detectedAddress: detectedAddress
      };

    } catch (error) {
      console.error('Chat streaming error:', error);

      // Update message with error
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? {
            ...msg,
            content: `❌ **Connection Error**\n\nUnable to connect to SentrySol AI. Please check your connection and try again.`,
            isStreaming: false
          }
          : msg
      ));

      throw error;
    }
  };

  // Function to start streaming analysis
  const startStreamingAnalysis = async (address: string, messageId: string) => {
    const backendUrl = import.meta.env.DEV ? 'https://sentrysol-beta-production.up.railway.app' : window.location.origin;
    const analyzeUrl = `${backendUrl}/analyze/${address}`;

    setStreamingMessageId(messageId);
    setAnalysisLogs([]);
    setAnalysisProgress(0);

    const startTime = Date.now();
    let eventSource: EventSource;
    let lastActivityTime = Date.now();
    let keepAliveInterval: NodeJS.Timeout;
    let connectionCheckInterval: NodeJS.Timeout;
    let isManuallyStoped = false;

    // Add initial streaming status
    const streamingMessage = `🔍 **Starting Deep Analysis for Address:** \`${address}\`\n\n⏳ Connecting to SentrySol-Core...`;

    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, content: streamingMessage, isStreaming: true }
        : msg
    ));

    const connectToStream = () => {
      if (eventSource && eventSource.readyState !== 2) {
        eventSource.close();
      }

      eventSource = new EventSource(analyzeUrl);
      lastActivityTime = Date.now();

      keepAliveInterval = setInterval(() => {
        if (eventSource.readyState === 1) {
          const timeSinceActivity = Date.now() - lastActivityTime;
          const totalAnalysisTime = Date.now() - startTime;

          if (timeSinceActivity > 120000) {
            setAnalysisLogs(prev => [...prev, 'Connection timeout - no activity for 2 minutes']);
            cleanup();
            return;
          }

          if (totalAnalysisTime > 120000 && Math.floor(totalAnalysisTime / 120000) !== Math.floor((totalAnalysisTime - 30000) / 120000)) {
            const minutes = Math.floor(totalAnalysisTime / 60000);
            const seconds = Math.floor((totalAnalysisTime % 60000) / 1000);
            setAnalysisLogs(prev => [...prev, `Analysis running for ${minutes}m ${seconds}s...`]);
          }
        }
      }, 30000);

      connectionCheckInterval = setInterval(() => {
        if (eventSource.readyState === 2 && !isManuallyStoped) {
          const timeSinceStart = Date.now() - startTime;

          if (timeSinceStart > 8 * 60 * 1000) {
            setAnalysisLogs(prev => [...prev, 'Maximum analysis time reached']);
            cleanup();
            return;
          }

          setAnalysisLogs(prev => [...prev, '🔄 Connection lost, attempting reconnect...']);
          clearInterval(keepAliveInterval);
          clearInterval(connectionCheckInterval);

          setTimeout(() => {
            if (!isManuallyStoped) {
              connectToStream();
            }
          }, 5000);
        }
      }, 5000);

      eventSource.onopen = function (event) {
        setAnalysisLogs(prev => [...prev, '✅ Connected to analysis stream']);
        lastActivityTime = Date.now();
      };

      eventSource.onmessage = function (event) {
        lastActivityTime = Date.now();

        if (event.data === '[DONE]') {
          const totalTime = Math.floor((Date.now() - startTime) / 1000);
          setAnalysisLogs(prev => [...prev, `✅ Analysis completed in ${totalTime}s!`]);

          // Update the message to show completion
          setMessages(prev => prev.map(msg =>
            msg.id === messageId
              ? {
                ...msg,
                isStreaming: false,
                content: msg.content + '\n\n✅ **Deep Analysis Complete!**'
              }
              : msg
          ));

          cleanup();
          setStreamingMessageId(null);
          return;
        }

        if (event.data === 'keepalive' || event.data === 'ping' || event.data.includes('heartbeat')) {
          return;
        }

        if (!event.data || event.data.trim() === '') {
          return;
        }

        try {
          const data = JSON.parse(event.data);

          if (data.progress !== undefined) {
            setAnalysisProgress(data.progress);
          }

          if (data.status) {
            const stepInfo = data.step ? `Step ${data.step}: ` : '';
            const progressInfo = data.progress !== undefined ? ` (${data.progress}%)` : '';
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            const timeInfo = ` [${elapsedSeconds}ms]`;

            const logEntry = `${stepInfo}${data.status}${progressInfo}${timeInfo}`;
            setAnalysisLogs(prev => [...prev, logEntry]);

            // Update streaming message with latest log
            setMessages(prev => prev.map(msg =>
              msg.id === messageId
                ? {
                  ...msg,
                  content: `🔍 **Deep Analysis:** \`${address}\`\n\n**Progress:** ${data.progress || 0}%\n\n**Latest:** ${data.status}\n\n⏱️ **Elapsed Time:** ${elapsedSeconds}ms`
                }
                : msg
            ));
          }

          if (data.data || data.analysis_result || data.detailed_data || data.transaction_graph || data.threat_analysis) {
            const finalData = data.data || data;

            // Update message with analysis results
            const analysisResult = parseAnalysisResult(finalData);
            const formattedResult = formatAnalysisForChat(analysisResult, address);

            setMessages(prev => prev.map(msg =>
              msg.id === messageId
                ? {
                  ...msg,
                  content: formattedResult,
                  analysisData: finalData,
                  isStreaming: false
                }
                : msg
            ));

            setAnalysisLogs(prev => [...prev, 'Analysis results received and processed']);
          }

          if (data.error && data.critical === true) {
            setAnalysisLogs(prev => [...prev, `❌ Critical error: ${data.error}`]);
            cleanup();
          }

        } catch (parseError) {
          console.error('Parse error:', parseError);
          setAnalysisLogs(prev => [...prev, `⚠️ Parse error, continuing...`]);
        }
      };

      eventSource.onerror = function (event) {
        console.error('EventSource error:', event);
        setAnalysisLogs(prev => [...prev, '🔗 Connection error detected']);
      };
    };

    const cleanup = () => {
      isManuallyStoped = true;
      if (keepAliveInterval) clearInterval(keepAliveInterval);
      if (connectionCheckInterval) clearInterval(connectionCheckInterval);
      if (eventSource && eventSource.readyState !== 2) {
        eventSource.close();
      }
      setStreamingMessageId(null);
    };

    connectToStream();
  };

  const parseAnalysisResult = (rawResult: any) => {
    try {
      if (typeof rawResult === 'string') {
        let cleanResult = rawResult;
        if (rawResult.startsWith('```json\n')) {
          cleanResult = rawResult.replace(/^```json\n/, '').replace(/\n```$/, '');
        }
        return JSON.parse(cleanResult);
      }
      return rawResult;
    } catch (e) {
      console.error('Failed to parse analysis result:', e);
      return rawResult;
    }
  };

  const formatAnalysisForChat = (analysisData: any, address: string) => {
    let formattedResult = `🔍 **Deep Analysis Complete for:** \`${address}\`\n\n`;

    try {
      // Extract threat analysis
      let threatAnalysis = null;
      if (analysisData.analysis_result) {
        const parsedAnalysis = parseAnalysisResult(analysisData.analysis_result);
        if (parsedAnalysis?.threat_analysis) {
          threatAnalysis = parsedAnalysis.threat_analysis;
        }
      }

      if (threatAnalysis) {
        const riskScore = threatAnalysis.risk_score || 0;
        const riskLevel = threatAnalysis.overall_risk_level || 'UNKNOWN';

        formattedResult += `🛡️ **Risk Assessment**\n`;
        formattedResult += `• **Risk Level:** ${riskLevel}\n`;
        formattedResult += `• **Risk Score:** ${riskScore}/100\n\n`;

        // Potential threats
        if (threatAnalysis.potential_threats && threatAnalysis.potential_threats.length > 0) {
          formattedResult += `⚠️ **Identified Threats:**\n`;
          threatAnalysis.potential_threats.forEach((threat: any, index: number) => {
            formattedResult += `${index + 1}. **${threat.threat_type}** (${threat.confidence})\n`;
            formattedResult += `   ${threat.reason}\n\n`;
          });
        }

        // IOC Summary
        if (threatAnalysis.ioc) {
          formattedResult += `🔍 **Indicators of Compromise:**\n`;
          if (threatAnalysis.ioc.addresses?.length > 0) {
            formattedResult += `• **Suspicious Addresses:** ${threatAnalysis.ioc.addresses.length}\n`;
          }
          if (threatAnalysis.ioc.transaction_signatures?.length > 0) {
            formattedResult += `• **Flagged Transactions:** ${threatAnalysis.ioc.transaction_signatures.length}\n`;
          }
          if (threatAnalysis.ioc.suspicious_mints?.length > 0) {
            formattedResult += `• **Suspicious Tokens:** ${threatAnalysis.ioc.suspicious_mints.length}\n`;
          }
          formattedResult += '\n';
        }
      }

      // Wallet info
      if (analysisData.detailed_data?.wallet_info) {
        formattedResult += `💼 **Wallet Information**\n`;
        formattedResult += `• **Address:** \`${analysisData.detailed_data.wallet_info.address?.substring(0, 8)}...${analysisData.detailed_data.wallet_info.address?.substring(-8)}\`\n\n`;
      }

      // Transaction summary
      if (analysisData.detailed_data?.transaction_summary) {
        const txSummary = analysisData.detailed_data.transaction_summary;
        formattedResult += `📊 **Transaction Summary**\n`;
        formattedResult += `• **Total Transactions:** ${txSummary.total_transactions || 0}\n`;
        formattedResult += `• **Recent Signatures:** ${txSummary.recent_signatures || 0}\n`;
        formattedResult += `• **Balance Changes:** ${txSummary.balance_changes || 0}\n\n`;
      }

      // Token analysis
      if (analysisData.detailed_data?.token_analysis) {
        const tokenAnalysis = analysisData.detailed_data.token_analysis;
        formattedResult += `🪙 **Token & NFT Analysis**\n`;
        formattedResult += `• **Tokens Found:** ${tokenAnalysis.tokens_found || 0}\n`;
        formattedResult += `• **NFTs Found:** ${tokenAnalysis.nfts_found || 0}\n\n`;
      }

      formattedResult += `✅ **Deep analysis completed successfully!**\n`;
      formattedResult += `📈 Click "View Full Analysis" to see detailed network graphs and visualizations.`;

    } catch (error) {
      console.error('Error formatting analysis:', error);
      formattedResult += `❌ Analysis completed but formatting error occurred.\n`;
      formattedResult += `Raw data available in full analysis view.`;
    }

    return formattedResult;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Create bot message for streaming
    const botMessageId = (Date.now() + 1).toString();
    const botMessage: ChatMessage = {
      id: botMessageId,
      type: 'bot',
      content: '🤖 Processing...',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, botMessage]);

    try {
      // Stream chat with Mistral
      const mistralResult = await streamChatWithMistral(currentInput, botMessageId);

      setIsLoading(false);
      console.log(mistralResult)
      // If address detected, start deep analysis
      if (mistralResult.detectedAddress) {
        // Show analysis announcement
        const analysisAnnouncementId = (Date.now() + 2).toString();
        const analysisAnnouncement: ChatMessage = {
          id: analysisAnnouncementId,
          type: 'bot',
          content: `🚀 **Initiating Deep Security Analysis**\n\nI've detected the address: \`${mistralResult.detectedAddress}\`\n\nStarting comprehensive analysis including:\n• Behavioral pattern analysis\n• Risk assessment\n• Network graph generation\n• Threat intelligence scan`,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, analysisAnnouncement]);

        // Create streaming analysis message
        const streamingAnalysisId = (Date.now() + 3).toString();
        const streamingAnalysisMessage: ChatMessage = {
          id: streamingAnalysisId,
          type: 'bot',
          content: '🔍 Preparing analysis...',
          timestamp: new Date(),
          isStreaming: true
        };

        setMessages(prev => [...prev, streamingAnalysisMessage]);

        // Start streaming analysis after short delay
        setTimeout(() => {
          startStreamingAnalysis(mistralResult.detectedAddress!, streamingAnalysisId);
        }, 1500);
      }

    } catch (error) {
      console.error('Chat error:', error);

      let errorContent = '❌ **Connection Error**\n\n';

      if (error.message.includes('Failed to fetch') || error.message.includes('timeout')) {
        errorContent += 'Unable to connect to SentrySol AI services. Please check:\n\n';
        errorContent += '• Backend server is running\n';
        errorContent += '• Internet connection is stable\n';
        errorContent += '• Try again in a few moments\n\n';
        errorContent += '**Note:** For address analysis, you can also paste addresses directly and I\'ll do my best to help with basic information.';
      } else {
        errorContent += `Service temporarily unavailable: ${error.message}\n\n`;
        errorContent += 'Please try again later or contact support if the problem persists.';
      }

      // Update the streaming message with error
      setMessages(prev => prev.map(msg =>
        msg.id === botMessageId
          ? { ...msg, content: errorContent, isStreaming: false }
          : msg
      ));

      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAnalyze = (address: string) => {
    onAddressAnalyze(address);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 30) return 'text-green-400';
    if (riskScore < 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskLevel = (riskScore: number) => {
    if (riskScore < 30) return 'LOW';
    if (riskScore < 70) return 'MEDIUM';
    return 'HIGH';
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
        <div className="w-8 h-8 bg-sentry-accent rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-poppins text-lg font-semibold">SentrySol AI</h3>
          <p className="text-white/60 font-poppins text-sm">Address Tracer & Security Analyst</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`p-3 rounded-2xl ${message.type === 'user'
                    ? 'bg-sentry-sage text-black ml-2'
                    : 'bg-black/20 text-white mr-2'
                  }`}
              >
                <div className="flex items-start gap-2">
                  {message.type === 'bot' && (
                    <Bot className="w-4 h-4 text-sentry-accent mt-0.5 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <User className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="font-poppins text-sm leading-relaxed whitespace-pre-wrap">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Custom styling untuk code blocks
                          code: ({ node, inline, className, children, ...props }: {
                            node?: any;
                            inline?: boolean;
                            className?: string;
                            children?: React.ReactNode;
                          }) => {
                            const textContent = String(children);
                            const shouldBeBlock = !inline && (textContent.length > 30 || textContent.includes('\n'));

                            return shouldBeBlock ? (
                              <code className="block bg-black/30 p-2 rounded-lg text-white/90 font-mono text-xs overflow-x-auto my-1 whitespace-pre-wrap break-words max-w-full">
                                {children}
                              </code>
                            ) : (
                              <code className="bg-black/30 text-sentry-sage px-1.5 py-0.5 rounded text-xs font-mono">
                                {children}
                              </code>
                            );
                          },
                          // Custom
                          //  styling untuk headings - Reduced spacing
                          h1: ({ children }) => (
                            <h1 className="text-lg font-bold text-white mb-1 mt-1">{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-base font-semibold text-white mb-1 mt-1">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-medium text-white/90 mb-0.5 mt-0.5">{children}</h3>
                          ),
                          // Custom styling untuk paragraphs - Reduced spacing
                          p: ({ children }) => (
                            <p className="my-0 leading-snug">{children}</p>
                          ),
                          // Custom styling untuk lists - Reduced spacing
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside my-0 pl-3 text-white/90">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside my-0 pl-3 text-white/90">{children}</ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-white/90 my-0 leading-snug">{children}</li>
                          ),
                          // Custom styling untuk links
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sentry-accent hover:text-sentry-sage underline"
                            >
                              {children}
                            </a>
                          ),
                          // Custom styling untuk emphasis
                          strong: ({ children }) => (
                            <strong className="text-white font-semibold">{children}</strong>
                          ),
                          em: ({ children }) => (
                            <em className="text-white/80 italic">{children}</em>
                          ),
                          // Custom styling untuk blockquotes - Reduced spacing
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-sentry-accent pl-3 py-1 my-1 bg-black/20 rounded-r-lg">
                              {children}
                            </blockquote>
                          ),
                          // Custom styling untuk line breaks
                          br: () => <br className="leading-none" />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>

                    {/* Streaming indicator for regular chat */}
                    {message.isStreaming && !message.analysisData && streamingMessageId !== message.id && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-sentry-accent rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-sentry-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-sentry-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-white/60 font-poppins text-xs">AI is thinking...</span>
                      </div>
                    )}

                    {/* Streaming Progress for analysis */}
                    {streamingMessageId === message.id && (
                      <div className="mt-3 p-3 bg-black/20 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-sentry-accent animate-spin" />
                          <span className="text-white/70 font-poppins text-xs">Live Deep Analysis</span>
                        </div>

                        <div className="w-full bg-black/20 rounded-full h-2 mb-2">
                          <div
                            className="bg-gradient-to-r from-sentry-sage to-sentry-accent h-2 rounded-full transition-all duration-500"
                            style={{ width: `${analysisProgress}%` }}
                          ></div>
                        </div>

                        {analysisLogs.length > 0 && (
                          <div className="max-h-20 overflow-y-auto">
                            {analysisLogs.slice(-3).map((log, index) => (
                              <div key={index} className="text-white/60 font-mono text-xs mb-1">
                                {log}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Analysis Results Actions */}
                    {message.analysisData && !message.isStreaming && (
                      <div className="mt-3 p-3 bg-black/20 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 font-poppins text-xs">Full Analysis Available</span>
                          <button
                            onClick={() => {
                              const address = message.analysisData.detailed_data?.wallet_info?.address ||
                                message.analysisData.metadata?.target_address;
                              if (address) {
                                handleQuickAnalyze(address);
                              }
                            }}
                            className="bg-sentry-accent text-white px-3 py-1 rounded-full text-xs font-poppins hover:bg-sentry-accent/80 transition-colors"
                          >
                            View Full Analysis
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-grey mt-1 text-right">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-black/20 text-white p-3 rounded-2xl mr-2">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-sentry-accent" />
                <span className="text-white/70 font-poppins text-sm">Starting conversation...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about blockchain security or paste a Solana/Ethereum address for analysis..."
            className="w-full h-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/60 font-poppins text-sm resize-none focus:outline-none focus:border-sentry-accent transition-colors"
            rows={2}
            disabled={isLoading || streamingMessageId !== null}
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading || streamingMessageId !== null}
          className="bg-sentry-accent text-white px-6 rounded-xl hover:bg-sentry-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};