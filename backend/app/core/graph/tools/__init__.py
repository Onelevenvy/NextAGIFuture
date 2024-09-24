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
from .open_weather import open_weather_search_tool
from .human_tool import AskHuman


class SkillInfo(BaseModel):
    description: str
    tool: BaseTool
    icon: str = "🔧"


managed_skills: dict[str, SkillInfo] = {
    "duckduckgo-search": SkillInfo(
        description="Searches the web using DuckDuckGo",
        tool=DuckDuckGoSearchRun(),
        icon="🔍",
    ),
    "wikipedia": SkillInfo(
        description="Searches Wikipedia",
        tool=WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper()),
        icon="📖",  # type: ignore[call-arg]
    ),
    "yahoo-finance": SkillInfo(
        description="Get information from Yahoo Finance News",
        tool=YahooFinanceNewsTool(),
        icon="💰",
    ),
    "tavilysearch": SkillInfo(
        description="tavily search useful when searching for information on the internet",
        tool=TavilySearchResults(max_results=1),  # type: ignore[call-arg]
        icon="🔍",
    ),
    "calculator": SkillInfo(
        description=calculator.description, tool=calculator, icon="🧮"
    ),
    "openweathersearchtool": SkillInfo(
        description=open_weather_search_tool.description,
        tool=open_weather_search_tool,
        icon="🌞",
    ),
    "ask-human": SkillInfo(description=AskHuman.description, tool=AskHuman, icon="📖"),
}

# To add more custom tools, follow these steps:
# 1. Create a new Python file in the `skills` folder (e.g., `calculator.py`).
# 2. Define your tool. Refer to `calculator.py` or see https://python.langchain.com/v0.1/docs/modules/tools/custom_tools/
# 3. Import your new tool here and add it to the `managed_skills` dictionary above.
