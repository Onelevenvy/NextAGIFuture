import json
from typing import Any

from langchain_core.documents import Document
from langchain_core.messages import (
    AIMessage,
    AIMessageChunk,
    HumanMessage,
    HumanMessageChunk,
    ToolCall,
    ToolMessage,
    ToolMessageChunk,
)
from langchain_core.runnables.schema import StreamEvent
from pydantic import BaseModel


class ChatResponse(BaseModel):
    type: str  # ai | human | tool
    id: str
    name: str
    content: str | None = None
    tool_calls: list[ToolCall] | None = None
    tool_output: str | None = None
    documents: str | None = None
    next: str | None = None


def get_message_type(message: Any) -> str | None:
    """Return the message's type"""
    if isinstance(message, HumanMessage) or isinstance(message, HumanMessageChunk):
        return "human"
    elif isinstance(message, AIMessage) or isinstance(message, AIMessageChunk):
        return "ai"
    elif isinstance(message, ToolMessage) or isinstance(message, ToolMessageChunk):
        return "tool"
    else:
        return None


def event_to_response(event: StreamEvent) -> ChatResponse | None:
    """Convert event to ChatResponse"""
    kind = event["event"]
    id = event["run_id"]
    if kind == "on_chat_model_stream":
        name = event["metadata"]["langgraph_node"]
        message_chunk: AIMessageChunk = event["data"]["chunk"]
        type = get_message_type(message_chunk)
        content: str = ""
        if isinstance(message_chunk.content, list):
            for c in message_chunk.content:
                if isinstance(c, str):
                    content += c
                elif isinstance(c, dict):
                    content += c.get("text", "")
        else:
            content = message_chunk.content
        tool_calls = message_chunk.tool_calls
        if content and type:
            return ChatResponse(
                type=type, id=id, name=name, content=content, tool_calls=tool_calls
            )
    elif kind == "on_chat_model_end":
        message: AIMessage = event["data"]["output"]
        name = event["metadata"]["langgraph_node"]
        tool_calls = message.tool_calls
        if tool_calls:
            return ChatResponse(
                type="tool",
                id=id,
                name=name,
                tool_calls=tool_calls,
            )

    elif kind == "on_tool_end":
        tool_output: ToolMessage | None = event["data"].get("output")
        tool_name = event["name"]
        # If tool is , KnowledgeBase then serialise the documents in artifact
        documents: list[dict[str, Any]] = []
        if tool_output and tool_output.name == "KnowledgeBase":
            docs: list[Document] = tool_output.artifact
            for doc in docs:
                documents.append(
                    {
                        "score": doc.metadata["score"],
                        "content": doc.page_content,
                    }
                )
        if tool_output:
            return ChatResponse(
                type="tool",
                id=id,
                name=tool_name,
                tool_output=json.dumps(tool_output.content),
                documents=json.dumps(documents),
            )
    # elif kind == "on_parser_end":
    #     content: str = event["data"]["output"].get("task")
    #     next = event["data"]["output"].get("next")
    #     name = event["metadata"]["langgraph_node"]
    #     return ChatResponse(
    #         type=get_message_type(event["data"]["input"]),
    #         id=id,
    #         name=name,
    #         content=content,
    #         next=next,
    #     )
    return None
