import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Clock, DollarSign } from 'lucide-react';

interface TransactionFlowProps {
  walletAddress: string;
  isVisible: boolean;
}

interface FlowData {
  inflow_transactions: Array<{
    from_address: string;
    to_address: string;
    amount: number;
    token: string;
    signature: string;
    timestamp: string;
    type: string;
  }>;
  outflow_transactions: Array<{
    from_address: string;
    to_address: string;
    amount: number;
    token: string;
    signature: string;
    timestamp: string;
    type: string;
  }>;
  summary: {
    total_inflow: number;
    total_outflow: number;
    inflow_count: number;
    outflow_count: number;
  };
  graph_data: any;
}

export const TransactionFlow: React.FC<TransactionFlowProps> = ({ walletAddress, isVisible }) => {
  const [flowData, setFlowData] = useState<FlowData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'inflow' | 'outflow' | 'timeline'>('overview');

  useEffect(() => {
    if (isVisible && walletAddress) {
      fetchTransactionFlow();
    }
  }, [walletAddress, isVisible]);

  const fetchTransactionFlow = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/transaction-flow/${walletAddress}?limit=100`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch transaction flow');
      }
      
      const data = await response.json();
      setFlowData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Transaction flow fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareTimelineData = () => {
    if (!flowData) return [];

    const allTransactions = [
      ...flowData.inflow_transactions.map(tx => ({ ...tx, flow_type: 'inflow' })),
      ...flowData.outflow_transactions.map(tx => ({ ...tx, flow_type: 'outflow' }))
    ];

    // Group by day
    const groupedByDay = allTransactions.reduce((acc, tx) => {
      const date = new Date(tx.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, inflow: 0, outflow: 0, net: 0 };
      }
      
      if (tx.flow_type === 'inflow') {
        acc[date].inflow += tx.amount;
      } else {
        acc[date].outflow += tx.amount;
      }
      acc[date].net = acc[date].inflow - acc[date].outflow;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedByDay).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const preparePieData = () => {
    if (!flowData) return [];

    return [
      { name: 'Inflow', value: flowData.summary.total_inflow, color: '#10b981' },
      { name: 'Outflow', value: flowData.summary.total_outflow, color: '#ef4444' }
    ];
  };

  const prepareTopCounterparties = (type: 'inflow' | 'outflow') => {
    if (!flowData) return [];

    const transactions = type === 'inflow' ? flowData.inflow_transactions : flowData.outflow_transactions;
    const counterparties = transactions.reduce((acc, tx) => {
      const address = type === 'inflow' ? tx.from_address : tx.to_address;
      if (!acc[address]) {
        acc[address] = { address, total: 0, count: 0 };
      }
      acc[address].total += tx.amount;
      acc[address].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(counterparties)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 10);
  };

  if (!isVisible) return null;

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-sentry-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-poppins">Loading transaction flow...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <div className="text-center">
          <p className="text-red-400 font-poppins mb-4">Error: {error}</p>
          <button
            onClick={fetchTransactionFlow}
            className="bg-sentry-accent text-white px-4 py-2 rounded-lg font-poppins hover:bg-sentry-accent/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!flowData) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <div className="text-center">
          <p className="text-white/60 font-poppins">No transaction flow data available</p>
        </div>
      </div>
    );
  }

  const timelineData = prepareTimelineData();
  const pieData = preparePieData();
  const netFlow = flowData.summary.total_inflow - flowData.summary.total_outflow;

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-poppins text-xl font-semibold">Transaction Flow Analysis</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-poppins text-sm transition-colors ${
              activeTab === 'overview' ? 'bg-sentry-accent text-white' : 'bg-black/20 text-white/70 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('inflow')}
            className={`px-4 py-2 rounded-lg font-poppins text-sm transition-colors ${
              activeTab === 'inflow' ? 'bg-sentry-accent text-white' : 'bg-black/20 text-white/70 hover:text-white'
            }`}
          >
            Inflow
          </button>
          <button
            onClick={() => setActiveTab('outflow')}
            className={`px-4 py-2 rounded-lg font-poppins text-sm transition-colors ${
              activeTab === 'outflow' ? 'bg-sentry-accent text-white' : 'bg-black/20 text-white/70 hover:text-white'
            }`}
          >
            Outflow
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-lg font-poppins text-sm transition-colors ${
              activeTab === 'timeline' ? 'bg-sentry-accent text-white' : 'bg-black/20 text-white/70 hover:text-white'
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownLeft className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-poppins text-sm">Total Inflow</span>
              </div>
              <div className="text-white font-poppins text-xl font-bold">
                {flowData.summary.total_inflow.toFixed(2)} SOL
              </div>
              <div className="text-green-300 font-poppins text-sm">
                {flowData.summary.inflow_count} transactions
              </div>
            </div>

            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-5 h-5 text-red-400" />
                <span className="text-red-300 font-poppins text-sm">Total Outflow</span>
              </div>
              <div className="text-white font-poppins text-xl font-bold">
                {flowData.summary.total_outflow.toFixed(2)} SOL
              </div>
              <div className="text-red-300 font-poppins text-sm">
                {flowData.summary.outflow_count} transactions
              </div>
            </div>

            <div className={`${netFlow >= 0 ? 'bg-blue-500/20 border-blue-500/30' : 'bg-orange-500/20 border-orange-500/30'} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                {netFlow >= 0 ? <TrendingUp className="w-5 h-5 text-blue-400" /> : <TrendingDown className="w-5 h-5 text-orange-400" />}
                <span className={`${netFlow >= 0 ? 'text-blue-300' : 'text-orange-300'} font-poppins text-sm`}>Net Flow</span>
              </div>
              <div className="text-white font-poppins text-xl font-bold">
                {netFlow >= 0 ? '+' : ''}{netFlow.toFixed(2)} SOL
              </div>
              <div className={`${netFlow >= 0 ? 'text-blue-300' : 'text-orange-300'} font-poppins text-sm`}>
                {netFlow >= 0 ? 'Net Positive' : 'Net Negative'}
              </div>
            </div>

            <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300 font-poppins text-sm">Total Volume</span>
              </div>
              <div className="text-white font-poppins text-xl font-bold">
                {(flowData.summary.total_inflow + flowData.summary.total_outflow).toFixed(2)} SOL
              </div>
              <div className="text-purple-300 font-poppins text-sm">
                {flowData.summary.inflow_count + flowData.summary.outflow_count} total TXs
              </div>
            </div>
          </div>

          {/* Flow Distribution Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-black/20 rounded-xl p-4">
              <h4 className="text-white font-poppins text-lg font-semibold mb-4">Flow Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({name, value}) => `${name}: ${value.toFixed(2)} SOL`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value.toFixed(2)} SOL`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-black/20 rounded-xl p-4">
              <h4 className="text-white font-poppins text-lg font-semibold mb-4">Daily Flow Comparison</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={timelineData.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(2)} SOL`, 
                      name === 'inflow' ? 'Inflow' : name === 'outflow' ? 'Outflow' : 'Net'
                    ]}
                  />
                  <Bar dataKey="inflow" fill="#10b981" />
                  <Bar dataKey="outflow" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inflow' && (
        <div className="space-y-6">
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="text-white font-poppins text-lg font-semibold mb-4">Top Inflow Sources</h4>
            <div className="space-y-3">
              {prepareTopCounterparties('inflow').map((counterparty: any, index) => (
                <div key={counterparty.address} className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-green-300 font-poppins font-bold">#{index + 1}</span>
                    <span className="text-white font-mono text-sm">
                      {counterparty.address.slice(0, 8)}...{counterparty.address.slice(-8)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-poppins font-bold">{counterparty.total.toFixed(2)} SOL</div>
                    <div className="text-green-300 font-poppins text-sm">{counterparty.count} transactions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'outflow' && (
        <div className="space-y-6">
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="text-white font-poppins text-lg font-semibold mb-4">Top Outflow Destinations</h4>
            <div className="space-y-3">
              {prepareTopCounterparties('outflow').map((counterparty: any, index) => (
                <div key={counterparty.address} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-red-300 font-poppins font-bold">#{index + 1}</span>
                    <span className="text-white font-mono text-sm">
                      {counterparty.address.slice(0, 8)}...{counterparty.address.slice(-8)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-poppins font-bold">{counterparty.total.toFixed(2)} SOL</div>
                    <div className="text-red-300 font-poppins text-sm">{counterparty.count} transactions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="text-white font-poppins text-lg font-semibold mb-4">Transaction Timeline</h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(2)} SOL`, 
                    name === 'inflow' ? 'Inflow' : name === 'outflow' ? 'Outflow' : 'Net Flow'
                  ]}
                />
                <Area type="monotone" dataKey="inflow" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Area type="monotone" dataKey="outflow" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
