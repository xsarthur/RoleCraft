class Node:
    __slots__ = ("key", "value", "prev", "next")
    def __init__(self, key=None, value=None):
        self.key, self.value = key, value
        self.prev = self.next = self

class LRU:
    def __init__(self, capacity):
        if type(capacity) is not int or capacity < 0:
            raise ValueError("capacity must be nonnegative int")
        self.capacity = capacity
        self.nodes = {}
        self.root = Node()

    def _unlink(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _append(self, node):
        tail = self.root.prev
        node.prev, node.next = tail, self.root
        tail.next = node
        self.root.prev = node

    def _touch(self, node):
        self._unlink(node)
        self._append(node)

    def get(self, key):
        node = self.nodes[key]
        self._touch(node)
        return node.value

    def put(self, key, value):
        if self.capacity == 0:
            return
        if key in self.nodes:
            node = self.nodes[key]
            node.value = value
            self._touch(node)
            return
        node = Node(key, value)
        self.nodes[key] = node
        self._append(node)
        if len(self.nodes) > self.capacity:
            oldest = self.root.next
            self._unlink(oldest)
            del self.nodes[oldest.key]

    def keys_old_to_new(self):
        keys = []
        node = self.root.next
        while node is not self.root:
            keys.append(node.key)
            node = node.next
        return keys

    def __len__(self):
        return len(self.nodes)

def must_miss(cache, key):
    try:
        cache.get(key)
    except KeyError:
        return
    raise AssertionError("expected miss")

zero = LRU(0)
zero.put("a", 1)
assert len(zero) == 0
must_miss(zero, "a")
cache = LRU(2)
cache.put("a", 1)
cache.put("b", 2)
assert cache.keys_old_to_new() == ["a", "b"]
assert cache.get("a") == 1
cache.put("c", 3)
must_miss(cache, "b")
assert cache.keys_old_to_new() == ["a", "c"]
cache.put("a", 9)
assert len(cache) == 2 and cache.keys_old_to_new() == ["c", "a"]
cache.put("d", None)
must_miss(cache, "c")
assert cache.get("d") is None
one = LRU(1)
one.put("x", 1)
one.put("x", 2)
assert one.get("x") == 2
one.put("y", 3)
must_miss(one, "x")
print("LRU assertions passed")
