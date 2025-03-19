import 'i18next';
import type { TFunction } from 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: {
        translation: Record<string, string>;
      };
      home: {
        translation: Record<string, string>;
      };
      projects: {
        translation: Record<string, string>;
      };
      contact: {
        translation: Record<string, string>;
      };
      about: {
        translation: Record<string, string>;
      };
      services: {
        translation: Record<string, string>;
      };
    };
  }
}

declare module 'react-i18next' {
  interface UseTranslationResponse<N extends keyof CustomTypeOptions['resources']> {
    t: TFunction<N, undefined> & ((key: string, defaultValue?: string) => string);
  }
} 