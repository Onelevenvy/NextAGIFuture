import requests
from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import StructuredTool


class GoogleTranslateInput(BaseModel):
    """Input for the googleTranslate tool."""

    content: str = Field(description="The text content you need to translate")
    dest: str = Field(description="The destination language you want to translate")


def translate(content: str, dest: str) -> str:
    try:
        url = "https://translate.googleapis.com/translate_a/single"
        params = {"client": "gtx", "sl": "auto", "tl": dest, "dt": "t", "q": content}

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
            " Chrome/91.0.4472.124 Safari/537.36"
        }

        response_json = requests.get(url, params=params, headers=headers).json()
        result = response_json[0]
        translated_text = "".join([item[0] for item in result if item[0]])
        return str(translated_text)
    except Exception as e:
        return str(e)


google_tanslate = StructuredTool.from_function(
    func=translate,
    name="translate",
    description="Useful for when you neet to translate text",
    args_schema=GoogleTranslateInput,
    return_direct=True,
)
