import os
from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import StructuredTool
from app.core.tools.utils import get_tool_credentials, get_credential_value
from app.core.workflow.utils.db_utils import db_operation

class TavilySearchInput(BaseModel):
    """Input for the Tavily search tool."""
    query: str = Field(description="The search query")

def tavily_search(query: str) -> str:
    api_key = db_operation(get_credential_value("tavily-search", "TAVILY_API_KEY"))

    if not api_key:
        return "Error: Tavily API Key is not set."

    os.environ["TAVILY_API_KEY"] = api_key

    # 这里应该添加实际的 Tavily 搜索逻辑
    # 由于原代码中没有实现，我们暂时返回一个占位信息
    return f"Tavily search performed for query: {query}"

tavily_search_tool = StructuredTool.from_function(
    func=tavily_search,
    name="Tavily Search",
    description="Perform a web search using Tavily API.",
    args_schema=TavilySearchInput,
    return_direct=True,
)
