import os

from langchain.pydantic_v1 import BaseModel
from langchain.tools import BaseTool
from langchain_community.tools import DuckDuckGoSearchRun, WikipediaQueryRun
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_community.tools.yahoo_finance_news import YahooFinanceNewsTool
from langchain_community.utilities import (
    WikipediaAPIWrapper,
)
from .calculator import calculator
from .open_weather import open_weather_search
from .human_tool import AskHuman
from .google_translate import google_tanslate

# Add more tools here


class ToolInfo(BaseModel):
    description: str
    tool: BaseTool
    icon: str = "🔧"


managed_tools: dict[str, ToolInfo] = {
    "duckduckgo-search": ToolInfo(
        description="Searches the web using DuckDuckGo",
        tool=DuckDuckGoSearchRun(),
        icon="🔍",
    ),
    "wikipedia": ToolInfo(
        description="Searches Wikipedia",
        tool=WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper()),
        icon="📖",  # type: ignore[call-arg]
    ),
    "yahoo-finance": ToolInfo(
        description="Get information from Yahoo Finance News",
        tool=YahooFinanceNewsTool(),
        icon="💰",
    ),
    "tavilysearch": ToolInfo(
        description="tavily search useful when searching for information on the internet",
        tool=TavilySearchResults(max_results=1),  # type: ignore[call-arg]
        icon="🔍",
    ),
    "calculator": ToolInfo(
        description=calculator.description, tool=calculator, icon="🧮"
    ),
    "openweather-search": ToolInfo(
        description=open_weather_search.description,
        tool=open_weather_search,
        icon="🌞",
    ),
    "ask-human": ToolInfo(description=AskHuman.description, tool=AskHuman, icon="📖"),
    "google-translate": ToolInfo(
        description=google_tanslate.description,
        tool=google_tanslate,
        icon="📖",
    ),
}


# from .tool_manager import managed_skills

# # You can still import specific tools if needed
# from .calculator import calculator
# from .open_weather import open_weather_search
# from .human_tool import AskHuman
# from .google_translate import google_tanslate

# # Add any additional imports or configurations here
# ├── __init__.py
# ├── tool_manager.py
# ├── calculator/
# │   ├── __init__.py
# │   ├── calculator.py
# │   └── icon.svg
# ├── open_weather/
# │   ├── __init__.py
# │   ├── open_weather.py
# │   └── icon.svg
# ├── human_tool/
# │   ├── __init__.py
# │   ├── human_tool.py
# │   └── icon.svg
# ├── google_translate/
# │   ├── __init__.py
# │   ├── google_translate.py
# │   └── icon.svg
# └── ...
