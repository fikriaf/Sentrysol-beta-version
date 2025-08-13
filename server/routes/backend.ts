import { Request, Response } from "express";

export function handleHealth(_req: Request, res: Response) {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
}

export function handleAnalyzeWallet(req: Request, res: Response) {
  const { address } = req.params;

  // Set up Server-Sent Events
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  // Mock analysis steps matching Python backend structure
  const totalTx = Math.floor(Math.random() * 1000) + 50;
  const signatures = Math.floor(Math.random() * 20) + 5;
  const tokensFound = Math.floor(Math.random() * 15) + 2;
  const nftsFound = Math.floor(Math.random() * 8) + 1;
  const riskScore = Math.floor(Math.random() * 100);
  const riskLevel = riskScore < 30 ? "low" : riskScore < 70 ? "medium" : "high";

  const steps = [
    { step: 1, status: "Fetching address history...", progress: 10 },
    {
      step: 1,
      status: "Address history fetched",
      progress: 15,
      data: { transactions_count: totalTx },
    },
    { step: 2, status: "Getting transaction signatures...", progress: 25 },
    {
      step: 2,
      status: "Signatures retrieved",
      progress: 35,
      data: { signatures_count: signatures },
    },
    { step: 3, status: "Analyzing token transfers...", progress: 45 },
    {
      step: 3,
      status: "Token and NFT metadata collected",
      progress: 55,
      data: { tokens_analyzed: tokensFound, nfts_found: nftsFound },
    },
    { step: 4, status: "Calculating wallet risk score...", progress: 65 },
    {
      step: 4,
      status: "Wallet score calculated",
      progress: 75,
      data: { wallet_score: { risk_score: riskScore } },
    },
    { step: 5, status: "Gathering additional data...", progress: 80 },
    {
      step: 5,
      status: "Additional data gathered",
      progress: 85,
      data: { address_name: "Unknown", balance_changes_count: 3 },
    },
    { step: 6, status: "Aggregating context for analysis...", progress: 90 },
    { step: 7, status: "Running AI analysis...", progress: 95 },
    {
      step: 8,
      status: "Analysis complete",
      progress: 100,
      analysis_result: generateMockThreatAnalysis(
        address,
        riskScore,
        riskLevel,
      ),
      detailed_data: {
        wallet_info: {
          address: address,
          address_name: "Unknown",
          risk_score: { risk_score: riskScore },
        },
        transaction_summary: {
          total_transactions: totalTx,
          recent_signatures: signatures,
          balance_changes: [],
        },
        token_analysis: {
          tokens_found: tokensFound,
          token_metadata: [],
          nfts_found: nftsFound,
          nft_metadata: generateMockNFTs(),
        },
      },
    },
  ];

  let currentStep = 0;

  const sendStep = () => {
    try {
      if (currentStep < steps.length && !res.headersSent) {
        const stepData = steps[currentStep];
        res.write(`data: ${JSON.stringify(stepData)}\n\n`);
        currentStep++;

        // Last step includes complete data
        if (currentStep === steps.length) {
          res.write(`data: [DONE]\n\n`);
          setTimeout(() => res.end(), 50); // Small delay before ending
        } else {
          setTimeout(sendStep, 500); // Faster steps - 0.5 second delay
        }
      }
    } catch (error) {
      console.error("SSE Error:", error);
      if (!res.headersSent) {
        res.write(
          `data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`,
        );
        res.end();
      }
    }
  };

  // Start sending steps
  setTimeout(sendStep, 100); // Start faster

  // Handle client disconnect
  req.on("close", () => {
    if (!res.headersSent) {
      res.end();
    }
  });

  // Handle errors
  req.on("error", (error) => {
    console.error("Request error:", error);
    if (!res.headersSent) {
      res.end();
    }
  });
}

export function handleChatAnalysis(req: Request, res: Response) {
  const { message, address } = req.body;

  // Mock AI response
  const responses = [
    `Analyzing address ${address || "provided"}...`,
    "Based on the transaction patterns, this appears to be a normal trading wallet.",
    "The wallet shows regular DeFi interactions with no major red flags.",
    "Risk assessment indicates low to moderate risk level.",
    "Recommendation: Monitor for unusual activity patterns.",
  ];

  const response = responses[Math.floor(Math.random() * responses.length)];

  res.json({
    response,
    analysis: {
      address: address || "No address provided",
      risk_level: "low",
      confidence: 0.85,
    },
  });
}

