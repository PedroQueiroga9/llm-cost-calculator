from fastapi import APIRouter, Request, HTTPException

router = APIRouter()


@router.get("/models")
async def get_models(request: Request):
    pricing = request.app.state.pricing
    models = pricing.get_all_models()
    return [m.model_dump() for m in models]


@router.get("/models/{model_id}")
async def get_model(model_id: str, request: Request):
    pricing = request.app.state.pricing
    model = pricing.get_model(model_id)
    if not model:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found")
    return model.model_dump()


@router.get("/providers")
async def get_providers(request: Request):
    pricing = request.app.state.pricing
    return pricing.get_providers()
