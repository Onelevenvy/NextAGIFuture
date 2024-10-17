from langchain_openai import ChatOpenAI
from app.models import ModelCategory, ModelCapability

PROVIDER_CONFIG = {
    "provider_name": "Qwen",
    "base_url": "fakeurl",
    "api_key": "fakeapikey",
    "icon": "qwen_icon",
    "description": "qwen API provider",
}

SUPPORTED_MODELS = [
    {
        "name": "Qwen2-7B-Instruct",
        "categories": [ModelCategory.LLM, ModelCategory.CHAT],
        "capabilities": [],
    },
    {
        "name": "Qwen2.5-70B",
        "categories": [ModelCategory.LLM, ModelCategory.CHAT],
        "capabilities": [],
    },
]

def init_model(model: str, temperature: float, openai_api_key: str, openai_api_base: str, **kwargs):
    model_info = next((m for m in SUPPORTED_MODELS if m["name"] == model), None)
    if model_info and ModelCategory.CHAT in model_info["categories"]:
        return ChatOpenAI(
            model=model,
            temperature=temperature,
            openai_api_key=openai_api_key,
            openai_api_base=openai_api_base,
            **kwargs
        )
    else:
        raise ValueError(f"Model {model} is not supported as a chat model.")
