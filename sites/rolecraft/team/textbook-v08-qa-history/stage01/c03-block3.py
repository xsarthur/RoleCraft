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
