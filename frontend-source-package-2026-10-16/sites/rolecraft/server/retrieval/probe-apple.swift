import Foundation
import NaturalLanguage
var result: [[String: Any]] = []
for language in [NLLanguage.simplifiedChinese, .traditionalChinese, .english] {
 let sentence = NLEmbedding.sentenceEmbedding(for: language)
 let word = NLEmbedding.wordEmbedding(for: language)
 result.append(["language":language.rawValue,"sentenceAvailable":sentence != nil,"sentenceDimension":sentence?.dimension ?? 0,"wordAvailable":word != nil,"wordDimension":word?.dimension ?? 0,"testVector":sentence?.vector(for:"程序挂掉之后重新启动，怎样接着之前的进度干下去") != nil])
}
let data = try JSONSerialization.data(withJSONObject: result, options: [.sortedKeys])
print(String(data:data,encoding:.utf8)!)
