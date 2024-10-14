from langchain_openai import ChatOpenAI

PROVIDER_CONFIG = {
    "provider_name": "zhipuai",
    "base_url": "https://open.bigmodel.cn/api/paas/v4",
    "api_key": "5e867fc4396cff20bc3431d39e8c240f.d5Y8YBqIawDigP46",
    "icon": "zhipuai_icon",
    "description": "智谱AI",
}

SUPPORTED_MODELS = [
    "glm-4-alltools",
    "glm-4-flash",
    "glm-4-0520",
    "glm-4-plus",
    "glm-4v-plus",
    "glm-4",
    "glm-4v",
]


def init_model(model: str, temperature: float, **kwargs):
    return ChatOpenAI(
        model=model,
        temperature=temperature,
        openai_api_key=PROVIDER_CONFIG["api_key"],
        openai_api_base=PROVIDER_CONFIG["base_url"],
        **kwargs
    )
