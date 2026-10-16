#import <Foundation/Foundation.h>
#import <NaturalLanguage/NaturalLanguage.h>
int main(void) { @autoreleasepool {
 NSMutableArray *rows = [NSMutableArray array];
 for(NSString *lang in @[@"zh-Hans", @"zh-Hant", @"en"]) {
  fprintf(stderr,"probe %s\n",lang.UTF8String);
  NLEmbedding *sentence=[NLEmbedding sentenceEmbeddingForLanguage:lang];
  NLEmbedding *word=[NLEmbedding wordEmbeddingForLanguage:lang];
  [rows addObject:@{@"language":lang,@"sentenceAvailable":@(sentence!=nil),@"sentenceDimension":@(sentence.dimension),@"wordAvailable":@(word!=nil),@"wordDimension":@(word.dimension),@"testVector":@([sentence vectorForString:@"程序挂掉之后重新启动，怎样接着之前的进度干下去"]!=nil)}];
 }
 NSData *data=[NSJSONSerialization dataWithJSONObject:rows options:0 error:nil];
 puts([[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding].UTF8String);
 } return 0; }
