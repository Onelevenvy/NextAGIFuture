from typing import Dict, Any

OPENWEATHER_CREDENTIALS = {
    "OPEN_WEATHER_API_KEY": {
        "type": "string",
        "description": "API key for OpenWeather service"
    }
}

def get_credentials() -> Dict[str, Any]:
    return OPENWEATHER_CREDENTIALS
