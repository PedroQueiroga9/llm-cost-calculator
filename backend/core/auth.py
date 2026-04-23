import os
from typing import Optional
from fastapi import HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends
from supabase import create_client

_security = HTTPBearer()
_security_optional = HTTPBearer(auto_error=False)


def _get_supabase():
    return create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])


def _verify_token(token: str) -> Optional[str]:
    """Verifica o JWT via Supabase e retorna o user_id (sub)."""
    try:
        supabase = _get_supabase()
        response = supabase.auth.get_user(token)
        if response and response.user:
            return response.user.id
        return None
    except Exception as e:
        print(f"[AUTH] Erro ao verificar token: {e}")
        return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_security),
) -> str:
    """Valida o JWT do Supabase e retorna o user_id. Requer auth."""
    user_id = _verify_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")
    return user_id


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_security_optional),
) -> Optional[str]:
    """Valida o JWT se presente, retorna None se não autenticado."""
    if not credentials:
        return None
    return _verify_token(credentials.credentials)
