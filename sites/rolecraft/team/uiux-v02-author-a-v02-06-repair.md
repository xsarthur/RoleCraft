# UI/UX v0.2 作者A返修：V02-06身份命名

日期：2026-10-14。责任：教材研发员A。状态：`author_repaired_pending_independent_recheck`。

## 原例与影响

独立内容审校指出，第12章CR-08 diff用requestId/requestRevision承载R-81申请身份；第07章requestId用于一次请求尝试，第21章又用actionId承载R-81。原稿容易让读者把恢复一次尝试误解为创建一个新申请，或拿请求ID查询逻辑动作。

## 本次实际改动

只修改第12章与其治理工件。2.0输入与reviewRequest、confirmApproval的事件参数统一为refundId/refundRevision；submitted同样绑定refundId/refundRevision，另带本次批准提交的requestId。旧1.x的requestId只留在diff删除行，并明确它是当时错误命名的申请字段，文稿别名legacyRequestId；迁移核实后映射refundId，不沿用为2.0请求尝试ID。

增加与第07/21章的命名映射：refundId=R-81对应actionId；refundRevision=4对应当前检查的expectedVersion或匹配的approvedVersion；requestId和attemptId都属于尝试层，若接口同时区分运输请求与执行尝试，保留关联而不默认等同。退款发送send-01失联后查询query-02，申请仍是R-81@v4，不产生R-82。

草稿、政策版本没有变更；未改第07/11/15/21章、SVG、应用、旧作者自查或前次修复记录。原修复文件和自查文件起止哈希一致。

## 作者自查与待复验

逐项核对2.0新增输入和三个事件的参数，申请身份均为refundId/refundRevision；两份修改稿中requestRevision残留为0。保留的requestId均有“1.x旧误名”或“本次尝试”的明确含义。作者自查只覆盖文稿与映射，没有运行支付、接口或迁移。

请B根据当前源文件重新组装；独立内容审校按V02-06原例复查12、治理工件及07/11/15/21关联语义，决定是否关闭缺陷。此记录不自行授予独立通过。

## 起止绑定

| 文件 | 收到SHA256 | 返修后SHA256 | 状态 |
| --- | --- | --- | --- |
| `textbooks/uiux-design-v02/chapters/12-design-system-governance.md` | `2a69b6fb0f0cd17d42eaf12720c086934c8ebd2967ea66ff0df1de590417114f` | `52e9eacd776d2bbb398eec81e60a4ea7bbc0dc1afc0c55b2d9630611c7f27246` | 本次返修 |
| `textbooks/uiux-design-v02/exercises/12-governance-records.md` | `cdc6c0549bca491f5a4f7c3985bb08d8ea9b149c269d199b226131fc50ab2b0a` | `4733ac263f94f9211d6def29955ed90de9ca4c31f72c599f536f1be056c6be62` | 本次返修 |
| `team/uiux-v02-author-a-repair.md` | `c61da2e437d1e8dfddcebfc89bf2985ae921a7e81688d0e1525ee89fc1113506` | `c61da2e437d1e8dfddcebfc89bf2985ae921a7e81688d0e1525ee89fc1113506` | 保留未改 |
| `team/uiux-v02-author-a.md` | `c7c1ee26fc19910ce8e1174f52bba7abd9d804c352dfea84896cb679d71edff4` | `c7c1ee26fc19910ce8e1174f52bba7abd9d804c352dfea84896cb679d71edff4` | 保留未改 |

