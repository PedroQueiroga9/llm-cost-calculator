from fastapi import APIRouter, Request, HTTPException, Depends
from core.auth import get_current_user

router = APIRouter()


@router.get("")
async def get_history(
    request: Request,
    limit: int = 50,
    user_id: str = Depends(get_current_user),
):
    db = request.app.state.db
    return await db.get_history(limit, user_id)


@router.delete("/{record_id}")
async def delete_record(
    record_id: int,
    request: Request,
    user_id: str = Depends(get_current_user),
):
    db = request.app.state.db
    deleted = await db.delete_history(record_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Registro não encontrado")
    return {"deleted": True}


@router.delete("")
async def clear_history(
    request: Request,
    user_id: str = Depends(get_current_user),
):
    db = request.app.state.db
    await db.clear_history(user_id)
    return {"cleared": True}
