import importlib
import os
from typing import Dict, Any

from langchain.pydantic_v1 import BaseModel
from langchain.tools import BaseTool
from langchain_community.tools import DuckDuckGoSearchRun, WikipediaQueryRun
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_community.utilities.wikipedia import WikipediaAPIWrapper


class ToolInfo(BaseModel):
    description: str
    tool: BaseTool
    display_name: str = "NO NAME PROVIDED"
    input_parameters: dict[str, Any] | None = None  # 用于保存输入参数


class ToolManager:
    def __init__(self):
        self.managed_tools: Dict[str, ToolInfo] = {}

    @staticmethod
    def format_tool_name(name: str) -> str:
        return name.replace("_", "-")
    @staticmethod
    def convert_to_input_parameters(inputs_dict):
        input_parameters = {}
        
        for key, value in inputs_dict.items():
            # 直接使用原始键和类型
            input_parameters[key] = value['type']
        
        return input_parameters



    def load_tools(self):
        tools_dir = os.path.dirname(os.path.abspath(__file__))
        for item in os.listdir(tools_dir):
            if os.path.isdir(os.path.join(tools_dir, item)) and not item.startswith(
                "__"
            ):
                try:
                    module = importlib.import_module(
                        f".{item}", package="app.core.tools"
                    )

                    # Check if __all__ is defined in the module
                    if hasattr(module, "__all__"):
                        for tool_name in module.__all__:
                            tool_instance = getattr(module, tool_name, None)
                            if isinstance(tool_instance, BaseTool):
                                formatted_name = self.format_tool_name(item)

                                inputs_dict = tool_instance.args
                                input_parameters = self.convert_to_input_parameters(inputs_dict)
                                self.managed_tools[formatted_name] = ToolInfo(
                                    description=tool_instance.description,
                                    tool=tool_instance,
                                    display_name=tool_instance.name,
                                    input_parameters=input_parameters,  # 保存输入参数
                                )
                            else:
                                print(
                                    f"Warning: {tool_name} in {item} is not an instance of BaseTool"
                                )
                    else:
                        print(f"Warning: {item} does not define __all__")

                except (ImportError, AttributeError) as e:
                    print(f"Failed to load tool {item}: {e}")

        # Load external tools
        self.load_external_tools()

    def load_external_tools(self):
        # Add external tools that can't be automatically loaded

        external_tools = {
            "duckduckgo-search": ToolInfo(
                description="Searches the web using DuckDuckGo.",
                tool=DuckDuckGoSearchRun(),
                display_name="DuckDuckGo",
                input_parameters={"query": "str"}
            ),
            "wikipedia": ToolInfo(
                description="Searches Wikipedia.",
                tool=WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper()),
                display_name="Wikipedia",
                  input_parameters={"query": "str"}
            ),
            "tavilysearch": ToolInfo(
                description="Tavily is useful when searching for information on the internet.",
                tool=TavilySearchResults(max_results=1),
                display_name="Tavily Search",
                  input_parameters={"query": "str"}
            ),
        }
        self.managed_tools.update(external_tools)

    def get_tools(self) -> Dict[str, ToolInfo]:
        return self.managed_tools


tool_manager = ToolManager()
tool_manager.load_tools()
managed_tools = tool_manager.get_tools()
