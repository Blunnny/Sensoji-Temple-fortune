export type OmikujiOriginal = [string, string, string, string];

export type OmikujiWords = Record<string, string>;

export interface Omikuji {
  front: string;
  back: string;
  id: number;
  grade: string;
  original: OmikujiOriginal;
  translation: string[];
  words: OmikujiWords;
}

export const omikujiList: Omikuji[] = [
  {
    front: "./picture_front/front_1.JPEG",
    back: "./picture_back/back_1.jpg",
    id: 1,
    grade: "第一大吉",
    original: ["七寶浮圖塔", "高峰頂上安", "眾人皆仰望", "莫作等閒看"],
    translation: [
      "就像出现了用美丽宝石做成的佛塔般地，似乎会有非常好的事情。",
      "因为能改用放眼万事的立场，可以得到周围的人们的信赖吧。",
      "合乎正道的你的行为，能被很多人的认同及鼓励。",
      "不用随便的态度看事情，用正确的心思会招来更多的好的结果。",
    ],
    words: {
      愿望: "会充分地实现吧。",
      疾病: "会治愈吧。",
      盼望的人: "会出现吧。",
      遗失物: "变得迟迟地才找到吧。",
      "盖新居、搬家、嫁娶、旅行、交往等": "全部很好吧。",
    },
  },
  {
    front: "./picture_front/front_2.JPEG",
    back: "./picture_back/back_2.jpg",
    id: 2,
    grade: "第二小吉",
    original: ["月被浮雲翳", "立事自昏迷", "幸乞隂公祐", "何慮不開眉"],
    translation: [
      "似乎抱着强烈的愿望，但是照目前的样子，似乎无法达成愿望。",
      "因为光是想着要怎么作，持续着没有决心的情形。",
      "为了人而变得尽全力努力，幸福将会来到。",
      "似乎会有令人高兴的事情发生。根据这件好事，不担心未来的事也没有关系了。",
    ],
    words: {
      愿望: "因为持续不断地努力，必定会实现。",
      疾病: "虽然拖长，但是之后可以康复吧。",
      盼望的人: "迟迟地才出现吧。",
      遗失物: "不能找出来吧。",
      交往: "要节制吧。",
      "盖新居、搬家": "都不坏吧。",
      "结亲缘、旅行": "顺利进行吧。",
    },
  },
];

export function drawRandomOmikuji(): Omikuji | null {
  if (omikujiList.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * omikujiList.length);
  return omikujiList[index];
}
