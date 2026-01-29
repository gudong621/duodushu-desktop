import google.generativeai as genai
import os
import logging
from typing import Optional, List, Dict
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 配置日志
logger = logging.getLogger(__name__)

# 获取 API Key
API_KEY = os.environ.get("GEMINI_API_KEY")

if API_KEY:
    try:
        genai.configure(api_key=API_KEY)
        logger.info("Gemini API 已配置")
    except Exception as e:
        logger.error(f"Gemini API 配置失败: {e}")
else:
    logger.warning("未找到 GEMINI_API_KEY，Gemini 功能将不可用")

# 模型配置
MODEL_NAME = "models/gemini-3-flash-preview"  # 使用最新的 Gemini 3 预览版
GENERATION_CONFIG = {
    "temperature": 0.2,
    "top_p": 0.8,
    "top_k": 40,
}

def get_model():
    """获取 Gemini 模型实例"""
    if not API_KEY:
        logger.warning("GEMINI_API_KEY 未设置，无法创建模型")
        return None
    try:
        return genai.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config=GENERATION_CONFIG,
        )
    except Exception as e:
        logger.error(f"创建 Gemini 模型失败: {e}")
        return None

async def chat_with_ai(
    prompt: str, 
    history: List[Dict] = None, 
    stream: bool = False
):
    """
    与 Gemini 进行对话的通用接口
    """
    model = get_model()
    if not model:
        return None
        
    try:
        # 转换历史记录格式为 Gemini 格式
        gemini_history = []
        if history:
            for msg in history:
                role = "user" if msg["role"] == "user" else "model"
                gemini_history.append({"role": role, "parts": [msg["content"]]})
        
        chat = model.start_chat(history=gemini_history)
        response = await chat.send_message_async(prompt, stream=stream)
        return response.text
    except Exception as e:
        logger.error(f"Gemini 对话失败: {e}")
        return None

def translate_text(text: str, target_lang: str = "中文") -> Optional[str]:
    """使用 Gemini 翻译文本"""
    model = get_model()
    if not model:
        return None
        
    prompt = f"请将以下文本翻译成{target_lang}，只返回翻译结果，不要有任何解释：\n\n{text}"
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini 翻译失败: {e}")
        return None
