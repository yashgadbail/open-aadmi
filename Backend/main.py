from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from gemini import run_search_logic, SearchRequest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/search")
async def run_search(request: SearchRequest):
    return await run_search_logic(request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
