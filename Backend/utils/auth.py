from utils.models import LoginPayload


async def verify_user(payload: LoginPayload, request):
    role = payload.role.lower()
    supabase = request.app.state.supabase
    if role == "manager":
        try:
            result = (
                supabase.table("mangerTable")
                .select("*")
                .eq("manager_username", payload.username)
                .eq("pass", payload.password)
                .single()
                .execute()
            )
        except Exception as e:
            print("Error:", str(e.message))
            result = None

        if result is None:
            return {"status": "failed", "message": "Username or password incorrect"}
        else:
            data = {
                "mang_id": result.data.get("mang_id", ""),
                "manager_name": result.data.get("manager_name", ""),
            }
            return {"status": "success", "data": data}

    elif role == "employee":
        try:
            result = (
                supabase.table("empTable")
                .select("*")
                .eq("username", payload.username)
                .eq("pass", payload.password)
                .single()
                .execute()
            )
        except Exception as e:
            print("Error:", str(e.message))
            result = None

        if result is None:
            return {"status": "failed", "message": "Username or password incorrect"}
        else:
            data = {
                "empId": result.data.get("emp_id", ""),
                "name": result.data.get("name", ""),
                "manager_name": result.data.get("manager_name", ""),
            }
            return {"status": "success", "data": data}
