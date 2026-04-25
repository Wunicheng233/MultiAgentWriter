"""
简单的内存速率限制器
基于 IP 地址的请求频率限制
"""

import time
import threading
from collections import defaultdict
from fastapi import HTTPException, status, Request


class RateLimiter:
    """内存速率限制器"""

    def __init__(self):
        self._requests: dict[str, list[float]] = defaultdict(list)
        self._lock = threading.Lock()

    def _cleanup(self, key: str, window_seconds: int):
        """清理过期的请求记录"""
        now = time.time()
        self._requests[key] = [
            req_time for req_time in self._requests[key]
            if now - req_time < window_seconds
        ]

    def check(self, key: str, max_requests: int, window_seconds: int = 60) -> bool:
        """
        检查是否超过速率限制
        :param key: 限制键（通常是 IP 地址）
        :param max_requests: 窗口内最大请求数
        :param window_seconds: 窗口大小（秒），默认 60 秒
        :return: True 表示允许，False 表示超过限制
        """
        with self._lock:
            self._cleanup(key, window_seconds)
            if len(self._requests[key]) >= max_requests:
                return False
            self._requests[key].append(time.time())
            return True


# 全局限流器实例
rate_limiter = RateLimiter()


def get_ip_from_request(request: Request) -> str:
    """从请求中获取客户端 IP 地址"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",", 1)[0].strip()
    return request.client.host if request.client else "unknown"


def limit_requests(max_requests: int, window_seconds: int = 60):
    """
    速率限制依赖函数
    :param max_requests: 窗口内最大请求数
    :param window_seconds: 窗口大小（秒）
    """

    def dependency(request: Request):
        client_ip = get_ip_from_request(request)
        if not rate_limiter.check(client_ip, max_requests, window_seconds):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"请求过于频繁，请稍后再试。限制：每{window_seconds}秒{max_requests}次"
            )

    return dependency
