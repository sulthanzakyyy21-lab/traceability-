/**
 * Header matching and scoring utility for Excel sheet auto-detection.
 */

function normHeader(h) {
  if (!h) return '';
  let s = String(h)
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[°%()\/_.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  s = s.replace(/\bcuptest\b/g, 'cup test');
  s = s.replace(/\bdegasing\b/g, 'degassing');
  s = s.replace(/\bgr l\b/g, 'g l');
  s = s.replace(/\bsistem\b/g, 'system');
  s = s.replace(/\bsepet\b/g, 'sepat');
  s = s.replace(/\bvis fm\b/g, 'vis/fm');
  s = s.replace(/\bno box\b/g, 'nomor box');
  s = s.replace(/\bno pack\b/g, 'nomor pack');
  s = s.replace(/\bbatch fg\b/g, 'batch finished good');
  return s.trim();
}

function matchColumns1to1(normExpected, normFile) {
  const matchedExpected = new Set();
  const matchedFile = new Set();
  const mapping = normExpected.map(() => -1);
  let exactMatchCount = 0;
  let partialMatchCount = 0;

  // Pass 1: Exact matches
  for (let eIdx = 0; eIdx < normExpected.length; eIdx++) {
    const exp = normExpected[eIdx];
    for (let fIdx = 0; fIdx < normFile.length; fIdx++) {
      if (matchedFile.has(fIdx)) continue;
      if (exp === normFile[fIdx]) {
        matchedExpected.add(eIdx);
        matchedFile.add(fIdx);
        mapping[eIdx] = fIdx;
        exactMatchCount++;
        break;
      }
    }
  }

  // Pass 2: Unambiguous partial matches
  for (let eIdx = 0; eIdx < normExpected.length; eIdx++) {
    if (matchedExpected.has(eIdx)) continue;
    const exp = normExpected[eIdx];
    for (let fIdx = 0; fIdx < normFile.length; fIdx++) {
      if (matchedFile.has(fIdx)) continue;
      const f = normFile[fIdx];
      if (f.length >= 4 && exp.length >= 4) {
        if (exp.includes(f) || f.includes(exp)) {
          if (exp.includes('cup test') && !f.includes('cup test')) continue;
          if (f.includes('cup test') && !exp.includes('cup test')) continue;
          if (exp.includes('tank') && !f.includes('tank')) continue;
          if (f.includes('tank') && !exp.includes('tank')) continue;

          matchedExpected.add(eIdx);
          matchedFile.add(fIdx);
          mapping[eIdx] = fIdx;
          partialMatchCount++;
          break;
        }
      }
    }
  }

  return { mapping, exactMatchCount, partialMatchCount, totalMatched: matchedExpected.size };
}

function scoreTableMatch(cand, expectedCols, normHeaders, sheetName, activePic, activeTower) {
  if (!expectedCols || expectedCols.length === 0) return { score: -1, matchPercentage: 0 };

  const normExpected = expectedCols.map(normHeader);
  const { exactMatchCount, partialMatchCount, totalMatched } = matchColumns1to1(normExpected, normHeaders);

  const missingCount = normExpected.length - totalMatched;
  const recall = normExpected.length > 0 ? totalMatched / normExpected.length : 0;
  const precision = normHeaders.length > 0 ? totalMatched / normHeaders.length : 0;
  const matchPercentage = Math.round(recall * 100);

  if (totalMatched === 0) {
    return { score: 0, matchPercentage: 0, totalMatched: 0, missingCount: normExpected.length };
  }

  let score = exactMatchCount * 8 + partialMatchCount * 3;

  // Coverage multipliers
  if (recall >= 0.95) score += 40;
  else if (recall >= 0.8) score += 25;
  else if (recall >= 0.6) score += 10;
  else if (recall < 0.4) score -= 10;

  if (precision >= 0.75) score += 15;

  const sheetLower = String(sheetName || '').toLowerCase();
  if (cand.sheetKeyword) {
    const kws = Array.isArray(cand.sheetKeyword) ? cand.sheetKeyword : [cand.sheetKeyword];
    if (kws.some((kw) => sheetLower.includes(kw))) score += 20;
  }

  const combined = normHeaders.join(' ');
  if (cand.keywords && Array.isArray(cand.keywords)) {
    let kwHits = 0;
    for (const kw of cand.keywords) {
      if (combined.includes(normHeader(kw))) kwHits++;
    }
    score += kwHits * 6;
  }

  if (cand.negativeKeywords && Array.isArray(cand.negativeKeywords)) {
    for (const nkw of cand.negativeKeywords) {
      if (combined.includes(normHeader(nkw))) score -= 40;
    }
  }

  if (activePic && cand.pic.toLowerCase() === activePic) score += 4;
  if (activeTower && cand.tower.toLowerCase() === activeTower) score += 4;

  return { score, matchPercentage, totalMatched, missingCount };
}

module.exports = {
  normHeader,
  matchColumns1to1,
  scoreTableMatch,
};
