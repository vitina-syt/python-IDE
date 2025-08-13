from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()
api_key="sk-de6204ecb187412fbbeadf859c6faf5d"
qa_pipeline = pipeline("question-answering", model="Qwen/Qwen-Image")

class QARequest(BaseModel):
    question: str
    context: str

@app.post("/api/qa")
async def answer_question(req: QARequest):
    result = qa_pipeline(question=req.question, context=req.context)
    return {"answer": result["answer"], "score": result["score"]}
