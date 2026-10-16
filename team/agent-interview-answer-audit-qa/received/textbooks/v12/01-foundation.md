# 把文本输入变成可运行可判错的小程序

先把输入解析成对象，再校验对象的形状和业务类型，最后计算并返回可检查的结果。语法正确、进程正常结束和任务结果符合预期是不同条件。读者只需一个短程序就能练清这条边界，不必先理解完整 HTTP 适配器。

本课用本地退款函数和构造断言，不读取文件、访问网络或调用模型。程序目标是复述一个给定测试条件下的观察，允许报告差异；它不决定真实退款政策。示例按 Python 3.14 标准库书写，作者未运行。没有开发环境的读者先完成下面的环境准备；已有基础者先做入口诊断。

## 先做入口诊断

先浏览下方完整短程序，不读后续讲解，逐题写出判断。随后在自己的隔离练习目录操作，保留命令、输入、预期、实际输出和修改记录。

1. `'{"days":7,"expected":true}'` 是什么类型，经过 `json.loads` 后又是什么类型。把 days 换成 `[7]`，为什么解析成功仍应拒绝。
2. `refund(7)` 返回什么。调用 `check_case` 时，文本参数、局部字典和返回结果分别是谁；在哪个分支会在计算前返回。
3. 能否保存并执行下方脚本，取得真实解释器版本和进程退出状态。找不到命令与找不到脚本应分别检查什么。
4. 能否指出一条故意写错的断言，并说明为什么删除断言没有修复问题。假接口返回 HTTP 200 与本程序返回 `CHECKED`，分别证明了哪一层。

参考分析在本课后半部分。已经能完成四项且有操作记录者可转 [问题发现](p01-discovery.md)；仅能猜到答案而不能运行或定位失败者，继续本课。这里没有新增认证分数。

## 准备一个独立练习目录

