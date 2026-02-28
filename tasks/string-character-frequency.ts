/**
 * String Character Frequency Counter
 *
 * Approach:
 *   Single pass through the string using a Map to preserve insertion order.
 *   Map keys maintain first-appearance order by spec (ES2015+), so no
 *   separate tracking is needed. Spaces are skipped per the example output.
 *
 * Time:  O(n) — one pass to count, one pass to format output
 * Space: O(k) — where k is the number of unique characters
 */

function characterFrequency(input: string): string {
  if (!input) return '';

  const counts = new Map<string, number>();

  for (const char of input) {
    if (char === ' ') continue;
    counts.set(char, (counts.get(char) || 0) + 1);
  }

  return Array.from(counts)
    .map(([char, count]) => `${char}:${count}`)
    .join(', ');
}

// ── Examples ──

// Basic English
console.log('1:', characterFrequency('hello world'));
// h:1, e:1, l:3, o:2, w:1, r:1, d:1

// Repeated characters
console.log('2:', characterFrequency('aabbcc'));
// a:2, b:2, c:2

// Empty string
console.log('3:', characterFrequency(''));
// (empty)

// Single character
console.log('4:', characterFrequency('a'));
// a:1

// Case sensitivity
console.log('5:', characterFrequency('AaAa'));
// A:2, a:2

// Special characters
console.log('6:', characterFrequency('hello!! @world #2024'));
// h:1, e:1, l:3, o:2, !:2, @:1, w:1, r:1, d:1, #:1, 2:2, 0:1, 4:1

// Non-English — Arabic
console.log('7:', characterFrequency('مرحبا بالعالم'));
// م:2, ر:1, ح:1, ب:2, ا:2, ل:2, ع:1

// Non-English — Chinese
console.log('8:', characterFrequency('你好世界你好'));
// 你:2, 好:2, 世:1, 界:1

// Non-English — Japanese (Hiragana)
console.log('9:', characterFrequency('こんにちはこんにちは'));
// こ:2, ん:2, に:2, ち:2, は:2

// Non-English — Korean
console.log('10:', characterFrequency('안녕하세요'));
// 안:1, 녕:1, 하:1, 세:1, 요:1

// Non-English — Hindi (Devanagari)
console.log('11:', characterFrequency('नमस्ते दुनिया'));
// न:2, म:1, स:1, ्:2, त:1, े:1, द:1, ु:1, ि:1, य:1, ा:1

// Emoji
console.log('12:', characterFrequency('👋🌍👋🌍🚀'));
// 👋:2, 🌍:2, 🚀:1

// Mixed — English + special + non-English + emoji
console.log('13:', characterFrequency('café résumé naïve 日本語 🎉'));
// c:1, a:1, f:1, é:2, r:1, s:1, u:1, m:1, n:1, a:1, ï:1, v:1, e:1, 日:1, 本:1, 語:1, 🎉:1

// Tabs, newlines, special whitespace
console.log('14:', characterFrequency("a\tb\nc\td"));
// a:1, \t:2, b:1, \n:1, c:1, d:1

// Only spaces
console.log('15:', characterFrequency('     '));
// (empty)
