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
  desc: {
    en_US:
      "Our system will be unavailable from 19:00 to 24:00 UTC on August 28 for an upgrade. For questions, kindly contact our support team (support@dify.ai). We value your patience.",
    zh_Hans:
      "为了有效提升数据检索能力及稳定性，Dify 将于 2023 年 8 月 29 日 03:00 至 08:00 期间进行服务升级，届时 Dify 云端版及应用将无法访问。感谢您的耐心与支持。",
  },
  href: "#",
};
