from typing import Annotated

from langchain_core.tools import tool


@tool
def ask_human(query: Annotated[str, "query to ask the human"]) -> None:
    """Ask the human a question to gather additional inputs"""
