from pydantic import BaseModel
from typing import Dict, Optional, Any
from datetime import datetime


class LoginPayload(BaseModel):
    username: str
    password: str
    role: str


class AddFeedbackPayload(BaseModel):
    mangId: str
    empId: str
    feedback: dict
    requestFeedback: str  # Default to False if not provided


class UpdateFeedbackPayload(BaseModel):
    mangId: str
    empId: str
    index: int
    updatedFeedback: Dict[
        str, Any
    ]  # Assuming feedback is a dictionary with dynamic keys and values


class CommentPayload(BaseModel):
    empId: str
    date: str
    comment: str
    acknowledged: bool


class getData(BaseModel):
    id: str


class acknowledgeData(BaseModel):
    empId: str
    date: str
    acknowledged: bool
