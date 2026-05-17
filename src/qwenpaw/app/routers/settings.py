# -*- coding: utf-8 -*-
"""Global UI settings (language, theme, etc.).

Persisted in ``WORKING_DIR/settings.json``, independent of
per-agent configuration.  All endpoints are public (no auth required).
"""
from __future__ import annotations

import json

from fastapi import APIRouter, Body, HTTPException

from ...agents.skill_system.registry import (
    set_builtin_skill_language_preference,
)
from ...constant import WORKING_DIR

router = APIRouter(prefix="/settings", tags=["settings"])

_SETTINGS_FILE = WORKING_DIR / "settings.json"

_VALID_LANGUAGES = {"en", "zh", "ja", "ru", "pt-BR", "id"}


def _load() -> dict:
    if _SETTINGS_FILE.is_file():
        try:
            return json.loads(_SETTINGS_FILE.read_text("utf-8"))
        except (json.JSONDecodeError, OSError):
            return {}
    return {}


def _save(data: dict) -> None:
    _SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    _SETTINGS_FILE.write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        "utf-8",
    )


@router.get("/language", summary="Get UI language")
async def get_language() -> dict:
    return {"language": _load().get("language", "zh")}


@router.put("/language", summary="Update UI language")
async def put_language(
    body: dict = Body(..., description='e.g. {"language": "zh"}'),
) -> dict:
    language = body.get("language", "").strip()
    if language not in _VALID_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid language, must be one of "
            f"{sorted(_VALID_LANGUAGES)}",
        )
    data = _load()
    data["language"] = language
    _save(data)
    # Update cached builtin preference since it falls back to UI language.
    if not data.get("builtin_skill_language"):
        set_builtin_skill_language_preference(
            "zh" if language.startswith("zh") else "en",
        )
    return {"language": language}


# ── 简化模式配置 ───────────────────────────────────────────────────────────


@router.get("/simplified", summary="获取简化模式状态")
async def get_simplified_mode() -> dict:
    """获取当前是否启用简化模式"""
    data = _load()
    return {
        "simplified_mode": data.get("simplified_mode", True),
        "developer_mode": data.get("developer_mode", False),
    }


@router.put("/simplified", summary="更新简化模式")
async def put_simplified_mode(
    body: dict = Body(..., description='e.g. {"simplified_mode": true}'),
) -> dict:
    """更新简化模式设置"""
    data = _load()
    simplified_mode = body.get("simplified_mode")
    developer_mode = body.get("developer_mode")

    if simplified_mode is not None:
        data["simplified_mode"] = bool(simplified_mode)
    if developer_mode is not None:
        data["developer_mode"] = bool(developer_mode)

    _save(data)
    return {
        "simplified_mode": data.get("simplified_mode", True),
        "developer_mode": data.get("developer_mode", False),
    }
