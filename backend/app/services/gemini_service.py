import json
import re
import time
import logging
from typing import Optional

from google import genai
from google.genai import types

from app.config import settings
from app.utils.prompts import (
    COST_ESTIMATION_PROMPT,
    BLUEPRINT_ANALYSIS_PROMPT,
)

logger = logging.getLogger(__name__)

_client: Optional[genai.Client] = None


def get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


MODEL = "gemini-2.0-flash"   # fast + cheap; swap to gemini-1.5-pro for higher accuracy


# ── JSON safety parser ────────────────────────────────────────────────────────

def _safe_parse_json(raw: str) -> dict:
    """Strip markdown fences and extract the JSON object."""
    cleaned = re.sub(r"```(?:json)?", "", raw).strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1:
        raise ValueError(f"No JSON object found. Got: {raw[:300]}")
    return json.loads(cleaned[start : end + 1])


def _call_gemini(prompt: str, image=None, max_retries: int = 3) -> str:
    """Call Gemini with exponential backoff retry."""
    client = get_client()
    last_error = None

    for attempt in range(max_retries):
        try:
            contents: list = [prompt]
            if image:
                contents.append(image)

            response = client.models.generate_content(
                model=MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.15,
                    top_p=0.8,
                    max_output_tokens=8192,
                    response_mime_type="application/json",
                ),
            )

            text = response.text
            if not text:
                raise ValueError("Empty response from Gemini")
            return text

        except Exception as e:
            last_error = e
            wait = 2 ** attempt
            logger.warning(f"Gemini attempt {attempt + 1} failed: {e}. Retrying in {wait}s…")
            time.sleep(wait)

    raise RuntimeError(f"Gemini failed after {max_retries} attempts: {last_error}")


# ── Main estimation ───────────────────────────────────────────────────────────

def generate_cost_estimation(project_data: dict) -> dict:
    sqft = float(project_data.get("total_area_sqft") or 1000)
    sqm  = sqft * 0.0929

    prompt = COST_ESTIMATION_PROMPT.format(
        name            = project_data.get("name", "Unnamed Project"),
        project_type    = project_data.get("project_type", "residential").capitalize(),
        city            = project_data.get("city") or "Not specified",
        state           = project_data.get("state") or "India",
        total_area_sqft = sqft,
        total_area_sqm  = sqm,
        num_floors      = project_data.get("num_floors", 1),
        finish_quality  = project_data.get("finish_quality", "standard"),
        description     = project_data.get("description") or "Standard construction",
    )

    logger.info(f"Running estimation for: {project_data.get('name')}")
    raw = _call_gemini(prompt)
    logger.info(f"Gemini response: {len(raw)} chars")

    result = _safe_parse_json(raw)
    result = _validate_estimation_result(result, sqft)
    result["_raw"] = raw
    return result


def _validate_estimation_result(result: dict, area_sqft: float) -> dict:
    result.setdefault("confidence", "medium")
    result.setdefault("notes", "")
    result.setdefault("boq_items", [])
    result.setdefault("breakdown", {})

    items = result["boq_items"]
    computed_total = sum(float(i.get("amount_inr", 0)) for i in items)

    if not result.get("total_cost_inr"):
        result["total_cost_inr"] = computed_total

    total = float(result["total_cost_inr"])
    if area_sqft > 0:
        result["cost_per_sqft"] = round(total / area_sqft, 2)

    bd = result["breakdown"]
    bd.setdefault("civil_work", 0)
    bd.setdefault("finishing", 0)
    bd.setdefault("electrical", 0)
    bd.setdefault("plumbing", 0)
    bd.setdefault("external_work", 0)
    bd.setdefault("contingency", round(total * 0.05, 2))

    if sum(bd.values()) == 0 and items:
        for item in items:
            cat = item.get("category", "civil")
            bd[cat] = bd.get(cat, 0) + float(item.get("amount_inr", 0))

    for idx, item in enumerate(items):
        item.setdefault("item_code", f"XX-{idx+1:03d}")
        item.setdefault("category", "civil")
        item.setdefault("unit", "ls")
        item.setdefault("quantity", 1)
        item.setdefault("rate_inr", 0)
        item.setdefault("amount_inr",
                        round(float(item["quantity"]) * float(item["rate_inr"]), 2))

    return result


# ── Blueprint analysis ────────────────────────────────────────────────────────

def analyze_blueprint(image_bytes: bytes, project_data: dict) -> dict:
    try:
        import PIL.Image
        import io
        img = PIL.Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        raise ValueError(f"Could not open image: {e}")

    prompt = BLUEPRINT_ANALYSIS_PROMPT.format(
        project_type    = project_data.get("project_type", "residential"),
        total_area_sqft = project_data.get("total_area_sqft", "unknown"),
        num_floors      = project_data.get("num_floors", 1),
    )

    raw = _call_gemini(prompt, image=img)
    return _safe_parse_json(raw)
