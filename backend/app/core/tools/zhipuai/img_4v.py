import base64
from zhipuai import ZhipuAI
import os
from langchain.pydantic_v1 import BaseModel, Field

from langchain.tools import StructuredTool


class ImageUnderstandingInput(BaseModel):
    """Input for the Image Understanding tool."""

    image_url: str = Field(description="the path or the url of the image")
    text: str = Field(description="the input text for the Image Understanding tool")


def img_4v(image_url: str, text: str):
    if image_url is None:
        return "Please provide an image path or url"

    elif (
        image_url.startswith("http")
        or image_url.startswith("https")
        or image_url.startswith("data:image/")
    ):
        img_base = image_url
    else:
        try:
            with open(image_url, "rb") as img_file:
                img_base = base64.b64encode(img_file.read()).decode("utf-8")
        except Exception as e:
            return "Error: " + str(e)
    client = ZhipuAI(
        api_key=os.environ.get("ZHIPUAI_API_KEY"),
    )  # 填写您自己的APIKey
    response = client.chat.completions.create(
        model="glm-4v",  # 填写需要调用的模型名称
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": img_base}},
                    {"type": "text", "text": text},
                ],
            }
        ],
    )

    return response.choices[0].message


img_understanding = StructuredTool.from_function(
    func=img_4v,
    name="Image Understanding",
    description="Users input an image and a question, and the LLM can identify objects, scenes, and other information in the image to answer the user's question.",
    args_schema=ImageUnderstandingInput,
    return_direct=True,
)
