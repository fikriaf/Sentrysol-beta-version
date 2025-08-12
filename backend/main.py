import os
import json
import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import httpx
import networkx as nx
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import requests
from langchain_mistralai import ChatMistralAI
from langchain.schema import HumanMessage

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="SentrySol Backend", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Mistral AI
mistral_llm = ChatMistralAI(
    model="ft:mistral-medium-latest:b319469f:20250807:b80c0dce",
    mistral_api_key=os.getenv("MISTRAL_API_KEY"),
    temperature=0.3
)

# Pydantic models
class WalletAnalysisRequest(BaseModel):
    address: str
    depth: Optional[int] = 3

class ChatMessage(BaseModel):
    message: str
    address: Optional[str] = None

class TransactionFlow(BaseModel):
    from_address: str
    to_address: str
    amount: float
    token: str
    signature: str
    timestamp: datetime

# API endpoints configuration
HELIUS_API_KEY = os.getenv("HELIUS_API_KEY")
CHAINABUSE_API_KEY = os.getenv("CHAINABUSE_API_KEY")
BLOCKSEC_API_KEY = os.getenv("BLOCKSEC_API_KEY")

class SolanaAnalyzer:
    def __init__(self):
        self.helius_url = f"https://api.helius.xyz/v0"
        self.session = httpx.AsyncClient()

    async def get_wallet_transactions(self, address: str, limit: int = 100) -> List[Dict]:
        """Get wallet transactions from Helius API"""
        try:
            url = f"{self.helius_url}/addresses/{address}/transactions"
            params = {
                "api-key": HELIUS_API_KEY,
                "limit": limit,
                "before": None
            }
            
            response = await self.session.get(url, params=params)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Helius API error: {response.status_code}")
                return []
        except Exception as e:
            logger.error(f"Error fetching transactions: {str(e)}")
            return []

    async def get_wallet_balance(self, address: str) -> Dict:
        """Get wallet balance and token holdings"""
        try:
            url = f"{self.helius_url}/addresses/{address}/balances"
            params = {"api-key": HELIUS_API_KEY}
            
            response = await self.session.get(url, params=params)
            if response.status_code == 200:
                return response.json()
            else:
                return {"native_balance": 0, "tokens": []}
        except Exception as e:
            logger.error(f"Error fetching balance: {str(e)}")
            return {"native_balance": 0, "tokens": []}

    async def analyze_transaction_patterns(self, transactions: List[Dict]) -> Dict:
        """Analyze transaction patterns for suspicious activity"""
        if not transactions:
            return {"risk_score": 0, "patterns": [], "suspicious_activities": []}

        # Analyze patterns
        patterns = {
            "total_transactions": len(transactions),
            "unique_counterparts": set(),
            "large_transactions": [],
            "rapid_transactions": [],
            "suspicious_timing": []
        }

        prev_time = None
        for tx in transactions:
            # Track unique counterparts
            if "accounts" in tx:
                for account in tx["accounts"]:
                    patterns["unique_counterparts"].add(account)

            # Check for large transactions (>1 SOL)
            if "native_transfers" in tx:
                for transfer in tx["native_transfers"]:
                    if transfer.get("amount", 0) > 1000000000:  # 1 SOL in lamports
                        patterns["large_transactions"].append(transfer)

            # Check for rapid transactions
            current_time = datetime.fromisoformat(tx["timestamp"].replace("Z", "+00:00"))
            if prev_time and (prev_time - current_time).total_seconds() < 60:
                patterns["rapid_transactions"].append(tx["signature"])
            prev_time = current_time

        patterns["unique_counterparts"] = len(patterns["unique_counterparts"])
        
        # Calculate risk score
        risk_score = min(100, (
            len(patterns["large_transactions"]) * 10 +
            len(patterns["rapid_transactions"]) * 5 +
            (50 if patterns["unique_counterparts"] > 100 else 0)
        ))

        return {
            "risk_score": risk_score,
            "patterns": patterns,
            "suspicious_activities": []
        }

    async def build_transaction_graph(self, address: str, transactions: List[Dict]) -> Dict:
        """Build a network graph of transaction flows"""
        G = nx.DiGraph()
        
        # Add center node
        G.add_node(address, type="main", label=f"{address[:8]}...")
        
        transaction_flows = []
        
        for tx in transactions:
            timestamp = datetime.fromisoformat(tx["timestamp"].replace("Z", "+00:00"))
            
            # Process native transfers
            if "native_transfers" in tx:
                for transfer in tx["native_transfers"]:
                    from_addr = transfer.get("fromUserAccount", "")
                    to_addr = transfer.get("toUserAccount", "")
                    amount = transfer.get("amount", 0) / 1e9  # Convert lamports to SOL
                    
                    if from_addr and to_addr:
                        # Add nodes if they don't exist
                        if not G.has_node(from_addr):
                            G.add_node(from_addr, type="external", label=f"{from_addr[:8]}...")
                        if not G.has_node(to_addr):
                            G.add_node(to_addr, type="external", label=f"{to_addr[:8]}...")
                        
                        # Add edge
                        edge_key = f"{from_addr}-{to_addr}"
                        if G.has_edge(from_addr, to_addr):
                            G[from_addr][to_addr]['weight'] += amount
                            G[from_addr][to_addr]['count'] += 1
                        else:
                            G.add_edge(from_addr, to_addr, weight=amount, count=1, type="transfer")
                        
                        # Track for flow analysis
                        transaction_flows.append({
                            "from_address": from_addr,
                            "to_address": to_addr,
                            "amount": amount,
                            "token": "SOL",
                            "signature": tx["signature"],
                            "timestamp": timestamp.isoformat(),
                            "type": "outflow" if from_addr == address else "inflow"
                        })

        # Convert graph to JSON format for frontend
        nodes = []
        edges = []
        
        for node_id, node_data in G.nodes(data=True):
            nodes.append({
                "id": node_id,
                "label": node_data.get("label", node_id),
                "type": node_data.get("type", "external"),
                "isMain": node_id == address
            })
        
        for from_node, to_node, edge_data in G.edges(data=True):
            edges.append({
                "from": from_node,
                "to": to_node,
                "weight": edge_data.get("weight", 0),
                "count": edge_data.get("count", 1),
                "type": edge_data.get("type", "transfer")
            })

        return {
            "nodes": nodes,
            "edges": edges,
            "transaction_flows": transaction_flows,
            "summary": {
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "total_volume": sum(edge["weight"] for edge in edges)
            }
        }

