# 外部 API 边界：让成功、拒绝与未知都能被复现

把 HTTP 接口接进 Agent 前，应先建立一个确定性边界：输入符合契约且当前身份有权访问，才发请求；收到完整响应且对象、版本、内容一致，才产出可引用的结果；其余分支返回具体错误或未知状态。模型不能修补这个边界的事实缺口。这里选择一个只读接口实现它：读取 `repo@8e12` 下的文件，为已有失败报告 `test-report-71` 提供证据。

本文的核心问题是：**怎样使一个外部 API 调用既可判错，又能在另一台开发机上复现？**适用条件是上游提供不可变修订的读取服务、调用者身份由可信入口确定、响应大小有界。接口地址、数据合同和夹具都是原创教学设计；下方标准库代码是最小示例，未执行。它没有实现生产认证、服务端访问控制或整体 Agent。

## 成功需要跨过四道边界

`{"path": ["src/refund.py"]}` 是合法 JSON，但不是本接口合法输入。`str(path)` 会把类型错误转为另一个资源名，随后得到“文件不存在”，把错误归因从调用者参数移到仓库。先检查类型，再检查范围；不要用自动转换掩盖输入错误。空字符串、缺字段和未知字段也分别处理，防止调用者悄悄塞入 `tenant` 或任意地址。

合法路径仍不代表授权。当前身份的租户、可读仓库和可读路径由运行时注入，模型只提交资源选择。本文用精确白名单代替通用路径规范化，因此不需要猜测 `../`、符号链接或大小写别名是否等价。若改成目录级权限，必须在资源服务按规范资源身份再次授权；字符串前缀检查不足以定义文件系统边界。

发出请求也不等于取得结果。HTTP 状态描述响应语义，响应正文还需满足业务合同；`200` 内含旧修订文件不是本任务成功。网络超时则没有提供成功正文：对本篇不可变、只读接口可以有界重读，但这仍是一次新尝试。这个结论不能迁移到创建工单。HTTP 对幂等方法的定义与自动重试限制见 [RFC 9110 §9.2.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)，本文业务读接口还要求不存在会改变任务对象的副作用。

最后，响应中的内容哈希只检查正文与响应自述是否一致，不能证明来源可信。来源可信依赖固定服务地址、TLS、身份和上游合同；若需要验证独立发布的签名或预先冻结的哈希，应另外比对可信清单。不要把“计算了 SHA256”写成“内容已经真实”。

## 一个完整的只读适配器

对外输入只有 `repo`、`revision`、`path`。返回值用 `kind` 表达控制含义：`SUCCESS` 可交给证据构建器，`REJECTED` 要修改输入或权限，`UNAVAILABLE` 是当前没有取到结果，`INVALID_RESPONSE` 是上游协议或业务错。响应错误不回传凭据或任意上游正文。

