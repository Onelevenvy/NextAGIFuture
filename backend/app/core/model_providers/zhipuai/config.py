from langchain_openai import ChatOpenAI
from app.models import ModelCategory, ModelCapability

PROVIDER_CONFIG = {
    "provider_name": "zhipuai",
    "base_url": "https://open.bigmodel.cn/api/paas/v4",
    "api_key": "5e867fc4396cff20bc3431d39e8c240f.d5Y8YBqIawDigP46",
    "icon": "zhipuai_icon",
    "description": "智谱AI",
}

SUPPORTED_MODELS = [
    {
        "name": "glm-4-alltools",
        "categories": [ModelCategory.LLM, ModelCategory.CHAT],
        "capabilities": [],
    },
    {
        "name": "glm-4-flash",
        "categories": [ModelCategory.LLM, ModelCategory.CHAT],
        "capabilities": [],
    },
    {
        "name": "glm-4-0520",
        "categories": [ModelCategory.LLM, ModelCategory.CHAT],
        "capabilities": [],
    },
    {
        "name": "glm-4-plus",
        "categories": [ModelCategory.LLM, ModelCategory.CHAT],
        "capabilities": [],
    },
    {
        "name": "glm-4v-plus",
        "categories": [ModelCategory.LLM, ModelCategory.CHAT],
        "capabilities": [ModelCapability.VISION],
    },
    {
        "name": "glm-4",
        "categories": [ModelCategory.LLM, ModelCategory.CHAT],
        "capabilities": [],
    },
    {
        "name": "glm-4v",
        "categories": [ModelCategory.LLM, ModelCategory.CHAT],
        "capabilities": [ModelCapability.VISION],
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
