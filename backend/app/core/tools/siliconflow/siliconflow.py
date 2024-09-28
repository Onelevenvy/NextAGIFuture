import requests
import json
import requests
from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import StructuredTool


class Text2ImageInput(BaseModel):
    """Input for the text2img tool."""

    prompt: str = Field(description="the prompt for generating image ")


def text2img(
    prompt: str,
):
    """
    invoke tools
    """

    try:
        # request URL
        url = "https://api.siliconflow.cn/v1/image/generations"

        payload = {
            # "model": "black-forest-labs/FLUX.1-schnell",
            "model": "stabilityai/stable-diffusion-3-medium",
            "prompt": prompt,
            "image_size": "1024x1024",
        }
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": "Bearer sk-uaxgsvfwwwpeuguzhsjpqigwopyhblsiesbptxnuxaoefqrb",
        }

        response = requests.post(url, json=payload, headers=headers)

        return response.json()["images"][0]["url"]

    except Exception as e:
        return json.dumps(f"There is a error occured . {e}")


siliconflow = StructuredTool.from_function(
    func=text2img,
    name="Image Generation",
    description="Siliconflow Image Generation is a tool that can generate images from text prompts using the Siliconflow API.",
    args_schema=Text2ImageInput,
    return_direct=True,
)

