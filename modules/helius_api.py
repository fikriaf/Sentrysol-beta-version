import os, json
import requests
from dotenv import load_dotenv

load_dotenv()

HELIUS_API_KEY = os.getenv("HELIUS_API_KEY")
REQUEST_TIMEOUT = 15

if not HELIUS_API_KEY:
    raise RuntimeError("HELIUS_API_KEY not found in .env")

RPC_URL = f"https://mainnet.helius-rpc.com/?api-key={HELIUS_API_KEY}"


# 1. Transaction detail
def fetch_transaction(signature: str):
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getTransaction",
        "params": [
            signature,
            { "commitment": "finalized" },
        ],
    }
    r = requests.post(RPC_URL, json=payload, timeout=REQUEST_TIMEOUT)
    r.raise_for_status()
    return r.json()


# 2. Address history (getSignaturesForAddress)
def fetch_address_history(address: str, limit: int = 50, enriched: bool = True):
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getSignaturesForAddress",
        "params": [address, {"limit": limit}],
    }
    r = requests.post(RPC_URL, json=payload, timeout=REQUEST_TIMEOUT)
    r.raise_for_status()
    return r.json()


# 3. Token accounts by owner
def fetch_token_metadata(owner_address: str):
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getTokenAccountsByOwner",
        "params": [
            owner_address,
            {"programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},
            {"encoding": "jsonParsed"},
        ],
    }
    r = requests.post(RPC_URL, json=payload, timeout=REQUEST_TIMEOUT)
    r.raise_for_status()
    return r.json()


def fetch_nft_metadata(owner_address: str):
    payload = {
    "jsonrpc": "2.0",
    "id": "1",
    "method": "getAssetsByOwner",
    "params": {
        "ownerAddress": owner_address,
        "page": 1,
        "limit": 50,
        "sortBy": {
            "sortBy": "created",
            "sortDirection": "asc"
        },
        "options": {
            "showUnverifiedCollections": False,
            "showCollectionMetadata": False,
            "showGrandTotal": False,
            "showFungible": False,
            "showNativeBalance": False,
            "showInscription": False,
            "showZeroBalance": False
        }
    }
}
    r = requests.post(RPC_URL, json=payload, timeout=REQUEST_TIMEOUT)
    r.raise_for_status()
    return r.json()


def fetch_balance_changes(address: str):
    payload = {"jsonrpc": "2.0", "id": 1, "method": "getBalance", "params": [address]}
    r = requests.post(RPC_URL, json=payload, timeout=REQUEST_TIMEOUT)
    r.raise_for_status()
    return r.json()


def resolve_address_name(address: str):
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getAccountInfo",
        "params": [address, {"encoding": "jsonParsed"}],
    }
    r = requests.post(RPC_URL, json=payload, timeout=REQUEST_TIMEOUT)
    r.raise_for_status()
    return r.json()


def fetch_webhook_events(addresses: list, limit: int = 50):
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getMultipleAccounts",
        "params": [addresses[:limit], {"encoding": "jsonParsed"}],
    }
    r = requests.post(RPC_URL, json=payload, timeout=REQUEST_TIMEOUT)
    r.raise_for_status()
    return r.json()

def get_signatures_for_address(address: str, limit: int = 10):
    
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getSignaturesForAddress",
        "params": [address, {"limit": limit}],
    }
    r = requests.post(RPC_URL, json=payload, timeout=REQUEST_TIMEOUT)
    r.raise_for_status()
    return r.json()

def get_token_account(address: str):
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getTokenAccounts",
        "params": {"owner": address, "limit": 1}
    }
    r = requests.post(RPC_URL, json=payload, timeout=REQUEST_TIMEOUT)
    r.raise_for_status()
    return r.json()

def save_json(data, filename):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[SAVED] {filename}")
    
if __name__ == "__main__":

    test_address = "86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY"

    # 1. Get Signatures
    sigs_resp = get_signatures_for_address(test_address, limit=1)
    save_json(sigs_resp, "signatures.json")
    if not sigs_resp.get("result"):
        print("Tidak ada transaksi ditemukan."); exit()
    first_signature = sigs_resp["result"][0]["signature"]

    # 2. Transaction Detail
    save_json(fetch_transaction(first_signature), "transaction_detail.json")

    # 3. Address History
    save_json(fetch_address_history(test_address, limit=5), "address_history.json")

    # 4. Token Metadata
    save_json(fetch_token_metadata(test_address), "token_metadata.json")

    # 5. NFT Metadata
    save_json(fetch_nft_metadata(test_address), "nft_metadata.json")

    # 6. Balance
    save_json(fetch_balance_changes(test_address), "balance.json")

    # 7. Account Info
    save_json(resolve_address_name(test_address), "account_info.json")

    # 8. Webhook Events (dummy: hanya 1 address)
    save_json(fetch_webhook_events([test_address]), "webhook_events.json")

    # 9. Token Account
    save_json(get_token_account(test_address), "token_account.json")
