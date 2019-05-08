import { Injectable, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { thyEditorType, ThyEditorConfig } from './editor.constant';

@Injectable()
export class ThyEditorRichService implements OnInit, OnDestroy {
    public type: string = thyEditorType.simple;
    public placeholder: string;

    constructor() {}

    ngOnInit() {}

    ngOnDestroy() {
        this.clear();
    }

    initEditor(config: ThyEditorConfig, elementRef: any) {
        if (config) {
            this.type = config.type;
            this.placeholder = config.placeholder;
        }
    }

    clear() {}
}
