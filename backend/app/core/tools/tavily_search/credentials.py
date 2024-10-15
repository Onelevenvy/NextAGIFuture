from typing import Dict, Any

TAVILY_CREDENTIALS = {
    "TAVILY_API_KEY": {
        "type": "string",
        "description": "API key for Tavily Search service",
        "value": ""
    }
}

def get_credentials() -> Dict[str, Any]:
    return TAVILY_CREDENTIALS
