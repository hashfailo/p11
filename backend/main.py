"""
Multi-Agent Narrative Framework — FastAPI Backend
"""
import io
import json
import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

from services.character_agent import chat_with_character
from services.divergence_agent import generate_alternate_timeline
from services.lore_agent import extract_lore

app = FastAPI(title="Narrative Framework API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory state
state: dict = {
    "lore": None,
    "branch_context": None,
    "branch_type": "original",
    "chat_interaction_id": None,
}


class DivergenceRequest(BaseModel):
    event_id: str
    what_if: str


class ChatRequest(BaseModel):
    character_id: str
    message: str
    branch_type: str = "alternate"
    reset: bool = False


class ChatResponse(BaseModel):
    response: str
    character_name: str


def extract_text_from_pdf(data: bytes) -> str:
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(io.BytesIO(data))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PDF extraction failed: {e}")


@app.get("/")
def root():
    return {"status": "Narrative Framework API is running"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    data = await file.read()

    if file.filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf(data)
    elif file.filename.lower().endswith(".txt"):
        text = data.decode("utf-8", errors="replace")
    else:
        raise HTTPException(status_code=400, detail="Only .txt and .pdf files are supported")

    if len(text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Extracted text is too short")

    try:
        lore = extract_lore(text)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"LLM returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lore extraction failed: {e}")

    state["lore"] = lore
    state["branch_context"] = None
    state["branch_type"] = "original"
    state["chat_interaction_id"] = None

    return {"lore": lore, "source_length": len(text)}


@app.get("/lore")
def get_lore():
    if not state["lore"]:
        raise HTTPException(status_code=404, detail="No lore loaded. Upload a file first.")
    return {"lore": state["lore"]}


@app.post("/diverge")
def diverge(req: DivergenceRequest):
    if not state["lore"]:
        raise HTTPException(status_code=400, detail="No lore loaded. Upload a file first.")

    try:
        branch_context = generate_alternate_timeline(
            lore=state["lore"],
            event_id=req.event_id,
            what_if=req.what_if,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"LLM returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Divergence failed: {e}")

    state["branch_context"] = branch_context
    state["branch_type"] = "alternate"
    state["chat_interaction_id"] = None

    return {"branch_context": branch_context}


@app.post("/chat")
def chat(req: ChatRequest):
    if not state["lore"]:
        raise HTTPException(status_code=400, detail="No lore loaded")

    lore = state["lore"]
    character = next(
        (c for c in lore["characters"] if c["id"] == req.character_id), None
    )
    if not character:
        raise HTTPException(status_code=404, detail=f"Character '{req.character_id}' not found")

    branch_context = state["branch_context"]
    if req.branch_type == "original" or branch_context is None:
        branch_context = {
            "original_branch": lore.get("events", []),
            "alternate_branch": lore.get("events", []),
            "character_states": {
                c["id"]: {
                    "name": c["name"],
                    "status": c.get("description", ""),
                    "emotional_state": "as described in the story",
                    "key_knowledge": "events as they happened in the original story",
                }
                for c in lore["characters"]
            },
            "divergence_summary": "Original timeline — no changes",
        }

    prev_id = None if req.reset else state.get("chat_interaction_id")

    try:
        response_text, interaction_id = chat_with_character(
            character=character,
            lore=lore,
            branch_context=branch_context,
            branch_type=req.branch_type,
            message=req.message,
            conversation_history=[],
            previous_interaction_id=prev_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {e}")

    state["chat_interaction_id"] = interaction_id

    return ChatResponse(response=response_text, character_name=character["name"])


@app.delete("/reset")
def reset():
    state["lore"] = None
    state["branch_context"] = None
    state["branch_type"] = "original"
    state["chat_interaction_id"] = None
    return {"status": "reset"}
