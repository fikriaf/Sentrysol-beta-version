import json
import time

def summarize_tx_for_llm(tx_json):
    s = {}
    s["signature"] = tx_json.get("signature") or tx_json.get("txHash") or tx_json.get("id")
    s["blockTime"] = tx_json.get("blockTime")
    s["instructions"] = tx_json.get("instructions") or tx_json.get("parsed", {}).get("instructions") or []
    s["tokenTransfers"] = tx_json.get("tokenTransfers") or []
    s["accounts"] = tx_json.get("accounts") or tx_json.get("accountKeys") or []
    s["raw"] = tx_json
    return s

def aggregate_context(helius_txs, metasleuth_score, target_address, extra_notes=None):
    summarized = [summarize_tx_for_llm(tx) for tx in helius_txs]
    context = {
        "target_address": target_address,
        "helix_tx_count": len(summarized),
        "txs": summarized,
        "metasleuth": metasleuth_score,
        "notes": extra_notes,
        "fetched_at": int(time.time())
    }
    return json.dumps(context, indent=2, default=str)
