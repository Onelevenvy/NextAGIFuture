"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useContext } from "use-context-selector";

import I18n from "@/contexts/i18n";
import { timezones } from "@/utils/timezone";
import { languages } from "@/i18n/language";
import { Select } from "@chakra-ui/react";

const titleClassName = `
  mb-2 text-sm font-medium text-gray-900
`;

export default function LanguagePage() {
  const { locale, setLocaleOnClient } = useContext(I18n);

  const [editing, setEditing] = useState(false);
  const { t } = useTranslation();

 

    return (
      <>
        <div className="mb-8">
          <div className={titleClassName}>
            {t("common.language.displayLanguage")}
          </div>
          <Select
            defaultValue={locale}
            
            disabled={editing}
          />
        </div>
      </>
    );
  };

