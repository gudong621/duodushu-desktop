import os
import logging
from pathlib import Path

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 代码根目录 (backend/)
# 假设 config.py 在 backend/app/config.py，所以 parent.parent 是 backend/
BASE_DIR = Path(__file__).resolve().parent.parent

# 获取数据目录
# 优先使用环境变量 APP_DATA_DIR，否则默认使用 backend/data (开发环境)
env_data_dir = os.getenv("APP_DATA_DIR")
if env_data_dir:
    DATA_DIR = Path(env_data_dir).resolve()
    logger.info(f"使用环境变量 APP_DATA_DIR: {DATA_DIR}")
else:
    DATA_DIR = BASE_DIR / "data"
    logger.warning(f"未设置 APP_DATA_DIR 环境变量，使用默认开发环境路径: {DATA_DIR}")

# 确保数据目录存在
os.makedirs(DATA_DIR, exist_ok=True)

# 关键路径定义
# 1. 主数据库 (app.db)
DB_PATH = DATA_DIR / "app.db"

# 2. 上传文件目录
UPLOADS_DIR = DATA_DIR / "uploads"
os.makedirs(UPLOADS_DIR, exist_ok=True)

# 3. 词典相关路径
# 注意：原本 dicts 在根目录下，现在我们将其移动到 DATA_DIR 下以便便携
# 如果是开发环境且未指定 DATA_DIR，可能需要兼容旧路径
# 这里我们统一策略：所有数据都在 DATA_DIR 下
DICTS_DIR = DATA_DIR / "dicts"
os.makedirs(DICTS_DIR, exist_ok=True)

MDX_INDEX_DB_PATH = DICTS_DIR / "mdx_index.db"
IMPORTED_DICTS_DIR = DICTS_DIR / "imported"
os.makedirs(IMPORTED_DICTS_DIR, exist_ok=True)

# 4. 其他数据库 (ECDICT, OpenDict)
# 这些通常是只读的资源数据，打包时会包含在资源文件中
# 但为了简单，我们也支持放在 DATA_DIR 下，或者回退到 BASE_DIR/static
# 策略：如果 DATA_DIR 下有，就用 DATA_DIR 的（允许用户覆盖），否则用内置的
def get_resource_path(filename: str, fallback_path: Path) -> Path:
    user_path = DATA_DIR / filename
    if user_path.exists():
        return user_path
    return fallback_path

ECDICT_DB_PATH = get_resource_path("ecdict.db", BASE_DIR / "static" / "ecdict.db")
OPEN_DICT_DB_PATH = get_resource_path("open_dict.db", BASE_DIR / "data" / "open_dict.db") # Legacy fallback

# 导出配置信息摘要
CONFIG_SUMMARY = {
    "data_dir": str(DATA_DIR),
    "db_path": str(DB_PATH),
    "uploads_dir": str(UPLOADS_DIR),
    "dicts_dir": str(DICTS_DIR),
}

logger.info(f"配置加载完成 - DATA_DIR: {DATA_DIR}")