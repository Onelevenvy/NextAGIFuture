import importlib
import os
from typing import Dict

from langchain.pydantic_v1 import BaseModel
from langchain.tools import BaseTool

class ToolInfo(BaseModel):
    description: str
    tool: BaseTool
    icon: str = "default.svg"  # Default to a generic SVG icon

def load_tools() -> Dict[str, ToolInfo]:
    tools = {}
    skills_dir = os.path.dirname(__file__)
    
    for item in os.listdir(skills_dir):
        item_path = os.path.join(skills_dir, item)
        if os.path.isdir(item_path) and not item.startswith('__'):
            try:
                module = importlib.import_module(f'.{item}', package='app.core.graph.tools')
                
                for attr_name in dir(module):
                    attr = getattr(module, attr_name)
                    if isinstance(attr, BaseTool) or (isinstance(attr, type) and issubclass(attr, BaseTool)):
                        tool_name = item.replace('_', '-').lower()
                        description = getattr(attr, 'description', f"Tool for {tool_name}")
                        
                        # Check for an SVG icon file
                        icon_path = os.path.join(item_path, "icon.svg")
                        if os.path.exists(icon_path):
                            icon = f"{item}/icon.svg"
                        else:
                            icon = "default.svg"  # Use a default icon if no specific icon is found
                        
                        tools[tool_name] = ToolInfo(description=description, tool=attr, icon=icon)
                        break  # Assume one tool per module
            except ImportError:
                print(f"Failed to import module: {item}")

    return tools

managed_tools = load_tools()