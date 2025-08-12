import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Search, AlertTriangle, CheckCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  analysis?: {
    address?: string;
    risk_score?: number;
    recent_transactions?: number;
  };
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractSolanaAddress = (text: string): string | null => {
    // Solana address pattern (base58, 32-44 characters)
    const addressPattern = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
    const matches = text.match(addressPattern);
    return matches ? matches[0] : null;
  };

  const analyzeWithBackend = async (message: string, address?: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/chat/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          address
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Backend analysis error:', error);
      return null;
    }
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
    setInputMessage('');
    setIsLoading(true);

    // Extract address if present
    const extractedAddress = extractSolanaAddress(inputMessage);

    try {
      // Get AI response
      const analysisResult = await analyzeWithBackend(inputMessage, extractedAddress || undefined);
      
      let botResponse: ChatMessage;

      if (analysisResult) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: analysisResult.response,
          timestamp: new Date(),
          analysis: analysisResult.quick_analysis
        };
      } else {
        // Fallback response
        if (extractedAddress) {
          botResponse = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: `I found a Solana address: ${extractedAddress}\n\nWould you like me to perform a detailed security analysis of this wallet? I can check for suspicious activity, transaction patterns, and potential security risks.`,
            timestamp: new Date(),
            analysis: { address: extractedAddress }
          };
        } else {
          botResponse = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: 'I can help you analyze Solana wallet addresses. Please provide a valid Solana address (starting with letters/numbers, 32-44 characters long) and I\'ll trace its activity and security profile.',
            timestamp: new Date()
          };
        }
      }

      setMessages(prev => [...prev, botResponse]);

      // If there's an address, offer to analyze it
      if (extractedAddress && !isAnalyzing) {
        setTimeout(() => {
          const analysisPrompt: ChatMessage = {
            id: (Date.now() + 2).toString(),
            type: 'bot',
            content: `🔍 Ready to analyze ${extractedAddress}?\n\nClick "Analyze Address" to start a comprehensive security scan including:\n• Transaction pattern analysis\n• Risk assessment\n• Fund flow visualization\n• AI-powered threat detection`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, analysisPrompt]);
        }, 1000);
      }

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your request. Please try again or check if the backend service is running.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
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
    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col h-96">
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
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`p-3 rounded-2xl ${
                  message.type === 'user'
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
                    <p className="font-poppins text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    
                    {/* Quick Analysis Display */}
                    {message.analysis && message.analysis.address && (
                      <div className="mt-3 p-3 bg-black/20 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/70 font-poppins text-xs">Quick Analysis</span>
                          <button
                            onClick={() => handleQuickAnalyze(message.analysis!.address!)}
                            disabled={isAnalyzing}
                            className="bg-sentry-accent text-white px-3 py-1 rounded-full text-xs font-poppins hover:bg-sentry-accent/80 transition-colors disabled:opacity-50"
                          >
                            {isAnalyzing ? 'Analyzing...' : 'Analyze Address'}
                          </button>
                        </div>
                        
                        {message.analysis.risk_score !== undefined && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-white/60">Risk Level:</span>
                              <span className={`ml-1 font-semibold ${getRiskColor(message.analysis.risk_score)}`}>
                                {getRiskLevel(message.analysis.risk_score)}
                              </span>
                            </div>
                            <div>
                              <span className="text-white/60">Recent TXs:</span>
                              <span className="ml-1 text-white font-semibold">
                                {message.analysis.recent_transactions || 0}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-white/50 mt-1 text-right">
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
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-sentry-accent rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-sentry-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-sentry-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
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
            placeholder="Ask about an address or paste a Solana wallet address..."
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/60 font-poppins text-sm resize-none focus:outline-none focus:border-sentry-accent transition-colors"
            rows={2}
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          className="bg-sentry-accent text-white p-3 rounded-xl hover:bg-sentry-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
