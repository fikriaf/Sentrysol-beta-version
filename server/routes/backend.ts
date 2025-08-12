import { Request, Response } from "express";

export function handleHealth(_req: Request, res: Response) {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString()
  });
}

export function handleAnalyzeWallet(req: Request, res: Response) {
  const { address } = req.params;
  
  // Set up Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Mock analysis steps
  const steps = [
    { step: 1, status: 'Initializing analysis...', progress: 10 },
    { step: 2, status: 'Fetching transaction history...', progress: 25 },
    { step: 3, status: 'Analyzing transaction patterns...', progress: 50 },
    { step: 4, status: 'Building transaction network...', progress: 75 },
    { step: 5, status: 'Generating security analysis...', progress: 90 },
    {
      step: 6,
      status: 'Analysis complete',
      progress: 100,
      data: {
        address,
        risk_score: Math.floor(Math.random() * 100),
        total_transactions: Math.floor(Math.random() * 1000) + 50,
        analysis: {
          suspicious_activities: [
            "Multiple large transactions detected",
            "Rapid transaction sequences identified"
          ],
          patterns: {
            total_transactions: Math.floor(Math.random() * 1000) + 50,
            unique_counterparts: Math.floor(Math.random() * 100) + 10,
            large_transactions: Math.floor(Math.random() * 10),
            rapid_transactions: Math.floor(Math.random() * 5)
          }
        },
        network_data: {
          nodes: generateMockNodes(address),
          edges: generateMockEdges()
        },
        transaction_flow: generateMockTransactionFlow(),
        ai_analysis: "This wallet shows typical trading patterns with moderate risk indicators. The transaction frequency and amounts suggest automated trading activity."
      }
    }
  ];

  let currentStep = 0;

  const sendStep = () => {
    if (currentStep < steps.length) {
      const stepData = steps[currentStep];
      res.write(`data: ${JSON.stringify(stepData)}\n\n`);
      currentStep++;
      
      // Last step includes complete data
      if (currentStep === steps.length) {
        res.end();
      } else {
        setTimeout(sendStep, 1500); // 1.5 second delay between steps
      }
    }
  };

  // Start sending steps
  setTimeout(sendStep, 500);

  // Handle client disconnect
  req.on('close', () => {
    res.end();
  });
}

export function handleChatAnalysis(req: Request, res: Response) {
  const { message, address } = req.body;
  
  // Mock AI response
  const responses = [
    `Analyzing address ${address || 'provided'}...`,
    "Based on the transaction patterns, this appears to be a normal trading wallet.",
    "The wallet shows regular DeFi interactions with no major red flags.",
    "Risk assessment indicates low to moderate risk level.",
    "Recommendation: Monitor for unusual activity patterns."
  ];
  
  const response = responses[Math.floor(Math.random() * responses.length)];
  
  res.json({
    response,
    analysis: {
      address: address || "No address provided",
      risk_level: "low",
      confidence: 0.85
    }
  });
}

function generateMockNodes(centerAddress: string) {
  const nodes = [
    {
      id: centerAddress,
      label: centerAddress.slice(0, 8) + '...',
      color: '#ff6b6b',
      size: 30,
      font: { color: '#ffffff' }
    }
  ];

  // Add random connected nodes
  for (let i = 0; i < 15; i++) {
    const randomAddress = generateRandomAddress();
    nodes.push({
      id: randomAddress,
      label: randomAddress.slice(0, 8) + '...',
      color: i < 5 ? '#4ecdc4' : '#45b7d1',
      size: Math.random() * 20 + 10,
      font: { color: '#ffffff' }
    });
  }

  return nodes;
}

function generateMockEdges(nodes: any[]) {
  const edges = [];

  // Connect center node to others
  for (let i = 1; i < Math.min(8, nodes.length); i++) {
    edges.push({
      from: nodes[0].id,
      to: nodes[i].id,
      width: Math.random() * 5 + 1,
      color: { color: '#ffffff', opacity: 0.7 }
    });
  }

  // Add some random connections
  for (let i = 0; i < 10 && nodes.length > 2; i++) {
    const fromNode = nodes[Math.floor(Math.random() * nodes.length)];
    const toNode = nodes[Math.floor(Math.random() * nodes.length)];
    if (fromNode.id !== toNode.id) {
      edges.push({
        from: fromNode.id,
        to: toNode.id,
        width: Math.random() * 3 + 1,
        color: { color: '#ffffff', opacity: 0.5 }
      });
    }
  }

  return edges;
}

function generateMockTransactionFlow() {
  const dates = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return {
    overview: dates.map(date => ({
      date,
      inflow: Math.random() * 10 + 1,
      outflow: Math.random() * 8 + 0.5,
      net: Math.random() * 4 - 2
    })),
    inflow: dates.map(date => ({
      date,
      amount: Math.random() * 10 + 1,
      transactions: Math.floor(Math.random() * 20) + 1
    })),
    outflow: dates.map(date => ({
      date,
      amount: Math.random() * 8 + 0.5,
      transactions: Math.floor(Math.random() * 15) + 1
    })),
    timeline: generateMockTimelineData()
  };
}

function generateMockTimelineData() {
  const data = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const hour = new Date(now);
    hour.setHours(i, 0, 0, 0);
    data.push({
      time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      transactions: Math.floor(Math.random() * 50)
    });
  }
  
  return data;
}

function generateRandomAddress(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
