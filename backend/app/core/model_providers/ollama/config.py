from langchain_ollama import ChatOllama
from app.models import ModelCategory, ModelCapability

PROVIDER_CONFIG = {
    'provider_name': 'Ollama',
    'base_url': 'http://host.docker.internal:11434',
    'api_key': 'fakeapikey',
    'icon': 'ollama_icon',
    'description': 'Ollama API provider'
}

SUPPORTED_MODELS = [
    {
        "name": 'llama3.1:8b',
        "categories": [ModelCategory.LLM, ModelCategory.CHAT],
        "capabilities": [],
    },
]

def init_model(model: str, temperature: float, openai_api_key: str, openai_api_base: str, **kwargs):
    model_info = next((m for m in SUPPORTED_MODELS if m["name"] == model), None)
    if model_info and ModelCategory.CHAT in model_info["categories"]:
        return ChatOllama(
            model=model,
            temperature=temperature,
            base_url=openai_api_base,
            **kwargs
        )
    else:
        raise ValueError(f"Model {model} is not supported as a chat model.")
