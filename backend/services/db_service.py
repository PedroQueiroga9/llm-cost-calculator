import asyncio
import os
from supabase import create_client, Client


class DatabaseService:
    def __init__(self):
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_SERVICE_KEY"]
        self._client: Client = create_client(url, key)

    async def init(self):
        pass  # Supabase gerencia conexões internamente

    async def save_calculation(
        self, calc_type: str, label: str, params: dict, result: dict, user_id: str
    ) -> int:
        data = {
            "user_id": user_id,
            "type": calc_type,
            "label": label,
            "params": params,
            "result": result,
        }
        response = await asyncio.to_thread(
            lambda: self._client.table("calculation_history").insert(data).execute()
        )
        return response.data[0]["id"]

    async def get_history(self, limit: int, user_id: str) -> list[dict]:
        response = await asyncio.to_thread(
            lambda: self._client.table("calculation_history")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return response.data

    async def delete_history(self, record_id: int, user_id: str) -> bool:
        response = await asyncio.to_thread(
            lambda: self._client.table("calculation_history")
            .delete()
            .eq("id", record_id)
            .eq("user_id", user_id)
            .execute()
        )
        return len(response.data) > 0

    async def clear_history(self, user_id: str) -> None:
        await asyncio.to_thread(
            lambda: self._client.table("calculation_history")
            .delete()
            .eq("user_id", user_id)
            .execute()
        )

    async def close(self):
        pass
