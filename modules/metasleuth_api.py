import os, json
import requests

from dotenv import load_dotenv
load_dotenv()

METASLEUTH_API_KEY = os.getenv("METASLEUTH_API_KEY")
REQUEST_TIMEOUT = 15
HEADERS_METASLEUTH = {
    "Content-Type": "application/json",
    "x-api-key": METASLEUTH_API_KEY,
}


def fetch_wallet_score(wallet_addr: str):
    # Deteksi chain berdasarkan format address
    if wallet_addr.startswith("0x") and len(wallet_addr) == 42:
        chain_id = 1
    elif len(wallet_addr) == 44:
        chain_id = -3
    else:
        raise ValueError("Unsupported wallet address format")
    
    print(chain_id)
    response = requests.post(
        "https://aml.blocksec.com/address-compliance/api/v3/risk-score",
        headers={"API-KEY":METASLEUTH_API_KEY,"Content-Type":"application/json"},
        data=json.dumps({
        "chain_id": chain_id,
        "address": wallet_addr,
        "interaction_risk": True
        })
    )

    data = response.json()
    return data
