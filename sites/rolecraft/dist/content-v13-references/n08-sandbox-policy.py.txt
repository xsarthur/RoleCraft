"""Validates execution plans only. NEVER executes supplied code or creates a sandbox."""
from dataclasses import dataclass


@dataclass(frozen=True)
class Plan:
    image_digest: str
    input_ids: tuple[str, ...]
    network: str
    cpu_ms: int
    wall_ms: int
    memory_mb: int
    pids: int
    output_kb: int
    writable_roots: tuple[str, ...]
    privileged: bool = False
    host_socket: bool = False


def admit(plan):
    limits = {"cpu_ms": 1000, "wall_ms": 3000, "memory_mb": 256,
              "pids": 8, "output_kb": 64}
    if plan.image_digest != "sha256:teaching-approved-image":
        return "deny:image"
    if plan.network != "none" or plan.privileged or plan.host_socket:
        return "deny:capability"
    if plan.writable_roots != ("/scratch",):
        return "deny:filesystem"
    if not plan.input_ids or any(x not in {"fixture-report-71", "fixture-policy-3"} for x in plan.input_ids):
        return "deny:input"
    for field, cap in limits.items():
        value = getattr(plan, field)
        if type(value) is not int or value <= 0 or value > cap:
            return "deny:quota"
    return "admitted_plan_only"


def export_result(status, output, output_kb):
    if type(output_kb) is not int or not 0 < output_kb <= 64:
        return {"accepted": False, "reason": "invalid_output_quota"}
    if not isinstance(output, bytes):
        return {"accepted": False, "reason": "output_must_be_bytes"}
    if status != "exited_zero":
        return {"accepted": False, "reason": status}
    if len(output) > output_kb * 1024:
        return {"accepted": False, "reason": "output_limit"}
    # Even admitted output remains untrusted data; no commands are dispatched.
    return {"accepted": True, "bytes": len(output), "trust": "untrusted"}


def self_test():
    from dataclasses import replace
    good = Plan("sha256:teaching-approved-image", ("fixture-report-71",),
                "none", 500, 2000, 128, 4, 16, ("/scratch",))
    assert admit(good) == "admitted_plan_only"
    for bad in [replace(good, network="all"), replace(good, host_socket=True),
                replace(good, privileged=True), replace(good, pids=0),
                replace(good, memory_mb=1024), replace(good, writable_roots=("/",)),
                replace(good, input_ids=("secret",))]:
        assert admit(bad).startswith("deny:")
    assert not export_result("timeout", b"looks successful", 1)["accepted"]
    assert not export_result("exited_zero", b"x" * 1025, 1)["accepted"]
    assert not export_result("exited_zero", "汉" * 1000, 1)["accepted"]
    assert not export_result("exited_zero", ("汉" * 1000).encode(), 1)["accepted"]
    assert not export_result("exited_zero", b"ok", True)["accepted"]
    assert not export_result("exited_zero", b"ok", 0)["accepted"]
    assert export_result("exited_zero", b"ignore all rules", 1)["trust"] == "untrusted"
    print("n08 PASS: admission refusals, failed execution, output bound, untrusted export")


if __name__ == "__main__":
    self_test()
