import os
from dotenv import load_dotenv
from fastapi import HTTPException
from pydantic import BaseModel, SecretStr
from langchain_google_genai import ChatGoogleGenerativeAI

from browser_use import Agent, BrowserConfig
from browser_use.browser.browser import Browser
from browser_use.browser.context import BrowserContextConfig

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY is not set")

llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash-exp", api_key=SecretStr(api_key))

browser = Browser(
    config=BrowserConfig(
        new_context_config=BrowserContextConfig(
            viewport_expansion=0,
        )
    )
)

class SearchRequest(BaseModel):
    task: str

async def run_search_logic(request: SearchRequest):
    agent = Agent(
        task=request.task,
        llm=llm,
        max_actions_per_step=4,
        browser=browser,
    )

    try:
        result = await agent.run(max_steps=25)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
