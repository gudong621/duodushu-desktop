"""
配置管理路由 - 处理 API keys 和其他应用配置
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import os
from pathlib import Path
from app.config import DATA_DIR
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/config", tags=["config"])

# 配置文件路径
CONFIG_FILE = DATA_DIR / "app_config.json"


class APIKeysConfig(BaseModel):
    """API Keys 配置模型"""
    gemini_api_key: str = ""
    deepseek_api_key: str = ""


def load_config() -> dict:
    """加载配置文件"""
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"加载配置文件失败: {e}")
            return {}
    return {}


def save_config(config: dict) -> None:
    """保存配置文件"""
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        logger.info("配置文件已保存")
    except Exception as e:
        logger.error(f"保存配置文件失败: {e}")
        raise HTTPException(status_code=500, detail="保存配置失败")


@router.get("/api-keys")
def get_api_keys():
    """获取 API keys 配置"""
    config = load_config()
    api_keys = config.get("api_keys", {})

    # 不返回真实的 API keys，只返回是否已配置
    return {
        "gemini_configured": bool(api_keys.get("gemini_api_key")),
        "deepseek_configured": bool(api_keys.get("deepseek_api_key")),
    }


@router.post("/api-keys")
def save_api_keys(keys: APIKeysConfig):
    """保存 API keys 配置"""
    config = load_config()

    if "api_keys" not in config:
        config["api_keys"] = {}

    # 只保存非空的 keys
    if keys.gemini_api_key:
        config["api_keys"]["gemini_api_key"] = keys.gemini_api_key
    if keys.deepseek_api_key:
        config["api_keys"]["deepseek_api_key"] = keys.deepseek_api_key

    save_config(config)

    # 更新环境变量，使新的 keys 立即生效
    if keys.gemini_api_key:
        os.environ["GEMINI_API_KEY"] = keys.gemini_api_key
    if keys.deepseek_api_key:
        os.environ["DEEPSEEK_API_KEY"] = keys.deepseek_api_key

    logger.info("API keys 已更新")

    return {
        "status": "success",
        "message": "API keys 已保存",
        "gemini_configured": bool(keys.gemini_api_key),
        "deepseek_configured": bool(keys.deepseek_api_key),
    }


@router.get("/")
def get_config():
    """获取所有配置"""
    config = load_config()
    return config
