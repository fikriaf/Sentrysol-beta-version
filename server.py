from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import asyncio
import os
from dotenv import load_dotenv
from modules.helius_api import (
    fetch_transaction,
    fetch_address_history,
    fetch_token_metadata,
    fetch_nft_metadata,
    fetch_balance_changes,
    resolve_address_name,
    fetch_webhook_events,
    get_signatures_for_address,
)
from modules.metasleuth_api import fetch_wallet_score
from modules.preprocess import aggregate_context
from modules.analysis_chain import run_analysis

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="SentrySol Backend API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
HELIUS_API_KEY = os.getenv("HELIUS_API_KEY")
METASLEUTH_API_KEY = os.getenv("METASLEUTH_API_KEY")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL")

# Pydantic models
class ChatMessage(BaseModel):
    message: str
    address: str = None

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T12:00:00Z",
        "services": {
            "helius_api": "connected" if HELIUS_API_KEY else "disconnected",
            "metasleuth_api": "connected" if METASLEUTH_API_KEY else "disconnected",
            "mistral_ai": "connected" if MISTRAL_API_KEY else "disconnected"
        }
    }

# Streaming analysis endpoint
@app.get("/analyze/{address}")
async def analyze_wallet_stream(address: str):
    """Stream wallet analysis results using Server-Sent Events"""
    
    # Validate address format
    if len(address) < 32 or len(address) > 44:
        raise HTTPException(status_code=400, detail="Invalid Solana address format")
    
    async def generate_analysis():
        try:
            # Step 1: Fetch address history
            yield f"data: {json.dumps({'step': 1, 'status': 'Fetching address history...', 'progress': 10})}\n\n"
            await asyncio.sleep(0.1)

            address_history = fetch_address_history(address, limit=20, enriched=True)
            transaction_count = len(address_history.get('result', []))
            yield f"data: {json.dumps({'step': 1, 'status': 'Address history fetched', 'progress': 15, 'data': {'transactions_count': transaction_count}})}\n\n"

            # Step 2: Get signatures
            yield f"data: {json.dumps({'step': 2, 'status': 'Getting transaction signatures...', 'progress': 25})}\n\n"
            await asyncio.sleep(0.1)

            signatures = get_signatures_for_address(address, limit=10)
            signatures_count = len(signatures.get('result', []))
            yield f"data: {json.dumps({'step': 2, 'status': 'Signatures retrieved', 'progress': 35, 'data': {'signatures_count': signatures_count}})}\n\n"

            # Step 3: Fetch token and NFT metadata
            yield f"data: {json.dumps({'step': 3, 'status': 'Analyzing token transfers...', 'progress': 45})}\n\n"
            await asyncio.sleep(0.1)

            token_meta = []
            nft_meta = []

            # Process token transfers from address history
            if address_history.get("result") and isinstance(address_history["result"], list):
                for tx in address_history["result"]:
                    if isinstance(tx, dict) and tx.get("tokenTransfers"):
                        for token in tx.get("tokenTransfers", []):
                            mint = token.get("mint")
                            if mint:
                                try:
                                    token_metadata = fetch_token_metadata(mint)
                                    token_meta.append(token_metadata)

                                    # Check if it's an NFT (decimals = 0)
                                    if token_metadata and token_metadata.get("decimals") == 0:
                                        nft_metadata = fetch_nft_metadata(mint)
                                        if nft_metadata:
                                            nft_meta.append(nft_metadata)
                                except Exception as e:
                                    print(f"Error fetching metadata for {mint}: {e}")

            yield f"data: {json.dumps({'step': 3, 'status': 'Token and NFT metadata collected', 'progress': 55, 'data': {'tokens_analyzed': len(token_meta), 'nfts_found': len(nft_meta)}})}\n\n"

            # Step 4: Get wallet risk score
            yield f"data: {json.dumps({'step': 4, 'status': 'Calculating wallet risk score...', 'progress': 65})}\n\n"
            await asyncio.sleep(0.1)

            try:
                wallet_score = fetch_wallet_score(address)
            except Exception as e:
                print(f"Error fetching wallet score: {e}")
                wallet_score = {"risk_score": 0, "error": str(e)}

            yield f"data: {json.dumps({'step': 4, 'status': 'Wallet score calculated', 'progress': 75, 'data': {'wallet_score': wallet_score}})}\n\n"

            # Step 5: Gather additional data
            yield f"data: {json.dumps({'step': 5, 'status': 'Gathering additional data...', 'progress': 80})}\n\n"
            await asyncio.sleep(0.1)

            # Get additional data
            tx_details = {}
            if signatures.get("result") and len(signatures["result"]) > 0:
                try:
                    tx_details = fetch_transaction(signatures["result"][0]["signature"])
                except Exception as e:
                    print(f"Error fetching transaction details: {e}")

            try:
                balance_changes = fetch_balance_changes(address)
            except Exception as e:
                print(f"Error fetching balance changes: {e}")
                balance_changes = {}

            try:
                address_name = resolve_address_name(address)
            except Exception as e:
                print(f"Error resolving address name: {e}")
                address_name = "Unknown"

            try:
                webhook_events = fetch_webhook_events([address], limit=5)
            except Exception as e:
                print(f"Error fetching webhook events: {e}")
                webhook_events = {}

            yield f"data: {json.dumps({'step': 5, 'status': 'Additional data gathered', 'progress': 85, 'data': {'address_name': 'Unknown', 'balance_changes_count': 1}})}\n\n"

            # Step 6: Aggregate context
            yield f"data: {json.dumps({'step': 6, 'status': 'Aggregating context for analysis...', 'progress': 90})}\n\n"
            await asyncio.sleep(0.1)

            # Prepare transaction data
            tx_list = []
            if tx_details:
                tx_list.append(tx_details)
            if address_history.get("result") and isinstance(address_history["result"], list):
                tx_list.extend(address_history["result"])

            context = aggregate_context(
                helius_txs=tx_list,
                metasleuth_score=wallet_score,
                target_address=address,
                extra_notes="Real-time streaming analysis with Python backend",
            )

            # Step 7: Run AI analysis
            yield f"data: {json.dumps({'step': 7, 'status': 'Running AI analysis...', 'progress': 95})}\n\n"
            await asyncio.sleep(0.1)

            # Run Mistral AI analysis
            try:
                analysis_result = run_analysis(context)
            except Exception as e:
                print(f"Error running AI analysis: {e}")
                analysis_result = f"Error with AI analysis: {str(e)}"

            # Parse result if it's a JSON string
            parsed_result = analysis_result
            if isinstance(analysis_result, str):
                try:
                    if analysis_result.strip().startswith("{") or "```json" in analysis_result:
                        # Remove markdown formatting if present
                        clean_result = analysis_result
                        if "```json\n" in analysis_result:
                            clean_result = analysis_result.split("```json\n")[1].split("\n```")[0]
                        elif "```\n" in analysis_result:
                            clean_result = analysis_result.split("```\n")[1].split("\n```")[0]
                        
                        parsed_result = json.loads(clean_result)
                except (json.JSONDecodeError, IndexError) as e:
                    print(f"Could not parse AI result as JSON: {e}")
                    # Keep original result as string

            # Final result
            final_data = {
                "step": 8,
                "status": "Analysis complete",
                "progress": 100,
                "analysis_result": parsed_result,
                "detailed_data": {
                    "wallet_info": {
                        "address": address,
                        "address_name": "Unknown",
                        "risk_score": wallet_score,
                    },
                    "transaction_summary": {
                        "total_transactions": transaction_count,
                        "recent_signatures": signatures_count,
                        "balance_changes": balance_changes,
                    },
                    "token_analysis": {
                        "tokens_found": len(token_meta),
                        "token_metadata": token_meta[:5] if token_meta else [],
                        "nfts_found": len(nft_meta),
                        "nft_metadata": nft_meta[:3] if nft_meta else [],
                    },
                    "webhook_events": webhook_events,
                },
            }

            yield f"data: {json.dumps(final_data, ensure_ascii=False)}\n\n"
            yield f"data: [DONE]\n\n"

        except Exception as e:
            error_data = {
                "step": -1,
                "status": f"Analysis failed: {str(e)}",
                "progress": 0,
                "error": str(e)
            }
            yield f"data: {json.dumps(error_data)}\n\n"

    return StreamingResponse(
        generate_analysis(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )

# Chat endpoint
@app.post("/chat")
async def chat_analysis(message: ChatMessage):
    """Handle chat-based wallet analysis requests"""
    try:
        # Mock AI response for now - you can enhance this
        responses = [
            f"Analyzing address {message.address or 'provided'}...",
            "Based on the transaction patterns, this appears to be a normal trading wallet.",
            "The wallet shows regular DeFi interactions with no major red flags.",
            "Risk assessment indicates low to moderate risk level.",
            "Recommendation: Monitor for unusual activity patterns."
        ]
        
        import random
        response = random.choice(responses)
        
        return {
            "response": response,
            "analysis": {
                "address": message.address or "No address provided",
                "risk_level": "low",
                "confidence": 0.85
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat analysis failed: {str(e)}")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "SentrySol Backend API is running",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "analyze": "/analyze/{address}",
            "chat": "/chat"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