function generateMockNodes(centerAddress: string) {
  const nodes = [
    {
      id: centerAddress,
      label: centerAddress.slice(0, 8) + "...",
      color: "#ff6b6b",
      size: 30,
      font: { color: "#ffffff" },
    },
  ];

  // Add random connected nodes
  for (let i = 0; i < 15; i++) {
    const randomAddress = generateRandomAddress();
    nodes.push({
      id: randomAddress,
      label: randomAddress.slice(0, 8) + "...",
      color: i < 5 ? "#4ecdc4" : "#45b7d1",
      size: Math.random() * 20 + 10,
      font: { color: "#ffffff" },
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
      color: { color: "#ffffff", opacity: 0.7 },
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
        color: { color: "#ffffff", opacity: 0.5 },
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
    dates.push(date.toISOString().split("T")[0]);
  }

  return {
    overview: dates.map((date) => ({
      date,
      inflow: Math.random() * 10 + 1,
      outflow: Math.random() * 8 + 0.5,
      net: Math.random() * 4 - 2,
    })),
    inflow: dates.map((date) => ({
      date,
      amount: Math.random() * 10 + 1,
      transactions: Math.floor(Math.random() * 20) + 1,
    })),
    outflow: dates.map((date) => ({
      date,
      amount: Math.random() * 8 + 0.5,
      transactions: Math.floor(Math.random() * 15) + 1,
    })),
    timeline: generateMockTimelineData(),
  };
}

function generateMockTimelineData() {
  const data = [];
  const now = new Date();

  for (let i = 0; i < 24; i++) {
    const hour = new Date(now);
    hour.setHours(i, 0, 0, 0);
    data.push({
      time: hour.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      transactions: Math.floor(Math.random() * 50),
    });
  }

  return data;
}

function generateRandomAddress(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
  let result = "";
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateMockThreatAnalysis(
  address: string,
  riskScore: number,
  riskLevel: string,
) {
  const threats = [
    {
      threat_type: "Suspicious Transaction Pattern",
      reason:
        "High frequency of micro-transactions detected which may indicate automated trading or bot activity",
      confidence: riskScore > 70 ? "High" : riskScore > 40 ? "Medium" : "Low",
      supporting_evidence: {
        transaction_frequency: "Above average",
        transaction_amounts: "Consistently small values",
        time_pattern: "Regular intervals",
      },
      recommended_actions: [
        "Monitor transaction patterns for irregularities",
        "Verify legitimacy of trading activities",
        "Check for bot or automation indicators",
      ],
    },
  ];

  if (riskScore > 60) {
    threats.push({
      threat_type: "High Risk Score",
      reason:
        "Wallet has elevated risk indicators based on transaction history and connected addresses",
      confidence: "Medium",
      supporting_evidence: {
        transaction_frequency: "Multiple red flags detected",
        transaction_amounts: "Connected to flagged addresses",
        time_pattern: "Unusual volume patterns",
      },
      recommended_actions: [
        "Enhanced due diligence required",
        "Additional verification recommended",
        "Consider transaction limits",
      ],
    });
  }

  return {
    threat_analysis: {
      metadata: {
        target_address: address,
        chain: "Solana",
        analysis_timestamp: new Date().toISOString(),
        data_sources: [
          "SentrySol Security AI",
          "SentrySol Blockchain Analyzer",
          "SentrySol ML Model",
        ],
      },
      potential_threats: threats,
      overall_risk_level: riskLevel,
      risk_score: riskScore,
      risk_factors: [
        "Transaction frequency patterns",
        "Connected address analysis",
        "Token interaction patterns",
      ],
      ioc: {
        addresses: [address],
        transaction_signatures: [
          generateRandomSignature(),
          generateRandomSignature(),
        ],
        suspicious_mints: [],
        related_programs: [generateRandomAddress()],
      },
      additional_notes: `Analysis completed for address ${address}. Risk assessment based on transaction patterns, network analysis, and behavioral indicators.`,
    },
  };
}

function generateRandomSignature(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
  let result = "";
  for (let i = 0; i < 88; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateMockNFTs() {
  return [
    { name: "Solana Monkey #1234", symbol: "SMB" },
    { name: "DeGods #5678", symbol: "DEGOD" },
    { name: "Okay Bears #9012", symbol: "BEAR" },
  ].slice(0, Math.floor(Math.random() * 3) + 1);
}
