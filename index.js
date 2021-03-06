const adjacents = {
  a: ["q", "w", "s", "z"],
  b: ["v", "g", "h", "n"],
  c: ["x", "d", "f", "v"],
  d: ["s", "w", "e", "r", "f", "c", "x"],
  e: ["w", "3", "4", "r", "f", "d", "s"],
  f: ["d", "e", "r", "t", "g", "v", "c"],
  g: ["f", "r", "t", "y", "h", "b", "v"],
  h: ["g", "t", "y", "u", "j", "n", "b"],
  i: ["u", "8", "9", "o", "l", "k", "j"],
  j: ["h", "y", "u", "i", "k", "m", "n"],
  k: ["j", "u", "i", "o", "l", "m"],
  l: ["k", "i", "o", "p", "n"],
  m: ["n", "j", "k"],
  n: ["b", "h", "j", "m", "i", "o", "p"],
  o: ["i", "9", "0", "p", "n", "l", "k"],
  p: ["o", "9", "0", "n", "l"],
  q: ["1", "2", "w", "s", "a"],
  r: ["e", "4", "5", "t", "g", "f", "d"],
  s: ["a", "q", "w", "e", "d", "x", "z"],
  t: ["r", "5", "6", "y", "h", "g", "f", "r"],
  u: ["y", "7", "8", "i", "k", "j", "h"],
  v: ["c", "f", "g", "b"],
  w: ["q", "2", "3", "e", "d", "s", "a"],
  x: ["z", "s", "d", "c"],
  y: ["t", "6", "7", "u", "j", "h", "g"],
  z: ["a", "s", "x"],
  0: ["9", "p", "o"],
  1: ["2", "q"],
  2: ["1", "3", "w", "q"],
  3: ["2", "4", "e", "w"],
  4: ["3", "5", "r", "e"],
  5: ["4", "6", "t", "r"],
  6: ["5", "7", "y", "t"],
  7: ["6", "8", "u", "y"],
  8: ["7", "9", "i", "u"],
  9: ["8", "0", "o", "i"],
};
let errorRules = {
  0: 0,
  3: 1,
  5: 2,
  7: 3,
};
let ruleLens = [0];
const setRuleLens = () =>
  (ruleLens = Object.keys(errorRules)
    .map((key) => parseInt(key, 10))
    .sort());
setRuleLens();

/**
 * Package Configuration
 * @param {object} Rules - JSON where keys are min string lengths and values are max typing errors
 */
const configure = (Rules) => {
  if (Rules.errorRules) {
    ({ errorRules } = Rules);
    setRuleLens();
  }
};

const isLetterOrNumber = (char) => {
  const code = char.charCodeAt(0);
  return (code >= 97 && code <= 122) || (code >= 48 && code <= 57);
};

const normalize = (word) => {
  if (typeof word !== "string") return word;
  const w = word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  let result = "";
  for (let k = 0; k < w.length; k += 1) if (w[k - 1] !== w[k]) result += w[k];

  return result;
};

const compare = (word1, word2, maxLen) => {
  let errors = 0;
  for (let k = 0; k < maxLen; k += 1) if (word1[k] !== word2[k]) errors += 1;
  let maxErrors;
  for (let k = 0; k < ruleLens.length; k += 1)
    if (maxLen >= ruleLens[k]) maxErrors = errorRules[ruleLens[k]];
  if (errors > maxErrors) return false;
  let different = 0;
  for (let k = 0; k < maxLen; k += 1) {
    const adj = adjacents[word1[k]] || [];
    if (word1[k] !== word2[k]) {
      if (!adj.includes(word2[k])) return false;
      different += 1;
    }
  }
  return different <= maxErrors;
};

const shiftLetters = (word, index) =>
  `${word.substring(0, index)}${word[index + 1]}${word[index]}${word.substring(
    index + 2,
    word.length
  )}`;

/**
 * Checks whether passed words are similar or not
 * @param  {...string} words - Words to compare
 * @returns {boolean}
 */
const areSimilar = (...words) => {
  for (let k = 0; k < words.length - 1; k += 1) {
    const word1 = normalize(words[k]);
    const word2 = normalize(words[k + 1]);
    if (typeof word1 !== "string" || typeof word2 !== "string") return false;
    const maxLen = Math.max(word1.length, word2.length);

    let similar = true;
    for (let m = -1; m < maxLen - 1; m += 1) {
      similar = false;
      const compare2 = m === -1 ? word2 : shiftLetters(word2, m);
      if (compare(word1, compare2, maxLen)) {
        similar = true;
        break;
      }
    }
    if (!similar) return false;
  }
  return true;
};

const getNormalizedWords = (phrase = "") => {
  phrase = normalize(phrase);
  const words = [""];
  let index = 0;
  let lastWasSymbol = true;

  for (let k = 0; k < phrase.length; k += 1) {
    const char = phrase[k];
    if (isLetterOrNumber(char)) {
      lastWasSymbol = false;
      words[index] += char;
    } else if (!lastWasSymbol) {
      lastWasSymbol = true;
      index += 1;
      words[index] = "";
    }
  }
  return words;
};

module.exports = {
  configure,
  normalize,
  areSimilar,
  compare,
  getNormalizedWords,
};
