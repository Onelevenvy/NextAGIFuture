import json
import requests
import uuid
from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import StructuredTool
from app.core.tools.utils import get_credential_value

class QingyanAssistantInput(BaseModel):
    """Input for the Qingyan Assistant tool."""
    query: str = Field(description="User's query or message")

def qingyan_assistant_query(query: str) -> str:
    """
    Invoke Qingyan Assistant API
    """
    api_key = get_credential_value("Qingyan Assistant", "QINGYAN_ASSISTANT_API_KEY")

    if not api_key:
        return "Error: Qingyan Assistant API Key is not set."

    try:
        url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        data = {
            "model": "qingyan-assistant",
            "messages": [
                {
                    "role": "user",
                    "content": query
                }
            ],
            "stream": False
        }
        response = requests.post(url, headers=headers, json=data, timeout=300)

        if response.status_code == 200:
            result = response.json()
            if "choices" in result and len(result["choices"]) > 0:
                assistant_response = result["choices"][0].get("message", {}).get("content", "")
                return assistant_response
            else:
                return json.dumps({"error": "No response from assistant"})
        else:
            error_message = {
                "error": f"HTTP request failed: {response.status_code}",
                "data": response.text,
            }
            return json.dumps(error_message)

    except Exception as e:
        return json.dumps(f"Qingyan Assistant API request failed. {e}")

qingyan_assistant = StructuredTool.from_function(
    func=qingyan_assistant_query,
    name="Qingyan Assistant",
    description="A versatile AI assistant that can help with various tasks and answer questions.",
    args_schema=QingyanAssistantInput,
    return_direct=True,
)
