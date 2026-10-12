# v12 新示例运行说明

所有示例从本目录或教材目录执行，使用无敏感教学夹具；不会调用收费模型、接入真实账户或修改应用数据库。作者已做开发自查，独立执行范围与结果以本轮QA报告为准。复制旧章的围栏不在此列表，不因迁移获得新执行结论。

标准库例使用Python 3.14.5自查。`n06-graph.py`另使用本机已经安装的LangGraph 1.2.4、langgraph-checkpoint 4.1.1、langchain-core 1.4.0；只在本进程关闭LangSmith tracing，使用内存checkpointer，无模型/网络/业务写操作。读者重建环境时需保存完整依赖锁；未附锁的其他依赖组合不能直接视为已验证。

| 命令（在v12目录） | 实际机制与关键失败路径 | 不代表什么 |
| --- | --- | --- |
| `python3 examples/n01-runtime-boundaries.py` | 对象/装饰器/LRU/异步与输出消费 | 实际LLM推理或外部调用效果 |
| `python3 examples/n02-memory-routing.py` | 记忆生命周期与任务切换策略 | Few-shot模型效果或生产记忆服务 |
| `python3 examples/n03-plan-execution.py` | 计划图、失效传播和停止 | 真实模型规划质量 |
| `python3 examples/n04-tool-catalog.py` | 工具目录及调用重验 | 真实MCP/OAuth互操作 |
| `python3 examples/n05-index-lifecycle.py` | 向量运算、版本索引与来源拒绝 | 实际Embedding/OCR/ANN运行 |
| `python3 examples/n06-graph.py` | 真实LangGraph并行join、schema子图、暂停/恢复、拒绝/过期摘要/冲突 | LLM效果、跨进程持久恢复或外部exactly-once |
| `python3 examples/n06-graph-contracts.py` | 流消费者重复/缺序/终态策略 | 真正网络重连 |
| `python3 examples/n07-delegation.py` | 去重、epoch、冲突、预算及不完整结果 | A2A服务或远端账单 |
| `python3 examples/n08-sandbox-policy.py` | 执行Plan拒绝、字节额度、不可信输出 | OS隔离、容器/cgroup执行 |
| `python3 examples/n09-runtime-recovery.py` | 熔断代际、补偿未知效果核对、取消围栏 | 持久数据库事务或真实供应商稳定性 |
| `python3 examples/n09-memory-diagnostic.py` | 有限tracemalloc保留/限长缓存/临时分配对照 | 生产RSS、GPU或长期负载性能 |
| `python3 examples/n10-evaluation-matrix.py` | 实验可行条件、跨语轨迹首差异和移交缺项 | 真实质量分、语言等价证明或接手成功 |

新例有断言时请用常规解释器运行，不加`-O`移除断言。失败用输入、错误输出和环境版本提交给独立评阅人；不要为了输出PASS删除失败分支。例中的数值预算用于明确机制，不是本产品或行业的生产阈值。

原文中的外部调用作业只供有明确权限和预算的学习者在隔离环境完成；本轮教材补齐没有替任何读者执行这些作业。
