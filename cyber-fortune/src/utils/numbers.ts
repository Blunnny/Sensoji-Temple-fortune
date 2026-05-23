const CHINESE_NUMS = [
  "零",
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
];

export function numberToChinese(num: number): string {
  if (num === 100) return "一百";
  if (num < 10) return CHINESE_NUMS[num];
  if (num < 20) return "十" + (num % 10 === 0 ? "" : CHINESE_NUMS[num % 10]);
  if (num % 10 === 0) {
    return CHINESE_NUMS[Math.floor(num / 10)] + "十";
  }
  return CHINESE_NUMS[Math.floor(num / 10)] + "十" + CHINESE_NUMS[num % 10];
}
