import json
import pathlib
import re
from html.parser import HTMLParser

root = pathlib.Path('sites/rolecraft/team/agent-interview-answer-revision-qa/integration-data')
manifest = json.loads((root / 'received/textbooks/interview-answers-v1/manifest.json').read_text())

class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
    def handle_data(self, value):
        self.parts.append(value)

failures = []
items = []
for item in manifest['items']:
    rendered = (root / 'rendered' / (item['id'] + '.html')).read_text()
    article = rendered.split('<article class="ia-prose"', 1)[1].split('>', 1)[1].split('</article>', 1)[0]
    parser = VisibleText()
    parser.feed(article)
    visible = re.sub(r'\s+', '', ''.join(parser.parts))
    code = False
    count = 0
    for number, line in enumerate(pathlib.Path(item['answerPath']).read_text().splitlines(), 1):
        if re.match(r'^\s*```', line):
            code = not code
            continue
        if code or not line.strip() or re.match(r'^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$', line):
            continue
        line = re.sub(r'!?\[([^\]]*)\]\([^\s)]+\)', r'\1', line)
        # Current tables start with a pipe. Inline mathematical norms are retained.
        if line.lstrip().startswith('|'):
            line = line.replace('|', '')
        line = re.sub(r'^\s*(?:#{1,6}\s+|[-*+]\s+|\d+[.)]\s+|>\s*)', '', line)
        line = re.sub(r'\s+', '', re.sub(r'[`*]', '', line)).replace('\\', '')
        if not line:
            continue
        count += 1
        if line not in visible:
            failures.append({'id': item['id'], 'line': number, 'expectedText': line})
    items.append({'id': item['id'], 'proseLinesChecked': count})
result = {'status': 'pass' if not failures else 'fail', 'scope': 'Every nonblank prose/list/table/heading line survives in rendered article visible text, ignoring Markdown formatting and whitespace; code bytes checked separately in verify.cjs.', 'items': items, 'proseLinesChecked': sum(x['proseLinesChecked'] for x in items), 'failures': failures}
(root / 'prose-result.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'status': result['status'], 'items': len(items), 'proseLinesChecked': result['proseLinesChecked'], 'failures': failures}, ensure_ascii=False))
