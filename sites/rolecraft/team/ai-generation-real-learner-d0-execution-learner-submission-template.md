# D0-03 学习者本人执行提交模板

合同：`AI-REAL-LEARNER-D0-EXEC-20261016-001`  
诊断：`D0-AI-20261015-001`

请由学习者本人在项目根目录执行以下命令。不要修改冻结夹具、runner 或历史 QA 工件；不要调用网络、真实模型/API、云、付费服务、生产数据或外部动作。

```sh
cd "/Users/shengxiong/Desktop/One People Company"
RUNNER="sites/rolecraft/team/ai-generation-real-learner-d0-execution-run-v01-artifacts/implementation/d0_03_runner.py"
INPUT="sites/rolecraft/team/ai-generation-real-learner-d0-execution-run-v01-artifacts/input-snapshot.json"
RECEIPTS="sites/rolecraft/team/ai-generation-real-learner-d0-execution-learner-receipts"
mkdir -p "$RECEIPTS/run-1" "$RECEIPTS/run-2"
pwd > "$RECEIPTS/pwd.txt"
python3 --version > "$RECEIPTS/python-version.txt" 2>&1
sha256sum sites/rolecraft/team/ai-generation-l0-practice-source-001/frozen_input.json > "$RECEIPTS/frozen-input.sha256"
sha256sum sites/rolecraft/team/ai-generation-l0-practice-source-001/replay_verify.py > "$RECEIPTS/replay-verify.sha256"
for run in run-1 run-2; do
  date -Iseconds > "$RECEIPTS/$run.started-at"
  for case in A-normal B-tenant-denied source-missing source-conflict; do
    python3 "$RUNNER" --case "$case" --run-id "$run" --input "$INPUT" \
      > "$RECEIPTS/$run/$case.stdout" \
      2> "$RECEIPTS/$run/$case.stderr"
    printf '%s\t%s\t%s\n' "$run" "$case" "$?" >> "$RECEIPTS/exit-codes.tsv"
  done
  date -Iseconds > "$RECEIPTS/$run.ended-at"
done
rm -f "$RECEIPTS/SHA256SUMS" "$RECEIPTS/BYTES"
find "$RECEIPTS" -type f -print0 | sort -z | xargs -0 sha256sum > "$RECEIPTS/SHA256SUMS"
find "$RECEIPTS" -type f -print0 | sort -z | xargs -0 wc -c > "$RECEIPTS/BYTES"
```

提交时还需由学习者本人填写：实际命令入口、执行时间、环境、本人确认声明和签收时间。测试工程师收到该目录后，独立核对四场景、run-1/run-2、B 正文未访问证据、bytes/SHA、停止收据和 `external_action=null`。

```text
学习者本人确认：以上命令由我本人执行，未读取/缓存/摘要/暴露 B 租户正文，未调用外部服务或执行外部动作。
学习者姓名或内部标识：
执行时间（Asia/Shanghai）：
签收时间（Asia/Shanghai）：
```
