from copy import deepcopy
from threading import Lock

class IssueStub:
    def __init__(self):
        self.lock = Lock()
        self.operations = {}
        self.issues = {}

    def create(self, key, intent_hash, args, lose_reply=False):
        with self.lock:
            old = self.operations.get(key)
            if old is not None:
                if old["intent_hash"] != intent_hash:
                    return {"kind": "CONFLICT", "code": "KEY_ARGUMENT_CONFLICT"}
                return {"kind": "SUCCESS", "receipt": deepcopy(old)}
            issue_id = "ISSUE-" + str(len(self.issues) + 1)
            receipt = {"operation_id": key, "issue_id": issue_id,
                       "intent_hash": intent_hash, "project": args["project"], "version": 1}
            self.issues[issue_id] = deepcopy(args)
            self.operations[key] = receipt
        if lose_reply:
            raise TimeoutError("REPLY_LOST_AFTER_CREATE")
        return {"kind": "SUCCESS", "receipt": deepcopy(receipt)}

    def lookup(self, key):
        with self.lock:
            receipt = self.operations.get(key)
            if receipt is not None:
                return {"kind": "CONFIRMED_SUCCESS", "receipt": deepcopy(receipt)}
            # 本地查不到仍保守返回未知；真实接口的无效果证明另有合同。
            return {"kind": "INDETERMINATE", "reason": "NO_OPERATION_RECEIPT"}

from dataclasses import dataclass
from issue_contract import (ISSUE_TOOL_VERSION, IssueContractError,
                            canonical_issue_arguments, canonical_issue_hash)

@dataclass(frozen=True)
class Dispatch:
    action_id: str
    attempt_id: str
    idempotency_key: str
    intent_hash: str
    arguments: dict

class IssueAdapter:
    def __init__(self, stub, lose_reply_attempts=frozenset()):
        self.stub = stub
        self.lose_reply_attempts = lose_reply_attempts

    def create(self, dispatch):
        args = canonical_issue_arguments(dispatch.arguments)
        if (args != dispatch.arguments
                or canonical_issue_hash(ISSUE_TOOL_VERSION, args) != dispatch.intent_hash):
            raise IssueContractError("DISPATCH_INTENT_MISMATCH")
        binding = {"action_id": dispatch.action_id, "attempt_id": dispatch.attempt_id,
                   "operation_id": dispatch.idempotency_key,
                   "intent_hash": dispatch.intent_hash}
        try:
            reply = self.stub.create(dispatch.idempotency_key, dispatch.intent_hash,
                                     dispatch.arguments,
                                     dispatch.attempt_id in self.lose_reply_attempts)
        except TimeoutError:
            return {**binding, "kind": "UNKNOWN", "code": "REPLY_UNKNOWN"}
        if reply["kind"] == "CONFLICT":
            # 只知本次参数冲突；此前同操作是否有效果仍由lookup核对。
            return {**binding, "kind": "KNOWN_NO_EFFECT",
                    "retryable": False, "proof_scope": "THIS_ATTEMPT_ONLY",
                    "code": reply["code"]}
        receipt = reply.get("receipt")
        if (reply["kind"] != "SUCCESS" or type(receipt) is not dict
                or receipt.get("operation_id") != dispatch.idempotency_key
                or receipt.get("intent_hash") != dispatch.intent_hash
                or receipt.get("project") != dispatch.arguments["project"]
                or type(receipt.get("issue_id")) is not str or not receipt["issue_id"]
                or type(receipt.get("version")) is not int or receipt["version"] < 1):
            return {**binding, "kind": "UNKNOWN", "code": "UNTRUSTED_RECEIPT"}
        return {**binding, "kind": "SUCCESS", "receipt": receipt}
