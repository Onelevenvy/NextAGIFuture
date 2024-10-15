from langchain_openai import ChatOpenAI

PROVIDER_CONFIG = {
    "provider_name": "Qwen",
    "base_url": "fakeurl",
    "api_key": "fakeapikey",
    "icon": "qwen_icon",
    "description": "qwen  API provider",
}

SUPPORTED_MODELS = [
    "Qwen2-7B-Instruct",
    "Qwen2.5-70B",
]


def init_model(
    model: str, temperature: float, openai_api_key: str, openai_api_base: str, **kwargs
):
    return ChatOpenAI(
        model=model,
        temperature=temperature,
        openai_api_key=openai_api_key,
        openai_api_base=openai_api_base,
        **kwargs
    )
