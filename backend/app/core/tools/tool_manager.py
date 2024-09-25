import importlib
import os
from typing import Dict

from langchain.pydantic_v1 import BaseModel
from langchain.tools import BaseTool


class ToolInfo(BaseModel):
    description: str
    tool: BaseTool
    icon: str = "🔧"


class ToolManager:
    def __init__(self):
        self.managed_tools: Dict[str, ToolInfo] = {}

    @staticmethod
    def format_tool_name(name: str) -> str:
        return name.replace("_", "-")

    def load_tools(self):
        tools_dir = os.path.dirname(os.path.abspath(__file__))
        for item in os.listdir(tools_dir):
            if os.path.isdir(os.path.join(tools_dir, item)) and not item.startswith(
                "__"
            ):
                try:
                    module = importlib.import_module(
                        f".{item}.{item}", package="app.core.tools"
                    )
                    # Try to get the tool instance directly
                    tool_instance = getattr(module, item)
                    if isinstance(tool_instance, BaseTool):
                        formatted_name = self.format_tool_name(item)
                        self.managed_tools[formatted_name] = ToolInfo(
                            description=tool_instance.description,
                            tool=tool_instance,
                            icon=getattr(tool_instance, "icon", "🔧"),
                        )

                    else:
                        print(f"Warning: {item} is not an instance of BaseTool")
                except (ImportError, AttributeError) as e:
                    print(f"Failed to load tool {item}: {e}")

        # Load external tools
        self.load_external_tools()

    def load_external_tools(self):
        # Add external tools that can't be automatically loaded
        from langchain_community.tools import DuckDuckGoSearchRun, WikipediaQueryRun
        from langchain_community.tools.tavily_search import TavilySearchResults
        from langchain_community.utilities.wikipedia import WikipediaAPIWrapper

        external_tools = {
            "duckduckgo-search": ToolInfo(
                description="Searches the web using DuckDuckGo",
                tool=DuckDuckGoSearchRun(),
                icon="🔍",
            ),
            "wikipedia": ToolInfo(
                description="Searches Wikipedia",
                tool=WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper()),
                icon="📖",
            ),
            "tavilysearch": ToolInfo(
                description="tavily search useful when searching for information on the internet",
                tool=TavilySearchResults(max_results=1),
                icon="🔍",
            ),
        }
        self.managed_tools.update(external_tools)

    def get_tools(self) -> Dict[str, ToolInfo]:
        return self.managed_tools


tool_manager = ToolManager()
tool_manager.load_tools()
managed_tools = tool_manager.get_tools()
