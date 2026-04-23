from typing import Optional
from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel, Field
from core.auth import get_current_user, get_optional_user

router = APIRouter()


class SingleCalcRequest(BaseModel):
    model_id: str
    input_tokens: int = Field(ge=0)
    output_tokens: int = Field(ge=0)
    use_cache: bool = False
    use_batch: bool = False
    save: bool = False
    label: str = ""


class MonthlyCalcRequest(BaseModel):
    model_id: str
    requests_per_day: int = Field(gt=0)
    input_tokens_per_req: int = Field(ge=0)
    output_tokens_per_req: int = Field(ge=0)
    use_cache: bool = False
    use_batch: bool = False
    save: bool = False
    label: str = ""


class CompareRequest(BaseModel):
    input_tokens: int = Field(ge=0, default=0)
    output_tokens: int = Field(ge=0, default=0)
    requests_per_day: int = Field(gt=0, default=1000)


class AgentConfig(BaseModel):
    name: str
    model_id: str
    requests_per_day: int = Field(gt=0)
    input_tokens: int = Field(ge=0)
    output_tokens: int = Field(ge=0)
    use_cache: bool = False
    use_batch: bool = False


class AgentSystemRequest(BaseModel):
    agents: list[AgentConfig]
    save: bool = False
    label: str = ""


@router.post("/single")
async def calculate_single(
    body: SingleCalcRequest,
    request: Request,
    user_id: Optional[str] = Depends(get_optional_user),
):
    pricing = request.app.state.pricing
    try:
        result = pricing.calculate_single(
            body.model_id, body.input_tokens, body.output_tokens,
            body.use_cache, body.use_batch,
        )
        if body.save:
            if not user_id:
                raise HTTPException(status_code=401, detail="Login necessário para salvar")
            db = request.app.state.db
            await db.save_calculation(
                "single",
                body.label or "Cálculo por requisição",
                body.model_dump(),
                result,
                user_id,
            )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/monthly")
async def calculate_monthly(
    body: MonthlyCalcRequest,
    request: Request,
    user_id: Optional[str] = Depends(get_optional_user),
):
    pricing = request.app.state.pricing
    try:
        result = pricing.calculate_monthly(
            body.model_id, body.requests_per_day,
            body.input_tokens_per_req, body.output_tokens_per_req,
            body.use_cache, body.use_batch,
        )
        if body.save:
            if not user_id:
                raise HTTPException(status_code=401, detail="Login necessário para salvar")
            db = request.app.state.db
            await db.save_calculation(
                "monthly",
                body.label or "Estimativa mensal",
                body.model_dump(),
                result,
                user_id,
            )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/compare")
async def compare_models(
    body: CompareRequest,
    request: Request,
    user_id: Optional[str] = Depends(get_optional_user),
):
    pricing = request.app.state.pricing
    return pricing.compare_models(body.input_tokens, body.output_tokens, body.requests_per_day)


@router.post("/agents")
async def calculate_agents(
    body: AgentSystemRequest,
    request: Request,
    user_id: Optional[str] = Depends(get_optional_user),
):
    pricing = request.app.state.pricing
    agents = [a.model_dump() for a in body.agents]
    try:
        result = pricing.calculate_agent_system(agents)
        if body.save:
            if not user_id:
                raise HTTPException(status_code=401, detail="Login necessário para salvar")
            db = request.app.state.db
            await db.save_calculation(
                "agents",
                body.label or "Sistema de agentes",
                body.model_dump(),
                result,
                user_id,
            )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
