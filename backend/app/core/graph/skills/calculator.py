# This is an example showing how to create a simple calculator skill

from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import StructuredTool


class CalculatorInput(BaseModel):
    a: int = Field(description="first number")
    b: int = Field(description="second number")


def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b


calculator = StructuredTool.from_function(
    func=multiply,
    name="Calculator",
    description="Useful for when you need to multiply two numbers.",
    args_schema=CalculatorInput,
    return_direct=True,
)
