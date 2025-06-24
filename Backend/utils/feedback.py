from utils.models import AddFeedbackPayload, UpdateFeedbackPayload, acknowledgeData
from fastapi import Request
from fastapi.responses import JSONResponse
from datetime import datetime


async def add_feedback(payload: AddFeedbackPayload, request):
    supabase = request.app.state.supabase

    try:
        # Extract values
        manager_id = payload.mangId
        employee_id = payload.empId
        new_feedback = payload.feedback  # should be a dict
        request_feedback = payload.requestFeedback

        # 1. Check if a row exists with this manager + employee
        existing = (
            supabase.table("empTable")
            .select("feedbacks")
            .eq("mang_id", manager_id)
            .eq("emp_id", employee_id)
            .execute()
        )

        if existing.data:

            row = existing.data[0]
            current_feedbacks = row.get("feedbacks", [])

            # ✅ Properly create new list with appended feedback
            updated_feedbacks = current_feedbacks + [new_feedback]

            update_response = (
                supabase.table("empTable")
                .update({"feedbacks": updated_feedbacks})
                .eq("emp_id", employee_id)
                .execute()
            )

            upadate_request_feedback = (
                supabase.table("empTable")
                .update({"requestFeedback": request_feedback})
                .eq("emp_id", employee_id)
                .execute()
            )

            if update_response.data:
                return {"status": "success", "message": "Feedback updated successfully"}

            return {
                "status": "failed",
                "message": "Update failed",
            }

        # If no existing record, you can handle insert here if needed
        return {
            "status": "failed",
            "message": "Manager-employee pair not found",
        }

    except Exception as e:
        print("Error inserting/updating feedback:", str(e))
        return {
            "status": "failed",
            "message": "Failed to add feedback",
        }


async def update_feedback_data(payload: UpdateFeedbackPayload, request):
    supabase = request.app.state.supabase

    try:
        # Extract values
        manager_id = payload.mangId
        employee_id = payload.empId
        update_feedback_data = payload.updatedFeedback  # should be a dict
        index = payload.index  # index of the feedback to update

        # 1. Check if a row exists with this manager + employee
        existing = (
            supabase.table("empTable")
            .select("feedbacks")
            .eq("mang_id", manager_id)
            .eq("emp_id", employee_id)
            .execute()
        )

        if existing.data:
            row = existing.data[0]
            current_feedbacks = row.get("feedbacks", [])

            if index >= len(current_feedbacks):
                return {
                    "status": "failed",
                    "message": "Invalid index",
                }

            original_feedback = current_feedbacks[index]

            # Merge original with updated fields
            updated_feedback = {
                **original_feedback,  # keep all existing fields
                **update_feedback_data,  # overwrite with any updated fields
            }

            # Apply it at the correct index
            current_feedbacks[index] = updated_feedback

            # Update in Supabase
            update_response = (
                supabase.table("empTable")
                .update({"feedbacks": current_feedbacks})
                .eq("emp_id", employee_id)
                .eq("mang_id", manager_id)
                .execute()
            )

            if update_response.data:
                return {"status": "success", "message": "Feedback updated successfully"}

            return {
                "status": "failed",
                "message": "Update failed",
            }

    except Exception as e:
        print("Error inserting/updating feedback:", str(e))
        return {
            "status": "failed",
            "message": "Update failed",
        }


async def acknowledge_feedback(payload: acknowledgeData, request):
    supabase = request.app.state.supabase

    try:
        # Step 1: Fetch the existing feedbacks
        result = (
            supabase.table("empTable")  # Use your actual table name
            .select("feedbacks")
            .eq("emp_id", payload.empId)
            .single()
            .execute()
        )

        if not result.data:
            return {"status": "failed", "message": "Employee not found"}

        feedbacks = result.data.get("feedbacks", [])

        # Step 2: Modify the matching feedback item
        updated_feedbacks = []
        found = False
        for fb in feedbacks:
            if fb.get("date") == payload.date:
                fb["acknowledged"] = payload.acknowledged
                found = True
            updated_feedbacks.append(fb)

        if not found:
            return {"status": "failed", "message": "Matching feedback not found"}

        # Step 3: Update the full array back to Supabase
        update_res = (
            supabase.table("empTable")
            .update({"feedbacks": updated_feedbacks})
            .eq("emp_id", payload.empId)
            .execute()
        )

        return {
            "status": "success",
            "message": "Feedback acknowledged successfully",
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            "status": "failed",
            "message": "Failed to acknowledge feedback",
            "error": str(e),
        }
