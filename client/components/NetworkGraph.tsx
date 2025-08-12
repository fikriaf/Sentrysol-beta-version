import React, { useEffect, useRef, useState } from 'react';
import { Network, DataSet } from 'vis-network/standalone';

interface NetworkGraphProps {
  graphData: {
    nodes: Array<{
      id: string;
      label: string;
      type: string;
      isMain: boolean;
    }>;
    edges: Array<{
      from: string;
      to: string;
      weight: number;
      count: number;
      type: string;
    }>;
    summary: {
      total_nodes: number;
      total_edges: number;
      total_volume: number;
    };
  };
  height?: string;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ graphData, height = "400px" }) => {
  const networkRef = useRef<HTMLDivElement>(null);
  const [network, setNetwork] = useState<Network | null>(null);

  useEffect(() => {
    if (!networkRef.current || !graphData) return;

    // Prepare nodes
    const nodes = new DataSet(
      graphData.nodes.map(node => ({
        id: node.id,
        label: node.label,
        color: {
          background: node.isMain ? '#CFE0E3' : node.type === 'external' ? '#395B64' : '#92BAC1',
          border: node.isMain ? '#92BAC1' : '#CFE0E3',
          highlight: {
            background: '#E7F6F2',
            border: '#A5C9CA'
          }
        },
        font: {
          color: node.isMain ? '#000' : '#fff',
          size: node.isMain ? 16 : 12
        },
        size: node.isMain ? 30 : 20,
        borderWidth: 2
      }))
    );

    // Prepare edges
    const edges = new DataSet(
      graphData.edges.map(edge => ({
        from: edge.from,
        to: edge.to,
        label: `${edge.weight.toFixed(2)} SOL (${edge.count}x)`,
        width: Math.max(1, Math.min(10, edge.weight / 10)),
        color: {
          color: '#A5C9CA',
          highlight: '#CFE0E3'
        },
        arrows: {
          to: { enabled: true, scaleFactor: 1 }
        },
        font: {
          size: 10,
          color: '#fff'
        },
        smooth: {
          type: 'continuous',
          roundness: 0.3
        }
      }))
    );

    // Network options
    const options = {
      layout: {
        improvedLayout: false,
        hierarchical: {
          enabled: false
        }
      },
      physics: {
        enabled: true,
        stabilization: { iterations: 100 },
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 200,
          springConstant: 0.04,
          damping: 0.09
        }
      },
      nodes: {
        shape: 'circle',
        shadow: true
      },
      edges: {
        shadow: true,
        smooth: true
      },
      interaction: {
        hover: true,
        selectConnectedEdges: false,
        hoverConnectedEdges: false
      },
      configure: {
        enabled: false
      }
    };

    // Create network
    const networkInstance = new Network(networkRef.current, { nodes, edges }, options);
    setNetwork(networkInstance);

    // Event listeners
    networkInstance.on('selectNode', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        console.log('Selected node:', nodeId);
      }
    });

    return () => {
      if (networkInstance) {
        networkInstance.destroy();
      }
    };
  }, [graphData]);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-black/20 rounded-xl">
        <p className="text-white/60">No transaction flow data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Graph Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-black/20 rounded-xl p-4 text-center">
          <div className="text-white font-poppins text-2xl font-bold">
            {graphData.summary.total_nodes}
          </div>
          <div className="text-white/70 font-poppins text-sm">Connected Addresses</div>
        </div>
        <div className="bg-black/20 rounded-xl p-4 text-center">
          <div className="text-white font-poppins text-2xl font-bold">
            {graphData.summary.total_edges}
          </div>
          <div className="text-white/70 font-poppins text-sm">Transactions</div>
        </div>
        <div className="bg-black/20 rounded-xl p-4 text-center">
          <div className="text-white font-poppins text-2xl font-bold">
            {graphData.summary.total_volume.toFixed(2)}
          </div>
          <div className="text-white/70 font-poppins text-sm">Total Volume (SOL)</div>
        </div>
      </div>

      {/* Network Visualization */}
      <div className="bg-black/20 rounded-xl p-4">
        <h3 className="text-white font-poppins text-lg font-semibold mb-4">
          Transaction Flow Network
        </h3>
        <div 
          ref={networkRef} 
          style={{ height, width: '100%' }}
          className="border border-white/10 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800"
        />
        <div className="mt-4 flex items-center gap-6 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#CFE0E3' }}></div>
            <span>Main Wallet</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#395B64' }}></div>
            <span>Connected Address</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-sentry-accent rounded-full"></div>
            <span>Transaction Flow</span>
          </div>
        </div>
      </div>
    </div>
  );
};
