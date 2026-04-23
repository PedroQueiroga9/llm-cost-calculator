from typing import Optional
from data.models import MODELS_DATA, PROVIDER_META, ModelPricing


class PricingService:
    def __init__(self):
        self._models = [ModelPricing(**m) for m in MODELS_DATA]

    def get_all_models(self) -> list[ModelPricing]:
        return [m for m in self._models if m.is_available]

    def get_model(self, model_id: str) -> Optional[ModelPricing]:
        return next((m for m in self._models if m.id == model_id), None)

    def get_providers(self) -> list[dict]:
        provider_ids = list(dict.fromkeys(m.provider_id for m in self._models))
        result = []
        for pid in provider_ids:
            meta = PROVIDER_META.get(pid, {})
            models = [m for m in self._models if m.provider_id == pid]
            result.append({
                **meta,
                "id": pid,
                "model_count": len(models),
            })
        return result

    def calculate_single(
        self,
        model_id: str,
        input_tokens: int,
        output_tokens: int,
        use_cache: bool = False,
        use_batch: bool = False,
    ) -> dict:
        model = self.get_model(model_id)
        if not model:
            raise ValueError(f"Model not found: {model_id}")

        input_price = model.cached_input_per_m if (use_cache and model.cached_input_per_m) else model.input_per_m
        output_price = model.output_per_m

        if use_batch and model.batch_available:
            discount = model.batch_discount / 100
            input_price *= (1 - discount)
            output_price *= (1 - discount)

        cost_input = (input_tokens / 1_000_000) * input_price
        cost_output = (output_tokens / 1_000_000) * output_price
        cost_total = cost_input + cost_output

        return {
            "model_id": model_id,
            "model_name": model.name,
            "provider": model.provider,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost_input_usd": round(cost_input, 8),
            "cost_output_usd": round(cost_output, 8),
            "cost_total_usd": round(cost_total, 8),
            "cost_total_brl": round(cost_total * 5.7, 6),
            "applied_input_price": input_price,
            "applied_output_price": output_price,
            "cache_applied": use_cache and model.cached_input_per_m is not None,
            "batch_applied": use_batch and model.batch_available,
        }

    def calculate_monthly(
        self,
        model_id: str,
        requests_per_day: int,
        input_tokens_per_req: int,
        output_tokens_per_req: int,
        use_cache: bool = False,
        use_batch: bool = False,
    ) -> dict:
        single = self.calculate_single(
            model_id, input_tokens_per_req, output_tokens_per_req, use_cache, use_batch
        )
        total_monthly_reqs = requests_per_day * 30
        total_tokens_input = input_tokens_per_req * total_monthly_reqs
        total_tokens_output = output_tokens_per_req * total_monthly_reqs

        monthly_cost = single["cost_total_usd"] * total_monthly_reqs

        return {
            **single,
            "requests_per_day": requests_per_day,
            "total_monthly_requests": total_monthly_reqs,
            "total_input_tokens_monthly": total_tokens_input,
            "total_output_tokens_monthly": total_tokens_output,
            "monthly_cost_usd": round(monthly_cost, 4),
            "monthly_cost_brl": round(monthly_cost * 5.7, 2),
            "annual_cost_usd": round(monthly_cost * 12, 2),
            "annual_cost_brl": round(monthly_cost * 12 * 5.7, 2),
            "projections": {
                "100_reqs_day": round(single["cost_total_usd"] * 100 * 30, 4),
                "1000_reqs_day": round(single["cost_total_usd"] * 1000 * 30, 4),
                "10000_reqs_day": round(single["cost_total_usd"] * 10000 * 30, 4),
            },
        }

    def compare_models(
        self,
        input_tokens: int,
        output_tokens: int,
        requests_per_day: int = 1000,
    ) -> list[dict]:
        results = []
        for model in self.get_all_models():
            calc = self.calculate_single(model.id, input_tokens, output_tokens)
            monthly = calc["cost_total_usd"] * requests_per_day * 30
            results.append({
                "model_id": model.id,
                "model_name": model.name,
                "provider": model.provider,
                "provider_id": model.provider_id,
                "tier": model.tier,
                "input_per_m": model.input_per_m,
                "output_per_m": model.output_per_m,
                "context_window": model.context_window,
                "cost_per_request_usd": round(calc["cost_total_usd"], 8),
                "monthly_cost_usd": round(monthly, 4),
                "monthly_cost_brl": round(monthly * 5.7, 2),
                "batch_available": model.batch_available,
                "strengths": model.strengths,
                "best_for": model.best_for,
            })
        results.sort(key=lambda x: x["cost_per_request_usd"])
        max_cost = max(r["cost_per_request_usd"] for r in results) if results else 1
        for r in results:
            r["relative_cost_pct"] = round((r["cost_per_request_usd"] / max_cost) * 100, 1)
        return results

    def calculate_agent_system(self, agents: list[dict]) -> dict:
        breakdown = []
        total_daily_usd = 0.0

        for agent in agents:
            model_id = agent.get("model_id")
            reqs_day = agent.get("requests_per_day", 100)
            in_tok = agent.get("input_tokens", 2000)
            out_tok = agent.get("output_tokens", 500)
            use_cache = agent.get("use_cache", False)
            use_batch = agent.get("use_batch", False)

            calc = self.calculate_single(model_id, in_tok, out_tok, use_cache, use_batch)
            daily_cost = calc["cost_total_usd"] * reqs_day
            total_daily_usd += daily_cost

            breakdown.append({
                "agent_name": agent.get("name", "Agente"),
                "model_name": calc["model_name"],
                "provider": calc["provider"],
                "requests_per_day": reqs_day,
                "cost_per_request_usd": calc["cost_total_usd"],
                "daily_cost_usd": round(daily_cost, 6),
                "monthly_cost_usd": round(daily_cost * 30, 4),
                "monthly_cost_brl": round(daily_cost * 30 * 5.7, 2),
                "percentage_of_total": 0,
            })

        monthly_total = total_daily_usd * 30
        for item in breakdown:
            item["percentage_of_total"] = round(
                (item["daily_cost_usd"] / total_daily_usd * 100) if total_daily_usd > 0 else 0, 1
            )

        return {
            "agents": breakdown,
            "total_daily_usd": round(total_daily_usd, 6),
            "total_monthly_usd": round(monthly_total, 4),
            "total_monthly_brl": round(monthly_total * 5.7, 2),
            "total_annual_usd": round(monthly_total * 12, 2),
            "total_annual_brl": round(monthly_total * 12 * 5.7, 2),
        }
