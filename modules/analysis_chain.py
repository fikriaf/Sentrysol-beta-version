import os
from datetime import datetime
from langchain_mistralai.chat_models import ChatMistralAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

LLM_MODEL = os.getenv("LLM_MODEL", "mistral-medium")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

prompt_template = PromptTemplate(
    input_variables=["context"],
    template="""You are a blockchain threat intelligence analyst specializing in detecting malicious wallet activities.

Analyze the following combined JSON data from Helius & Metasleuth APIs:

{context}

TASKS:
1. Identify all potential threats (e.g., phishing, scam, dusting, spoofing, approval exploits, rug pulls, laundering patterns).
2. For each threat:
   - threat_type
   - reason (detailed and specific)
   - confidence (Low, Medium, High)
   - supporting_evidence
   - recommended_actions
3. Provide overall_risk_level ( **minimal, low, medium, high, critical** ), risk_score ( **scale 100** ), risk_factors, ioc, and additional_notes.

Respond in valid JSON only.

FORMAT:
{{
  "threat_analysis": {{
    "metadata": {{
      "target_address": "...",
      "chain": "Solana",
      "analysis_timestamp": "{timestamp}",
      "data_sources": ["SentrySol Security AI", "SentrySol Blockchain Analyzer", "SentrySol ML Model"]
    }},
    "potential_threats": [...],
    "overall_risk_level": "...",
    "risk_score": ...,
    "risk_factors": [...],
    "ioc": {{
      "addresses": [...],
      "transaction_signatures": [...],
      "suspicious_mints": [...],
      "related_programs": [...]
    }},
    "additional_notes": "..."
  }}
}}
"""
)


def run_analysis(context: str):
    try:
        llm = ChatMistralAI(
            model=LLM_MODEL, mistral_api_key=MISTRAL_API_KEY, temperature=0
        )
        chain = LLMChain(llm=llm, prompt=prompt_template)
        local_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return chain.run(context=context, timestamp=local_timestamp)
    except Exception as e:
        return f"Error with Mistral AI: {str(e)}"
