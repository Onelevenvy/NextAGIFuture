from typing import Dict, Any

QINGYAN_ASSISTANT_CREDENTIALS = {
    "QINGYAN_ASSISTANT_API_KEY": {
        "type": "string",
        "description": "API key for Qingyan Assistant service, you can get the API key from https://open.bigmodel.cn/",
        "value": "",  # Initial value is an empty string
    }
}

def get_credentials() -> Dict[str, Any]:
    return QINGYAN_ASSISTANT_CREDENTIALS
