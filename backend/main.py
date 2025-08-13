from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()
qa_pipeline = pipeline("question-answering", model="distilbert-base-cased-distilled-squad")

class QARequest(BaseModel):
    question: str
    context: str

@app.post("/api/qa")
async def answer_question(req: QARequest):
    result = qa_pipeline(question=req.question, context=req.context)
    return {"answer": result["answer"], "score": result["score"]}