`Transport.get` 契约是一次 GET，返回完整的有界字节和状态，或抛出明确网络异常。实际 HTTP 类禁止重定向，不允许固定地址的凭据被自动带到另一主机。Python 的 `urlopen` 超时针对阻塞操作，并不是端到端总期限；本文没有把 `timeout=5` 称为整个任务最多五秒。[Python 3.14 urllib.request](https://docs.python.org/3.14/library/urllib.request.html)

以下完整代码可保存为 `f01_boundary.py`，依赖 Python 3.14 标准库；默认 `main` 只使用无网络替身。

```python
import hashlib
import json
import socket
import unittest
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import HTTPRedirectHandler, Request, build_opener

MAX_BYTES = 64 * 1024

@dataclass(frozen=True)
class Principal:
    tenant_id: str
    allowed_resources: frozenset  # (repo, revision, path) 精确资源集合

@dataclass(frozen=True)
class Reply:
    status: int
    body: bytes

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

class HttpTransport:
    # 配置来自维护者，不能来自模型或本次请求参数。
    def __init__(self, base_url, token):
        if not base_url.startswith("https://"):
            raise ValueError("HTTPS_REQUIRED")
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.opener = build_opener(NoRedirect())

    def get(self, fields):
        url = self.base_url + "/source?" + urlencode(fields)
        req = Request(url, method="GET", headers={
            "Accept": "application/json",
            "Authorization": "Bearer " + self.token,
        })
        try:
            with self.opener.open(req, timeout=5) as response:
                body = response.read(MAX_BYTES + 1)
                return Reply(response.status, body)
        except HTTPError as error:
            # 错误正文不需要进入模型上下文。
            error.close()
            return Reply(error.code, b"")

def result(kind, code, **data):
    return {"kind": kind, "code": code, **data}

def read_source(raw, principal, transport):
    if type(raw) is not dict:
        return result("REJECTED", "OBJECT_REQUIRED")
    if set(raw) != {"repo", "revision", "path"}:
        return result("REJECTED", "FIELDS_INVALID")
    for name in ("repo", "revision", "path"):
        value = raw[name]
        if type(value) is not str or not value or len(value) > 200:
            return result("REJECTED", "FIELD_INVALID", field=name)
    resource = (raw["repo"], raw["revision"], raw["path"])
    if resource not in principal.allowed_resources:
        return result("REJECTED", "RESOURCE_DENIED")
    try:
        reply = transport.get(raw)
    except (TimeoutError, socket.timeout, URLError):
        return result("UNAVAILABLE", "TRANSPORT_UNKNOWN", retryable=True)
    if reply.status in (401, 403):
        return result("REJECTED", "REMOTE_DENIED")
    if reply.status == 404:
        return result("UNAVAILABLE", "SOURCE_NOT_FOUND", retryable=False)
    if reply.status == 429 or 500 <= reply.status <= 599:
        return result("UNAVAILABLE", "REMOTE_TEMPORARY", retryable=True)
    if reply.status != 200:
        return result("INVALID_RESPONSE", "UNEXPECTED_STATUS")
    if len(reply.body) > MAX_BYTES:
        return result("INVALID_RESPONSE", "BODY_TOO_LARGE")
    try:
        value = json.loads(reply.body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return result("INVALID_RESPONSE", "INVALID_JSON")
    fields = {"repo", "revision", "path", "content", "sha256"}
    if type(value) is not dict or set(value) != fields:
        return result("INVALID_RESPONSE", "RESPONSE_FIELDS")
    if any(type(value[k]) is not str for k in fields):
        return result("INVALID_RESPONSE", "RESPONSE_TYPES")
    if tuple(value[k] for k in ("repo", "revision", "path")) != resource:
        return result("INVALID_RESPONSE", "RESOURCE_MISMATCH")
    try:
        content_bytes = value["content"].encode("utf-8")
    except UnicodeEncodeError:
        return result("INVALID_RESPONSE", "CONTENT_NOT_UTF8")
    digest = hashlib.sha256(content_bytes).hexdigest()
    if value["sha256"] != digest:
        return result("INVALID_RESPONSE", "CONTENT_MISMATCH")
    return result("SUCCESS", "SOURCE_READ", source=value)

class StubTransport:
    def __init__(self, outcome):
        self.outcome = outcome
        self.calls = 0
    def get(self, fields):
        self.calls += 1
        if isinstance(self.outcome, Exception):
            raise self.outcome
        return self.outcome

class BoundaryTests(unittest.TestCase):
    def setUp(self):
        self.raw = {"repo": "repo", "revision": "8e12",
                    "path": "src/refund.py"}
        self.principal = Principal("tenant-dev", frozenset({
            ("repo", "8e12", "src/refund.py")}))
        content = "def refund(days):\n    return days < 7\n"
        self.source = {**self.raw, "content": content,
                       "sha256": hashlib.sha256(content.encode()).hexdigest()}

    def invoke(self, outcome, raw=None):
        stub = StubTransport(outcome)
        answer = read_source(self.raw if raw is None else raw,
                             self.principal, stub)
        return answer, stub.calls

    def test_success(self):
        answer, calls = self.invoke(Reply(200, json.dumps(self.source).encode()))
        self.assertEqual(answer["kind"], "SUCCESS")
        self.assertEqual(calls, 1)

    def test_invalid_type_never_calls_upstream(self):
        answer, calls = self.invoke(Reply(200, b"{}"),
                                   {**self.raw, "path": ["src/refund.py"]})
        self.assertEqual(answer["code"], "FIELD_INVALID")
        self.assertEqual(calls, 0)

    def test_denied_never_calls_upstream(self):
        answer, calls = self.invoke(Reply(200, b"{}"),
                                   {**self.raw, "revision": "other"})
        self.assertEqual(answer["code"], "RESOURCE_DENIED")
        self.assertEqual(calls, 0)

    def test_timeout_is_not_success(self):
        answer, _ = self.invoke(TimeoutError())
        self.assertEqual(answer["kind"], "UNAVAILABLE")

    def test_success_status_with_wrong_revision(self):
        wrong = {**self.source, "revision": "old"}
        answer, _ = self.invoke(Reply(200, json.dumps(wrong).encode()))
        self.assertEqual(answer["code"], "RESOURCE_MISMATCH")

if __name__ == "__main__":
    unittest.main()
```

这里最有价值的断言不是“返回了错误”，而是非法输入和越权资源的 `calls == 0`。它证明了边界在请求前起效。`200` 加错误修订测试则证明请求成功与业务成功分离。`unittest` 提供测试用例和断言机制；上面的预期属于本篇合同，不是 Python 替我们判定的业务正确性。[Python 3.14 unittest](https://docs.python.org/3.14/library/unittest.html)

还有两个边界没有实现：同名 JSON 键重复时，Python 默认解析保留最后值；如果接口合同禁止重复键，应以 `object_pairs_hook` 拒绝，而不能把当前解析称为严格 JSON 协议验证。读响应也没有内容类型校验。这里有明确最大字节数和字段验证，所以可检出主要教学错例；增加生产适配时应按上游协议补齐。JSON 的解析转换与扩展处理见 [Python 3.14 json](https://docs.python.org/3.14/library/json.html)。

## 让另一个开发者复现，而不是复制成功截图

运行命令是 `python3 f01_boundary.py`；预期为五项测试通过，**本稿没有实际输出记录**。读者须记录实际解释器完整版本、操作系统、代码哈希、输入夹具哈希、命令和输出。这里无第三方依赖；没有必要交一个虚构的包锁文件。如果扩展改用第三方 HTTP 客户端，就把版本锁定和安装方法纳入同一证据包，重新执行原断言。

Git 提交确定源文件快照，工作目录尚未提交的修改不在该快照中。`git status`、`git diff`、指定文件 `git add` 后提交，以及 `git rev-parse HEAD` 应一起交接；只有提交 ID 不能描述运行环境。Git 对修改、暂存、提交的区分见 [Git Book：Recording Changes](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository)。这些命令由读者在独立练习目录执行，本轮教材生成没有替读者创建提交。

陌生环境失败时先保留错误，再比较解释器、命令、工作目录、依赖与夹具。若通过删除 `RESOURCE_MISMATCH` 分支“解决”，只是改变了合同。若发现自己用的是另一个解释器，则在记录里更正环境并重跑，旧输出不能绑定新版本。

## 何时扩展这个边界

对短小只读服务，标准库和一个明确适配层足够解释全部控制分支。若服务有流式正文、大规模并发、连接池或端到端期限，换用成熟客户端有现实价值，但应先确定其超时、重定向、自动重试与异常合同；不是用客户端名称替代这些判断。对当前修订不可变且读取便宜的接口，可由运行时有界重读。对服务端拒绝权限，不重复同样请求；对 `200` 内对象错误，暂停该适配器并调查协议，不让模型编写“已取得正确文件”。

观察记录至少应保留请求尝试 ID、可信资源身份、状态分类、耗时和响应哈希。错误正文可能有内部路径与凭据，不需要全部塞进日志或模型。成功证据中的原文能否进入后续上下文，要由 [证据包章节](c02.md) 的权限、版本和引用规则继续约束。

## 三个推理与实作任务

**补齐一个失败分支。**给上述测试添加空路径、未知 `tenant` 字段、`403`、`503`、非法 JSON、错误哈希以及 `content` 含转义孤立代理字符的 JSON。先写各自预期及请求次数，再写测试。参考判断：空路径与未知字段在本地拒绝且零请求；`403` 已取得拒绝响应且不自动重试；`503` 是没有取得本篇结果，可受限重读；非法 JSON 与错误哈希是响应不可信。JSON 能解析为字符串还不保证可编码为本合同的 UTF-8，孤立代理字符在编码处返回 `CONTENT_NOT_UTF8`，不能越过归约或产出证据。应保留本地拒绝与上游拒绝两种不同观察。

**定位“同伴跑不起来”。**作者交来五项绿色截图和 `HEAD`，同伴报告缺少导入的第三方包，而教材声明仅标准库。参考分析：先核截图所用源文件与提交差异，极可能交付代码已扩展但环境说明未更新。补齐实际依赖版本和重建命令，让非作者重跑同样输入；没有非作者记录则复现仍未完成。不能从截图推导陌生环境可启动。

**迁移到写接口。**把读取改成 `create_issue`，请求超时后应该怎样改变返回和重试？参考分析：`UNAVAILABLE` 的只读重读策略必须撤回，保存逻辑动作身份和可能已发状态；超时返回外部效果未知，按原操作身份核对，不换键创建。接口幂等、审批和结果归约分别在 [写工具章节](c03.md) 与 [持久恢复章节](e01.md) 展开。能够写出这项差异，比把五项原测试照搬成写接口测试更能证明理解。

**必要补学路径。**若不能解释字典取字段、类型分支、函数返回与断言失败，先手算 `test_invalid_type_never_calls_upstream` 的控制路径，再在独立练习目录把 `path` 改为列表、空字符串、合法字符串，保存输入与真实结果。补学使用 [Python 官方入门](https://docs.python.org/3.14/tutorial/)；本篇专业正文不把这项先修证据当作已经取得。
