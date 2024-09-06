import data from "./languages.json";
export type Item = {
  value: number | string;
  name: string;
  example: string;
};

export type I18nText = {
  "en-US": string;
  "zh-Hans": string;
};

export const languages = data.languages;

export const LanguagesSupported = languages
  .filter((item) => item.supported)
  .map((item) => item.value);

export const getLanguage = (locale: string) => {
  if (locale === "zh-Hans") return locale.replace("-", "_");

  return LanguagesSupported[0].replace("-", "_");
};

export const NOTICE_I18N = {
  title: {
    en_US: "Important Notice",
    zh_Hans: "重要公告",
  },
};
