from utils.models import CommentPayload


async def comment(payload: CommentPayload, request):

    supabase = request.app.state.supabase

    try:
        # Step 1: Get the employee row
        response = (
            supabase.table("empTable")
            .select("feedbacks")
            .eq("emp_id", payload.empId)
            .single()
            .execute()
        )

        if not response.data:
            return {"status": "failed", "message": "Employee not found"}

        feedbacks = response.data["feedbacks"]

        # Step 2: Find the feedback with matching date and update it
        updated_feedbacks = []
        found = False
        for fb in feedbacks:
            if fb["date"] == payload.date:
                fb["comment"] = payload.comment
                fb["acknowledged"] = payload.acknowledged
                found = True
            updated_feedbacks.append(fb)

        if not found:
            return {"status": "failed", "message": "Feedback entry not found by date"}

        # Step 3: Update the row
        update_res = (
            supabase.table("empTable")
            .update({"feedbacks": updated_feedbacks})
            .eq("emp_id", payload.empId)
            .execute()
        )

        if update_res.data:
            return {
                "status": "success",
                "message": "Comment submitted and feedback acknowledged",
            }
        else:
            return {"status": "failed", "message": "Update failed"}

    except Exception as e:
        print("Error:", str(e))
        return {"status": "failed", "message": "Server error"}
