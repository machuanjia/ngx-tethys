import { Injectable, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { thyEditorType, ThyEditorConfig } from './editor.constant';

@Injectable()
export class ThyEditorRichService implements OnInit, OnDestroy {
    public type: string = thyEditorType.simple;

    constructor() {}

    ngOnInit() {}

    ngOnDestroy() {
        this.clear();
    }

    initEditor(config: ThyEditorConfig, elementRef: any) {
        if (config) {
            if (config.type) {
                this.type = config.type;
            }
        }
    }

    clear() {}
}
