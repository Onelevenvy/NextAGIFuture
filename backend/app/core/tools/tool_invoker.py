  # 导入自定义响应模型
from app.core.workflow.build_workflow import get_tool
from langgraph.prebuilt import ToolNode
from langchain_core.messages import AIMessage
import uuid
from pydantic import BaseModel
from typing import List, Optional

class ToolMessages(BaseModel):
    content: str
    name: str
    tool_call_id: str

class ToolInvokeResponse(BaseModel):
    messages: List[ToolMessages]
    error: Optional[str] = None  # 可选的错误信息
def invoke_tool(tool_name: str, args: dict) -> ToolInvokeResponse:
    """
    Invoke a tool by name with the provided arguments.
    """
    tool_call_id = str(uuid.uuid4())

    # Create the AIMessage for the tool call
    message_with_tool_call = AIMessage(
        content="",
        tool_calls=[
            {
                "name": tool_name,
                "args": args,
                "id": tool_call_id,
                "type": "tool_call",
            }
        ],
    )

    try:
       
        tool_node = ToolNode(tools=[get_tool(tool_name)])  # 确保 get_tool 函数可用
        result = tool_node.invoke({"messages": [message_with_tool_call]})

       
        messages = [
            ToolMessages(
                content=msg.content,
                name=msg.name,
                tool_call_id=msg.tool_call_id,
            )
            for msg in result["messages"]
        ]
        return ToolInvokeResponse(messages=messages)  # 返回自定义响应模型
    except Exception as e:
        # 返回易于识别的错误信息
        return ToolInvokeResponse(messages=[], error=str(e))