analyzer = SolanaAnalyzer()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/analyze/{address}")
async def analyze_wallet_stream(address: str):
    """Stream wallet analysis results"""
    async def generate():
        try:
            # Step 1: Initialize
            yield f"data: {json.dumps({'step': 1, 'status': 'Initializing analysis...', 'progress': 10})}\n\n"
            await asyncio.sleep(0.5)

            # Step 2: Fetch transactions
            yield f"data: {json.dumps({'step': 2, 'status': 'Fetching transaction history...', 'progress': 25})}\n\n"
            transactions = await analyzer.get_wallet_transactions(address, limit=100)
            await asyncio.sleep(0.5)

            # Step 3: Fetch balance
            yield f"data: {json.dumps({'step': 3, 'status': 'Analyzing wallet balance...', 'progress': 40})}\n\n"
            balance_data = await analyzer.get_wallet_balance(address)
            await asyncio.sleep(0.5)

            # Step 4: Pattern analysis
            yield f"data: {json.dumps({'step': 4, 'status': 'Analyzing transaction patterns...', 'progress': 60})}\n\n"
            pattern_analysis = await analyzer.analyze_transaction_patterns(transactions)
            await asyncio.sleep(0.5)

            # Step 5: Build transaction graph
            yield f"data: {json.dumps({'step': 5, 'status': 'Building transaction flow graph...', 'progress': 80})}\n\n"
            transaction_graph = await analyzer.build_transaction_graph(address, transactions)
            await asyncio.sleep(0.5)

            # Step 6: AI Analysis
            yield f"data: {json.dumps({'step': 6, 'status': 'Running AI security analysis...', 'progress': 95})}\n\n"
            
            # Prepare data for AI analysis
            analysis_prompt = f"""
            Analyze this Solana wallet for security risks:
            
            Address: {address}
            Transaction Count: {len(transactions)}
            Risk Score: {pattern_analysis['risk_score']}
            Balance: {balance_data.get('native_balance', 0)} lamports
            
            Transaction Patterns:
            - Large transactions: {len(pattern_analysis['patterns']['large_transactions'])}
            - Rapid transactions: {len(pattern_analysis['patterns']['rapid_transactions'])}
            - Unique counterparts: {pattern_analysis['patterns']['unique_counterparts']}
            
            Provide a security assessment with threat level (LOW/MEDIUM/HIGH) and recommendations.
            """
            
            try:
                ai_response = mistral_llm.invoke([HumanMessage(content=analysis_prompt)])
                ai_analysis = ai_response.content
            except Exception as e:
                logger.error(f"AI analysis error: {str(e)}")
                ai_analysis = "AI analysis unavailable. Manual review recommended."

            # Final results
            final_result = {
                'step': 7,
                'status': 'Analysis complete!',
                'progress': 100,
                'analysis_result': {
                    'wallet_address': address,
                    'risk_score': pattern_analysis['risk_score'],
                    'threat_level': 'LOW' if pattern_analysis['risk_score'] < 30 else 'MEDIUM' if pattern_analysis['risk_score'] < 70 else 'HIGH',
                    'ai_analysis': ai_analysis,
                    'transaction_count': len(transactions),
                    'balance': balance_data,
                    'patterns': pattern_analysis['patterns']
                },
                'transaction_graph': transaction_graph,
                'detailed_data': {
                    'wallet_info': {
                        'address': address,
                        'balance': balance_data.get('native_balance', 0),
                        'token_count': len(balance_data.get('tokens', []))
                    },
                    'transaction_summary': {
                        'total_transactions': len(transactions),
                        'recent_transactions': transactions[:10] if transactions else []
                    }
                }
            }
            
            yield f"data: {json.dumps(final_result)}\n\n"
            yield f"data: [DONE]\n\n"

        except Exception as e:
            logger.error(f"Analysis error: {str(e)}")
            error_result = {
                'step': -1,
                'status': f'Error: {str(e)}',
                'progress': 0,
                'error': True
            }
            yield f"data: {json.dumps(error_result)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/chat/analyze")
