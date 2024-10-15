from typing import Dict, Any

SPARK_CREDENTIALS = {
    "SPARK_APPID": {
        "type": "string",
        "description": "App ID for Spark service"
    },
    "SPARK_APISECRET": {
        "type": "string",
        "description": "API Secret for Spark service"
    },
    "SPARK_APIKEY": {
        "type": "string",
        "description": "API Key for Spark service"
    }
}

def get_credentials() -> Dict[str, Any]:
    return SPARK_CREDENTIALS
