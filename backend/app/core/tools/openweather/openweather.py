import json
import os
from typing import TYPE_CHECKING

import requests
from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import StructuredTool

if TYPE_CHECKING:
    from sqlmodel import Session

from app.core.tools.utils import get_tool_credentials


class WeatherSearchInput(BaseModel):
    """Input for the weather search tool."""

    city: str = Field(description="city name")


def open_weather_qry(
    city: str,
    db: "Session",
) -> str:
    """
    invoke tools
    """
    credentials = get_tool_credentials(db, "openweather")
    appid = credentials.get("OPEN_WEATHER_API_KEY", "")

    if not appid:
        return "Error: OpenWeather API Key is not set."

    try:
        # request URL
        url = "https://api.openweathermap.org/data/2.5/weather"

        # request parmas
        params = {
            "q": city,
            "appid": appid,
            "units": "metric",
            "lang": "zh_cn",
        }
        response = requests.get(url, params=params)

        if response.status_code == 200:
            data = response.json()
            return data
        else:
            error_message = {
                "error": f"failed:{response.status_code}",
                "data": response.text,
            }
            # return error
            return json.dumps(error_message)

    except Exception as e:
        return json.dumps(f"OpenWeather API request failed. {e}")


openweather = StructuredTool.from_function(
    func=open_weather_qry,
    name="Open Weather",
    description="Useful for when you need to get weather information. Please provide city name in English.",
    args_schema=WeatherSearchInput,
    return_direct=True,
)
