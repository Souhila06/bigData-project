from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.dependencies import api_router

app = FastAPI()
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
