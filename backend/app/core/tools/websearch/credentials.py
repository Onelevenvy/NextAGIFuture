from typing import Dict, Any

WEBSEARCH_CREDENTIALS = {
    "WEB_SEARCH_API_KEY": {
        "type": "string",
        "description": "API key for Web Search service, you can get the API key from https://open.bigmodel.cn/",
        "value": "",  # Initial value is an empty string
    }
}

def get_credentials() -> Dict[str, Any]:
    return WEBSEARCH_CREDENTIALS