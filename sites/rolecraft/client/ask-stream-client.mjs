/**
 * Browser-side reader for 问教材 SSE.
 * Answer deltas are applied before the final event, which carries citations.
 */

export async function consumeLearningQueryStream(response, onDelta) {
  if (!response?.body || typeof response.body.getReader !== 'function') throw Error('教材问答没有可读取的流');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let donePayload = null;
  const feed = block => {
    const lines = block.split('\n');
    let event = 'message';
    const data = [];
    for (const line of lines) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
    }
    if (!data.length) return;
    const payload = JSON.parse(data.join('\n'));
    if (event === 'answer' && typeof payload.delta === 'string' && payload.delta) onDelta(payload.delta);
    else if (event === 'done') donePayload = payload;
    else if (event === 'error') throw Error(payload.message || '教材问答中断');
  };
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
    let splitAt = buffer.indexOf('\n\n');
    while (splitAt >= 0) {
      feed(buffer.slice(0, splitAt));
      buffer = buffer.slice(splitAt + 2);
      splitAt = buffer.indexOf('\n\n');
    }
  }
  buffer += decoder.decode().replace(/\r\n/g, '\n');
  if (buffer.trim()) feed(buffer);
  if (!donePayload) throw Error('教材问答没有完成');
  return donePayload;
}

export function paintAskStreamDelta(doc, delta) {
  if (!delta) return;
  const results = doc.getElementById('lw-find-results');
  if (!results) return;
  let node = doc.getElementById('lw-ask-stream-text');
  if (!node) {
    const history = typeof results.querySelector === 'function' ? results.querySelector('.lw-query-history') : null;
    results.innerHTML = '<div class="lw-ask-answer" id="lw-ask-stream"><p id="lw-ask-stream-text"></p><p class="lw-ask-note">以上内容只根据本次检索到的教材摘录组织。</p></div>';
    if (history && typeof results.appendChild === 'function') results.appendChild(history);
    node = doc.getElementById('lw-ask-stream-text');
  }
  if (node) node.textContent = (node.textContent || '') + delta;
  const live = typeof doc.querySelector === 'function' ? doc.querySelector('.lw-ask-live') : null;
  if (live) live.textContent = '正在根据教材摘录组织回答';
}
/* end ask-stream-client */
