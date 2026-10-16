import asyncio
import inspect
from functools import wraps

def logged(emit):
    def safe_emit(event):
        try:
            emit(event)
        except Exception:
            pass  # 教学策略：日志错误不覆盖业务返回或异常

    def decorate(fn):
        if inspect.iscoroutinefunction(fn):
            @wraps(fn)
            async def async_wrapper(*args, **kwargs):
                status = "raised"
                try:
                    value = await fn(*args, **kwargs)
                    status = "returned"
                    return value
                except asyncio.CancelledError:
                    status = "cancelled"
                    raise
                finally:
                    safe_emit((fn.__name__, status))
            return async_wrapper
        @wraps(fn)
        def sync_wrapper(*args, **kwargs):
            status = "raised"
            try:
                value = fn(*args, **kwargs)
                status = "returned"
                return value
            finally:
                safe_emit((fn.__name__, status))
        return sync_wrapper
    return decorate
