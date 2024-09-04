import json

import requests

from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import StructuredTool


class WeatherSearchInput(BaseModel):
    """Input for the weather search tool."""

    city: str = Field(description="city name")


def openweather(
    city: str,
    appid: str = "5034ed07854c2f7eba404af204aa6599",
    units: str = "metric",
    lang: str = "zh_cn",
):
    """
    invoke tools
    """

    try:
        # request URL
        url = "https://api.openweathermap.org/data/2.5/weather"

        # request parmas
        params = {
            "q": city,
            "appid": appid,
            "units": units,
            "lang": lang,
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
        return json.dumps(f"Openweather API Key is invalid. {e}")


open_weather_search_tool = StructuredTool.from_function(
    func=openweather,
    name="openweather",
    description="Useful for when you neet to get weather information. Please provide city name in English.",
    args_schema=WeatherSearchInput,
    return_direct=True,
)
