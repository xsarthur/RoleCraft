/**
 * Display-only merge for ask-textbook 「出处」 cards.
 * The server payload, dialog.citations, and snippet excerpts stay intact.
 * Same-unit cards merge when their sections neighbor each other, their quote
 * offsets in one source file are close, or they are consecutive same-unit
 * citations with no position that shows they are farther apart.
 */
export function mergeAdjacentCitationCards(citations) {
  const CLOSE_QUOTE_GAP = 120;
  const integerOrNull = value => Number.isInteger(value) ? value : null;
  const normalize = (raw, order) => {
    if (!raw || typeof raw !== 'object') return null;
    const href = typeof raw.href === 'string' ? raw.href : '';
    const quote = typeof raw.quote === 'string' ? raw.quote.trim() : '';
    const title = String(raw.title || raw.sectionTitle || '').trim();
    if (!href || !quote || !title) return null;
    const unitId = typeof raw.unitId === 'string' ? raw.unitId : '';
    const sectionId = typeof raw.sectionId === 'string' ? raw.sectionId : '';
    if (!unitId.trim() && !sectionId.trim()) return null;
    return {
      href,
      title,
      quotes: [quote],
      unitId,
      sectionId,
      sourcePath: typeof raw.sourcePath === 'string' ? raw.sourcePath : '',
      sectionIndex: integerOrNull(raw.sectionIndex),
      quoteStart: integerOrNull(raw.quoteStart),
      quoteEnd: integerOrNull(raw.quoteEnd),
      order,
    };
  };
  const sameUnit = (a, b) => Boolean(a.unitId) && a.unitId === b.unitId;
  const quotesClose = (a, b) => {
    if (a.sourcePath && b.sourcePath && a.sourcePath !== b.sourcePath) return false;
    if (a.quoteStart == null || b.quoteStart == null) return false;
    const aEnd = a.quoteEnd == null ? a.quoteStart : a.quoteEnd;
    const bEnd = b.quoteEnd == null ? b.quoteStart : b.quoteEnd;
    return Math.max(a.quoteStart, b.quoteStart) - Math.min(aEnd, bEnd) <= CLOSE_QUOTE_GAP;
  };
  const adjacent = (a, b) => {
    if (!sameUnit(a, b)) return false;
    if (a.sectionIndex != null && b.sectionIndex != null) return Math.abs(a.sectionIndex - b.sectionIndex) <= 1;
    if (quotesClose(a, b)) return true;
    return a.quoteStart == null && b.quoteStart == null && a.sectionIndex == null && b.sectionIndex == null;
  };
  const position = card => {
    if (card.sectionIndex != null) return card.sectionIndex * 1000000 + (card.quoteStart == null ? 0 : card.quoteStart);
    if (card.quoteStart != null) return card.quoteStart;
    return card.order;
  };
  const folded = [];
  const bySection = new Map();
  const list = Array.isArray(citations) ? citations : [];
  for (let index = 0; index < list.length; index += 1) {
    const card = normalize(list[index], index);
    if (!card) continue;
    const key = card.unitId && card.sectionId ? card.unitId + '\n' + card.sectionId : '';
    if (key && bySection.has(key)) {
      const existing = bySection.get(key);
      for (const quote of card.quotes) if (!existing.quotes.includes(quote)) existing.quotes.push(quote);
      continue;
    }
    if (key) bySection.set(key, card);
    folded.push(card);
  }
  const groups = [];
  for (const card of folded) {
    const group = groups.find(members => members.some(member => adjacent(member, card)));
    if (group) group.push(card);
    else groups.push([card]);
  }
  return groups.map(members => {
    const ordered = members.slice().sort((a, b) => position(a) - position(b) || a.order - b.order);
    const lead = ordered[0];
    const quotes = [];
    for (const member of ordered) for (const quote of member.quotes) if (!quotes.includes(quote)) quotes.push(quote);
    return {
      href: lead.href,
      title: lead.title,
      quote: quotes.join('\n\n'),
      unitId: lead.unitId,
      sectionId: lead.sectionId,
    };
  });
}
/* end mergeAdjacentCitationCards */
