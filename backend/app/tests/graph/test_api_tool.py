import pytest
from langchain.pydantic_v1 import ValidationError

from app.core.graph.skills.api_tool import dynamic_api_tool

# Sample tool definitions
valid_tool_definition = {
    "function": {
        "name": "getWeatherForecast",
        "description": "Fetches the weather forecast for a given location based on latitude and longitude.",
        "parameters": {
            "type": "object",
            "properties": {
                "latitude": {
                    "type": "number",
                    "description": "Latitude of the location",
                },
                "longitude": {
                    "type": "number",
                    "description": "Longitude of the location",
                },
                "current": {
                    "type": "string",
                    "description": "Current weather parameters to fetch",
                    "enum": ["temperature_2m,wind_speed_10m"],
                },
            },
            "required": ["latitude", "longitude"],
        },
    },
    "url": "https://api.open-meteo.com/v1/forecast",
    "method": "GET",
    "headers": {"Content-Type": "application/json"},
}

invalid_tool_definition_missing_url = {
    "function": {
        "name": "getWeatherForecast",
        "description": "Fetches the weather forecast for a given location based on latitude and longitude.",
        "parameters": {
            "type": "object",
            "properties": {
                "latitude": {
                    "type": "number",
                    "description": "Latitude of the location",
                },
                "longitude": {
                    "type": "number",
                    "description": "Longitude of the location",
                },
                "current": {
                    "type": "string",
                    "description": "Current weather parameters to fetch",
                },
            },
            "required": ["latitude", "longitude", "current"],
        },
    },
    "method": "GET",
    "headers": {"Content-Type": "application/json"},
}

invalid_tool_definition_invalid_type = {
    "function": {
        "name": "getWeatherForecast",
        "description": "Fetches the weather forecast for a given location based on latitude and longitude.",
        "parameters": {
            "type": "object",
            "properties": {
                "latitude": {
                    "type": "array",
                    "description": "Latitude of the location",
                },  # Invalid type
                "longitude": {
                    "type": "number",
                    "description": "Longitude of the location",
                },
                "current": {
                    "type": "string",
                    "description": "Current weather parameters to fetch",
                },
            },
            "required": ["latitude", "longitude", "current"],
        },
    },
    "url": "https://api.open-meteo.com/v1/forecast",
    "method": "GET",
    "headers": {"Content-Type": "application/json"},
}


def test_dynamic_api_tool_valid_definition() -> None:
    tool = dynamic_api_tool(valid_tool_definition)
    assert tool.name == "getWeatherForecast"
    assert (
        tool.description
        == "Fetches the weather forecast for a given location based on latitude and longitude."
    )

    # Test invoking tool with valid parameters
    result = tool.invoke(
        {
            "latitude": 52.52,
            "longitude": 13.41,
            "current": "temperature_2m,wind_speed_10m",
        },
    )
    assert isinstance(result, str)


def test_dynamic_api_tool_missing_url() -> None:
    with pytest.raises(ValueError) as excinfo:
        dynamic_api_tool(invalid_tool_definition_missing_url)
    assert "Field required" in str(excinfo.value)


def test_dynamic_api_tool_invalid_type() -> None:
    with pytest.raises(ValueError) as excinfo:
        dynamic_api_tool(invalid_tool_definition_invalid_type)
    assert "Unsupported type" in str(excinfo.value)


def test_dynamic_api_tool_missing_optional_parameter() -> None:
    tool = dynamic_api_tool(valid_tool_definition)

    # Test invoking tool with missing optional parameter
    result = tool.run(
        {
            "latitude": 52.52,
            "longitude": 13.41,
        }
    )
    assert isinstance(result, str)


def test_dynamic_api_tool_missing_required_parameter() -> None:
    tool = dynamic_api_tool(valid_tool_definition)

    # Test invoking tool with missing required parameter
    with pytest.raises(ValidationError) as excinfo:
        tool.run(
            {
                "longitude": 13.41,
                "current": "temperature_2m,wind_speed_10m",
            }
        )
    assert "field required" in str(excinfo.value)


def test_dynamic_api_tool_handle_tool_error() -> None:
    invalid_url_tool_definition = valid_tool_definition.copy()
    invalid_url_tool_definition["url"] = "https://invalid-url"
    tool_with_invalid_url = dynamic_api_tool(invalid_url_tool_definition)

    res = tool_with_invalid_url.invoke(
        {
            "latitude": 52.52,
            "longitude": 13.41,
            "current": "temperature_2m,wind_speed_10m",
        },
    )
    assert isinstance(res, str)
    assert res.startswith("HTTP request failed:")
