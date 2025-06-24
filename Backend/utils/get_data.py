from utils.models import getData
import json
import re


async def get_manager_data(payload: getData, request):
    supabase = request.app.state.supabase
    try:
        response = (
            supabase.table("empTable").select("*").eq("mang_id", payload.id).execute()
        )
        if response.data:
            responseData = []
            for item in response.data:
                responseData.append(
                    {
                        "id": item.get("emp_id", ""),
                        "name": item.get("name", ""),
                        "email": item.get("email", ""),
                        "feedbacks": item["feedbacks"] if "feedbacks" in item else [],
                        "tasks": item["tasks"] if "tasks" in item else [],
                        "role": item.get("role", ""),
                        "requestfeed": item.get("requestFeedback", False),
                    }
                )

            return {"status": "success", "data": responseData}
    except Exception as e:
        return {"status": "failed", "message": "Failed to fetch data", "error": str(e)}


async def get_employee_data(payload: getData, request):
    supabase = request.app.state.supabase
    try:
        response = (
            supabase.table("empTable").select("*").eq("emp_id", payload.id).execute()
        )
        if response.data:
            responseData = []
            for item in response.data:
                responseData.append(
                    {
                        "id": item.get("emp_id", ""),
                        "name": item.get("name", ""),
                        "email": item.get("email", ""),
                        "manager_name": item.get("manager_name", ""),
                        "feedbacks": item["feedbacks"] if "feedbacks" in item else [],
                        "tasks": item["tasks"] if "tasks" in item else [],
                        "role": item.get("role", ""),
                        "requestfeed": item.get("requestFeedback", False),
                    }
                )

            return {"status": "success", "data": responseData}
    except Exception as e:
        return {"status": "failed", "message": "Failed to fetch data", "error": str(e)}
