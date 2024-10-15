from typing import Dict, Any


ZHIPUAI_CREDENTIALS = {
    "ZHIPUAI_API_KEY": {
        "type": "string",
        "description": "API key for zhipuai",
        "value": "",
    }
}


def get_credentials() -> Dict[str, Any]:

    return ZHIPUAI_CREDENTIALS
