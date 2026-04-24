"""检查用户 API Key 配置"""

from backend.database import SessionLocal
from backend.auth import get_user_api_key
from backend.models import User
from core.config import settings


def mask_secret(value: str | None) -> str:
    if not value:
        return "未配置"
    if len(value) <= 8:
        return "已配置（已隐藏）"
    return f"{value[:4]}...{value[-4:]} (长度: {len(value)})"


db = SessionLocal()

print("=" * 60)
print("系统配置检查")
print("=" * 60)

# 检查系统环境配置
system_api_key = settings.get_api_key_for_agent("default")
print("\n1. 系统统一模型密钥:")
if system_api_key:
    print(f"   ✅ {mask_secret(system_api_key)}")
else:
    print("   ❌ 未配置（空）")

# 检查用户 1
user = db.query(User).filter(User.id == 1).first()
if user:
    print(f"\n2. 用户 ID=1 ({user.username}):")
    user_api_key = get_user_api_key(user)
    if user_api_key and user_api_key.strip():
        print(f"   ✅ 用户已配置模型密钥: {mask_secret(user_api_key)}")
    else:
        print("   ❌ 用户未配置模型密钥")
    print(f"   提示：请在前端登录后，进入用户设置页面设置火山引擎 API Key")
else:
    print("\n2. 用户 ID=1 不存在")

print("\n" + "=" * 60)
print("\n💡 提示：")
print("- 如果用户未配置，系统会回退到使用系统配置")
print("- 如果系统配置也为空，任务会失败并提示错误")
print("- 你需要：要么用户在前端设置 API Key，要么在 .env 文件配置 UNIFIED_API_KEY")

db.close()
