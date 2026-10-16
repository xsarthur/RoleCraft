# D0-03 学习者提交包 v0.2

本目录是为 `learner_id=learner-7391842650` 准备的学习者提交包草稿。

当前状态：`pending_learner_execution_and_signature`

本包只准备提交结构和声明草稿，不把既有 AI 生成工程师/QA 回放收据改标为学习者执行证据。学习者本人需要在新的、未污染的目录中重新运行冻结合同指定的四个场景两轮，并把实际产生的原始 stdout/stderr、退出码、EvidenceCard、输入快照和哈希清单放入本提交包或作为受控提交附件。

学习者本人还必须亲自补齐 `learner-statement.draft.txt` 中的签名和签署时间。QA 不得代签。

安全运行入口是 `learner-run-v02.sh`。它只会新建并写入本目录下的 `raw-receipts/`，如果该目录已经存在会拒绝运行；不要运行旧的 `ai-generation-real-learner-d0-execution-learner-run-v01.sh`，因为旧脚本指向历史收据目录。

第一次运行因入口错误把长 run ID 传给只接受 `run-1`/`run-2` 的底层 runner，失败记录保留在 `raw-receipts/`，不得删除或覆盖。修正版只写入新的 `raw-receipts-retry-01/`。

`retry-01` 的场景运行本身通过，但其收据误记录了原 v02 入口的脚本哈希；该记录也保留。最终入口 `learner-run-v02-retry-02.sh` 会从自身实际路径计算脚本哈希，只写入新的 `raw-receipts-retry-02/`。

从项目根目录运行：

```text
zsh sites/rolecraft/team/ai-generation-real-learner-d0-execution-learner-submission-v02/learner-run-v02.sh
```

请改用修正版：

```text
zsh sites/rolecraft/team/ai-generation-real-learner-d0-execution-learner-submission-v02/learner-run-v02-retry-01.sh
```

最终请运行：

```text
zsh sites/rolecraft/team/ai-generation-real-learner-d0-execution-learner-submission-v02/learner-run-v02-retry-02.sh
```

接收方 Chenny 使用 `receiver-replay-v01.sh`，它会在 `/private/tmp` 创建新的临时目录，只写接收方自己的复验输出，不读取学习者 stdout 作为自身结果：

```text
zsh sites/rolecraft/team/ai-generation-real-learner-d0-execution-learner-submission-v02/receiver-replay-v01.sh
```

脚本结束后，把打印的 `fresh_temp_directory:` 和 `rebuild_command:` 原样填入 `receiver-acceptance-v01.json`。未公开 holdout 仍须由 Chenny 独立完成并保留证据。

动态 holdout 入口是 `receiver-holdout-v01.sh`，只能由 Chenny 在独立会话运行：

```text
CHENNY_RECEIVER=true zsh sites/rolecraft/team/ai-generation-real-learner-d0-execution-learner-submission-v02/receiver-holdout-v01.sh
```

它会在 `/private/tmp` 随机生成一个不提前公开的来源变体并保存证据。当前 runner 的来源实现是固定的，因此脚本会如实记录 `not_met_implementation_limitation`，不会伪造 holdout 通过。

本次 Chenny holdout 已发现该限制：holdout 输入改变了来源版本，但 runner 仍返回原退款来源绑定。该结果已另存为 `receiver-acceptance-v02-rejection.json` 的有据拒收草稿；原 `receiver-acceptance-v01.json` 保留为历史记录，不覆盖。

动态来源修复已提供版本化入口，不覆盖 v01：`receiver-replay-v02.sh` 使用 `d0_03_runner-v02-dynamic.py`，`receiver-holdout-v02.sh` 用于 Chenny 重新生成动态 holdout。两者均只写新的 `/private/tmp` 证据目录。

新版 replay/holdout 证据已登记到 `receiver-acceptance-v03-dynamic-v02.json`，但该记录仍等待 Chenny 本人确认和签名；旧 v01 签名不自动迁移到新版实现。

最后的真人确认模板是 `chenny-receiver-confirmation-v01.txt`。该文件必须由 Chenny 本人在受控会话填写确认时间和签名；项目经理或 Larry 不代填。

完成本人执行和签名后，再由独立接收方从本包重建命令，独立复跑四场景及未公开 holdout，并填写 `handoff-to-qa-submission.json` 的接收结果。接收方不得是本学习者本人。

现有原始收据目录、原 `SHA256SUMS`、原签收声明和 QA 派生文件保持只读；本包不覆盖它们。
