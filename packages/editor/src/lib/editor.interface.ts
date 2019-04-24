import { InjectionToken } from '@angular/core';

export type QuillToolbarConfig = Array<
    Array<
        | string
        | {
              indent?: string;
              list?: string;
              direction?: string;
              header?: number | Array<boolean | number>;
              color?: string[];
              background?: string[];
              align?: string[];
              script?: string;
              font?: string[];
              size?: Array<boolean | string>;
          }
    >
>;

export interface QuillModules {
    [key: string]: any;
    clipboard?:
        | {
              mathers?: any[];
              matchVisual?: boolean;
          }
        | boolean;
    history?:
        | {
              delay?: number;
              maxStack?: number;
              userOnly?: boolean;
          }
        | boolean;
    keyboard?:
        | {
              bindings?: any;
          }
        | boolean;
    syntax?: boolean;
    toolbar?:
        | QuillToolbarConfig
        | string
        | {
              container?: string | string[] | QuillToolbarConfig;
              handlers?: {
                  [key: string]: any;
              };
          }
        | boolean;
}

export interface QuillConfig {
    bounds?: HTMLElement | string;
    debug?: 'error' | 'warn' | 'log' | false;
    formats?: any;
    modules?: QuillModules;
    placeholder?: string;
    readOnly?: boolean;
    scrollingContainer?: HTMLElement | string | null;
    theme?: string;
    trackChanges?: 'user' | 'all';
}

export const QUILL_CONFIG_TOKEN = new InjectionToken<QuillConfig>('config');

export interface ContentEmitEntity {
    content: any;
    delta: any;
    editor: any;
    html: string | null;
    oldDelta: any;
    source: string;
    text: string;
}

export interface SelectionEmitEntity {
    editor: any;
    oldRange: Range | null;
    range: Range | null;
    source: string;
}
