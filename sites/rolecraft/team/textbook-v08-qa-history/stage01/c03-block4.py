from dataclasses import dataclass

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
