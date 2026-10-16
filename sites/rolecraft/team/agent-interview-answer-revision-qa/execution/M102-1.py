from copy import deepcopy

a = {"messages": [{"tags": []}]}
b = a.copy()
assert a is not b
assert a["messages"] is b["messages"]
b["messages"][0]["tags"].append("B")
assert a["messages"][0]["tags"] == ["B"]
c = deepcopy(a)
c["messages"][0]["tags"].append("C")
assert a["messages"][0]["tags"] == ["B"]
t = ([],)
t[0].append("still mutable")
assert t[0] == ["still mutable"]