async def chat_analyze_address(chat_request: ChatMessage):
    """Chat-based address analysis"""
    try:
        message = chat_request.message
        address = chat_request.address
        
        # Use AI to understand the user's intent
        chat_prompt = f"""
        User message: "{message}"
        Wallet address (if provided): {address or 'Not provided'}
        
        The user is asking about Solana wallet analysis. Provide a helpful response about:
        1. What analysis can be performed
        2. Security insights about the address (if provided)
        3. Suggestions for further investigation
        
        Keep the response conversational and helpful.
        """
        
        ai_response = mistral_llm.invoke([HumanMessage(content=chat_prompt)])
        
        # If an address was provided, get quick analysis
        quick_analysis = None
        if address:
            transactions = await analyzer.get_wallet_transactions(address, limit=20)
            pattern_analysis = await analyzer.analyze_transaction_patterns(transactions)
            quick_analysis = {
                "recent_transactions": len(transactions),
                "risk_score": pattern_analysis["risk_score"],
                "address": address
            }
        
        return {
            "response": ai_response.content,
            "quick_analysis": quick_analysis,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Chat analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/transaction-flow/{address}")
async def get_transaction_flow(address: str, limit: int = 50):
    """Get detailed transaction flow for visualization"""
    try:
        transactions = await analyzer.get_wallet_transactions(address, limit=limit)
        transaction_graph = await analyzer.build_transaction_graph(address, transactions)
        
        # Separate inflow and outflow
        inflow_transactions = [
            flow for flow in transaction_graph["transaction_flows"] 
            if flow["type"] == "inflow"
        ]
        outflow_transactions = [
            flow for flow in transaction_graph["transaction_flows"] 
            if flow["type"] == "outflow"
        ]
        
        return {
            "address": address,
            "graph_data": transaction_graph,
            "inflow_transactions": inflow_transactions,
            "outflow_transactions": outflow_transactions,
            "summary": {
                "total_inflow": sum(tx["amount"] for tx in inflow_transactions),
                "total_outflow": sum(tx["amount"] for tx in outflow_transactions),
                "inflow_count": len(inflow_transactions),
                "outflow_count": len(outflow_transactions)
            }
        }
        
    except Exception as e:
        logger.error(f"Transaction flow error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
