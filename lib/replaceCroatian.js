const characters = {
  č: "c",
  ć: "c",
  ž: "z",
  đ: "d",
  š: "s",
  Č: "C",
  Ć: "C",
  Ž: "Z",
  Đ: "D",
  Š: "S",
};

export default function replaceCroatian(str) {
  for (const [key, value] of Object.entries(characters)) {
    str = str?.replace(new RegExp(key, "g"), value);
  }
  return str;
}