在自己的新练习目录保存 `foundation.py`，终端切到该目录后运行 `python3 --version`。如果 shell 报 command not found，说明未找到此命令；参照 [Python官方下载](https://www.python.org/downloads/)及 [各系统使用说明](https://docs.python.org/3.14/using/index.html)准备解释器或核命令路径。若版本不是 3.14，记录实际版本，不把它写成目标环境。无需安装第三方依赖。

运行 `python3 foundation.py`。若提示无法打开文件，先核当前目录和文件名；若是 SyntaxError，按文件与行号检查引号、括号和缩进。命令只是启动解释器执行脚本，不会因为文件名含 foundation 就自动执行断言。下面的 `--check` 分支才运行教学断言。

## 完整短程序

`days`必须是非负整数且不超过365，`expected`必须是布尔值；这是教学输入合同，不是退款政策。Python的布尔值与整数有类型关系，因此这里用精确类型检查，拒绝把 `true`当作天数。对象只能有这两个字段，未知字段不能悄悄加入授权。JSON文本和Python对象的转换见 [Python json](https://docs.python.org/3.14/library/json.html)。

```python
import json
import sys

def refund(days):
    return days < 7

def check_case(text):
    try:
        case = json.loads(text)
    except json.JSONDecodeError:
        return {"kind": "REJECTED", "code": "BAD_JSON"}
    except ValueError:
        return {"kind": "REJECTED", "code": "NUMBER_PARSE_LIMIT"}
    if type(case) is not dict or set(case) != {"days", "expected"}:
        return {"kind": "REJECTED", "code": "FIELDS"}
    if type(case["days"]) is not int or not 0 <= case["days"] <= 365:
        return {"kind": "REJECTED", "code": "DAYS"}
    if type(case["expected"]) is not bool:
        return {"kind": "REJECTED", "code": "EXPECTED"}
    actual = refund(case["days"])
    return {"kind": "CHECKED", "days": case["days"],
            "expected": case["expected"], "actual": actual,
            "matches": actual == case["expected"]}

def checks():
    examples = [
        ('{"days":7,"expected":true}', "CHECKED", False),
        ('{"days":6,"expected":true}', "CHECKED", True),
        ('{"days":[7],"expected":true}', "REJECTED", None),
        ('{"days":true,"expected":true}', "REJECTED", None),
        ('{"days":7,', "REJECTED", None),
    ]
    for text, kind, matches in examples:
        result = check_case(text)
        assert result["kind"] == kind, (text, result)
        if kind == "CHECKED":
            assert result["matches"] is matches, (text, result)
    print("checks completed")

def main():
    if len(sys.argv) == 2 and sys.argv[1] == "--check":
        checks()
        return 0
    if len(sys.argv) > 2:
        print("usage: python3 foundation.py [JSON-text | --check]")
        return 2
    text = sys.argv[1] if len(sys.argv) == 2 else '{"days":7,"expected":true}'
    result = check_case(text)
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    return 2 if result["kind"] == "REJECTED" else 0

if __name__ == "__main__":
    raise SystemExit(main())
```

这是面向命令行字符串的合同，`check_case`不接任意Python对象；扩成程序库时须另定义参数类型和最大输入。此短程序也未实现严格JSON重复键拒绝，不能用它取代后续API边界。

## 顺着数据和控制流读程序

`text`保存JSON文本。`json.loads`生成字典，字典中的 `days`是整数、`expected`是布尔值；值为列表不会自动转成整数。`examples`是列表，每个元素存一组教学输入和预期，循环逐组检查。变量保存当前值，函数调用把参数交给局部名称，`return`把结果交回调用者。

`check_case`先处理解析异常，再检查字段、天数和预期值。每个拒绝分支立即返回，后面的 `refund`不会执行。这使你能根据结果code定位失败层，而不只是看到“程序报错”。合法JSON中的整数也可能超过解释器转换限制，解析处的ValueError返回NUMBER_PARSE_LIMIT；若能解析却超出0..365，返回DAYS。`try`只围住JSON转换，其他程序错误不被伪装成输入错误。[Python json](https://docs.python.org/3.14/library/json.html)说明了整数转换限制；分支、函数和选定异常见 [Python控制流](https://docs.python.org/3.14/tutorial/controlflow.html)与 [错误和异常](https://docs.python.org/3.14/tutorial/errors.html)。

默认输入给出 days=7、expected=True。按程序演算，actual=False、matches=False；CHECKED表示程序完成了检查，不表示给定断言成立。正常退出0也只表示这次检查按合同完成，不能说明退款规则已核实。拒绝输入约定退出2；退出状态的机制见 [sys.exit](https://docs.python.org/3.14/library/sys.html#sys.exit)。这些输出是演算预期，实际输出应由你的运行记录提供。

运行 `python3 foundation.py --check`后，在macOS或Linux shell用 `echo $?`读取上一命令退出状态；PowerShell可查看 [`$LASTEXITCODE`](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_automatic_variables?view=powershell-7.6#lastexitcode)。不要在运行与读取状态之间插入另一条命令。随后复制一条断言，故意把第七天的matches预期改成True再运行，定位失败，恢复原预期并重跑。使用普通解释器模式，不能用会移除assert的优化选项完成此诊断；断言用于教学检查，不承担生产输入校验。[Python assert](https://docs.python.org/3.14/reference/simple_stmts.html#the-assert-statement)

## 根据失败补对应基础

若认为 `[7]`应该“转成7就行”，补数据类型和合同：这会掩盖调用者传错形状。若认为CHECKED意味着测试通过，补返回值与业务判断：matches才表示本次给定断言是否一致。若只看屏幕上有没有checks completed，补断言和退出状态：必须把实际值、断言位置和退出一起解释。

请求与响应还要再分一层。假读取接口返回 `200`及 `{}`，只有HTTP响应，可能仍缺必须字段；`403`是已收到拒绝；超时可能没有完整响应。它们都不能推导读到了正确文件。这个边界在 [API适配器](f01.md)落实；先理解这里的输入、处理和输出，不要求现在发网络请求。

练习：给days=-1、expected="true"和合法JSON数组各写预期code，再运行取得实际值。参考分析：分别是DAYS、EXPECTED和FIELDS，均应在refund前返回；`"true"`是字符串，不能冒充布尔值。若程序因缺字段抛KeyError，说明你删掉了先检查字段集合的分支，应恢复分支而非补一个默认政策。

练习：将源函数临时改为 `days <= 7`后，默认题发生什么变化，原教学断言应该怎样处理。参考分析：matches变True，旧断言应指出行为改变。不能顺手把断言改绿后声称原差异已证明修复；是否允许比较符变化还需真实业务规则。保留修改前后记录，恢复教学源，再进入 [问题发现](p01-discovery.md)。


---

## v12 学习衔接

本单元为30单元路线的第2单元。正式先修：[认识Agent工程](00-learning-route.md)。按v12完整路线，下一单元为[Python与模型基础](n01-python-model-foundations.md)；上文保留的旧版关联仍可作主题参考。本篇原专业正文与代码完整迁移，历史验证仍只适用于原记录范围，不因复制获得新的执行结论。
