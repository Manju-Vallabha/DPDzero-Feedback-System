from fastapi import FastAPI, Request, HTTPException
from database.supabase_client import init_database
from utils.models import (
    LoginPayload,
    AddFeedbackPayload,
    UpdateFeedbackPayload,
    CommentPayload,
    getData,
    acknowledgeData,
)
from utils.auth import verify_user
from utils.get_data import get_manager_data, get_employee_data
from utils.feedback import add_feedback, update_feedback_data, acknowledge_feedback
from utils.comment import comment
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import os

load_dotenv()
app = FastAPI()

frontend_url = os.getenv("FRONTEND_URL")
print("Frontend URL:", frontend_url)
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],  # Can also use ["*"]
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def read_root():
    return {"message": "Welcome! to DPDzero Backend Feedback System Server"}

@app.on_event("startup")
def startup_event():
    try:
        app.state.supabase = init_database()
        print("✅ Supabase DB initialized.")
    except Exception as e:
        print("❌ Failed to initialize Supabase DB:", str(e))


@app.post("/login")
async def login(payload: LoginPayload, request: Request):
    result = await verify_user(payload, request)
    if result.get("status") == "success":
        return {"status": "success", "data": result.get("data")}
    else:
        raise HTTPException(status_code=401, detail="Invalid username or password")


@app.put("/feedback")
async def feedback(payload: AddFeedbackPayload, request: Request):
    result = await add_feedback(payload, request)
    return result


@app.put("/update_feedback")
async def update_feedback(payload: UpdateFeedbackPayload, request: Request):
    result = await update_feedback_data(payload, request)
    return result


@app.put("/comment")
async def comment_updater(payload: CommentPayload, request: Request):
    result = await comment(payload, request)
    if result.get("status") == "success":
        return {"status": "success", "message": result.get("message")}
    else:
        raise HTTPException(status_code=400, detail=result.get("message"))


@app.post("/manager_data")
async def get_emp_data(payload: getData, request: Request):
    result = await get_manager_data(payload, request)
    if result.get("status") == "success":
        return {"status": "success", "data": result.get("data")}
    else:
        raise HTTPException(
            status_code=404, detail="Data not found for the given manager ID"
        )


@app.post("/employee_data")
async def get_emp_data(payload: getData, request: Request):
    result = await get_employee_data(payload, request)
    if result.get("status") == "success":
        return {"status": "success", "data": result.get("data")}
    else:
        raise HTTPException(
            status_code=404, detail="Data not found for the given manager ID"
        )


@app.put("/acknowledge_feedback")
async def acknowledgefeedback(payload: acknowledgeData, request: Request):
    result = await acknowledge_feedback(payload, request)
    if result.get("status") == "success":
        return {"status": "success", "message": result.get("message")}
    else:
        raise HTTPException(status_code=400, detail=result.get("message"))
