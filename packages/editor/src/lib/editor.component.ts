import {
    OnInit,
    ViewChild,
    AfterViewInit,
    Component,
    EventEmitter,
    forwardRef,
    Inject,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    Output,
    PLATFORM_ID,
    Renderer2,
    SecurityContext,
    SimpleChanges,
    ViewEncapsulation,
    HostBinding,
    ElementRef
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import {
    QUILL_CONFIG_TOKEN,
    QuillConfig,
    QuillModules,
    ContentEmitEntity,
    SelectionEmitEntity
} from './editor.interface';
import { CONFIGRATION_TYPE, CONFIGRATION_STYLE_DEFAULT, CONFIGRATION_TOOLBAR_POSITION } from './editor.configration';

import hljs from 'highlight.js/lib/highlight';

import 'highlight.js/styles/github.css';

import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('javascript', javascript);

import Quill from 'quill';

import 'quill-emoji/dist/quill-emoji.js';

import ImageResize from 'quill-image-resize-module';

Quill.register('modules/imageResize', ImageResize);

@Component({
    selector: 'ngx-editor',
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NgxEditorComponent)
        },
        {
            multi: true,
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => NgxEditorComponent)
        }
    ],
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NgxEditorComponent
    implements OnInit, AfterViewInit, ControlValueAccessor, Validator, OnChanges, OnDestroy {
    @HostBinding('class.ngx-editor-wrapper') _wrap = true;

    quillEditor: any;

    content: any;

    @ViewChild('editor') editorElement;

    @Input() type?: 'simple' | 'all' = 'simple';

    @Input() debug?: 'warn' | 'log' | 'error' | false;

    @Input() formats?: string[] | null;

    @Input() format?: 'object' | 'html' | 'text' | 'json' = 'html';

    @Input() modules?: QuillModules;

    @Input() placeholder?: string;

    @Input() readOnly?: boolean;

    @Input() scrollingContainer?: HTMLElement | string | null;

    @Input() theme? = 'snow';

    @Input() trackChanges?: 'user' | 'all';

    @Input() style: any = null;

    @Input() toolbarPosition: 'top' | 'bottom' = 'top';

    @Input() sanitize = false;

    @Input() required: Boolean = false;

    @Output() editorCreated: EventEmitter<any> = new EventEmitter();

    @Output() contentChanged: EventEmitter<ContentEmitEntity> = new EventEmitter();

    @Output() selectionChanged: EventEmitter<SelectionEmitEntity> = new EventEmitter();

    @Input()
    valueGetter(quillEditor: any, editorElement: HTMLElement): string | any {
        let modelValue = editorElement.querySelector('.ql-editor').innerHTML;
        if (this.format === 'text') {
            modelValue = quillEditor.getText();
        } else if (this.format === 'object') {
            modelValue = quillEditor.getContents();
        } else if (this.format === 'json') {
            try {
                modelValue = JSON.stringify(quillEditor.getContents());
            } catch (e) {
                modelValue = quillEditor.getText();
            }
        }
        return modelValue;
    }

    @Input()
    valueSetter(quillEditor: any, value: any): any {
        if (this.format === 'html') {
            if (this.sanitize) {
                value = this.domSanitizer.sanitize(SecurityContext.HTML, value);
            }
            return quillEditor.clipboard.convert(value);
        } else if (this.format === 'json') {
            try {
                return JSON.parse(value);
            } catch (e) {
                return [{ insert: value }];
            }
        }
        return value;
    }

    constructor(
        private elementRef: ElementRef,
        private domSanitizer: DomSanitizer,
        private renderer: Renderer2,
        private zone: NgZone,
        @Inject(PLATFORM_ID) private platformId: Object,
        @Inject(QUILL_CONFIG_TOKEN) private config: QuillConfig
    ) {}

    modelChange(value?: any) {}

    modelTouched() {}

    writeValue(value: any) {
        this.content = value;
        if (this.quillEditor) {
            if (value) {
                if (this.format === 'text') {
                    this.quillEditor.setText(value);
                } else {
                    this.quillEditor.setContents(this.valueSetter(this.quillEditor, this.content));
                }
                this.focusEditor();
                return;
            }
            this.quillEditor.setText('');
            this.focusEditor();
        }
    }

    registerOnChange(fn: (modelValue: any) => void): void {
        this.modelChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.modelTouched = fn;
    }

    selectionChangeHandler(range: Range | null, oldRange: Range | null, source: string) {
        this.zone.run(() => {
            this.selectionChanged.emit({
                editor: this.quillEditor,
                oldRange,
                range,
                source
            });

            if (!range && this.modelTouched) {
                this.modelTouched();
            }
        });
    }

    textChangeHandler(delta: any, oldDelta: any, source: string) {
        const text = this.quillEditor.getText();
        const content = this.quillEditor.getContents();

        let html: string | null = this.editorElement.nativeElement.querySelector('.ql-editor').innerHTML;
        if (html === '<p><br></p>' || html === '<div><br><div>') {
            html = null;
        }

        this.zone.run(() => {
            const trackChanges = this.trackChanges || this.config.trackChanges;
            if ((source === Quill.sources.USER || (trackChanges && trackChanges === 'all')) && this.modelChange) {
                this.modelChange(this.valueGetter(this.quillEditor, this.editorElement.nativeElement));
            }

            this.contentChanged.emit({
                content,
                delta,
                editor: this.quillEditor,
                html,
                oldDelta,
                source,
                text
            });
        });
    }

    focusEditor() {
        setTimeout(() => {
            this.quillEditor.focus();
        }, 500);
    }

    validate() {
        if (!this.quillEditor) {
            return null;
        }

        const err: {
            requiredError?: { empty: boolean };
        } = {};
        let valid = true;

        const textLength = this.quillEditor.getText().trim().length;

        if (this.required && !textLength) {
            err.requiredError = {
                empty: true
            };
            valid = false;
        }

        return valid ? null : err;
    }

    ngOnInit() {}

    ngAfterViewInit() {
        const toolbarCustomElement = this.elementRef.nativeElement.querySelector('[quill-editor-toolbar]');

        const setting: QuillConfig = this.config;

        if (this.type) {
            setting.modules.toolbar = CONFIGRATION_TYPE[this.type]['toolbar'];
        }

        if (this.style) {
            Object.keys(this.style).forEach((key: string) => {
                this.renderer.setStyle(this.editorElement.nativeElement, key, this.style[key]);
            });
        } else {
            Object.keys(CONFIGRATION_STYLE_DEFAULT).forEach((key: string) => {
                this.renderer.setStyle(this.editorElement.nativeElement, key, CONFIGRATION_STYLE_DEFAULT[key]);
            });
        }

        if (this.debug) {
            setting.debug = this.debug;
        }

        if (this.formats) {
            setting.formats = this.formats;
        }

        if (this.modules) {
            setting.modules = this.modules;
        }

        if (toolbarCustomElement) {
            setting.modules['toolbar'] = toolbarCustomElement;
        }

        if (this.placeholder) {
            setting.placeholder = this.placeholder;
        }

        if (this.readOnly) {
            setting.readOnly = this.readOnly;
        }

        if (this.scrollingContainer) {
            setting.scrollingContainer = this.scrollingContainer;
        }

        if (this.theme) {
            setting.theme = this.theme;
        }

        this.quillEditor = new Quill(this.editorElement.nativeElement, setting);

        if (!toolbarCustomElement && this.toolbarPosition === CONFIGRATION_TOOLBAR_POSITION.BOTTOM) {
            const _tool = this.elementRef.nativeElement.querySelector('.ql-toolbar');
            this.elementRef.nativeElement.append(_tool);
        }

        this.editorCreated.emit(this.quillEditor);

        this.quillEditor.on('selection-change', this.selectionChangeHandler.bind(this));

        this.quillEditor.on('text-change', this.textChangeHandler.bind(this));
    }

    ngOnDestroy() {
        if (this.quillEditor) {
            this.quillEditor.off('selection-change', this.selectionChangeHandler);
            this.quillEditor.off('text-change', this.textChangeHandler);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.quillEditor) {
            return;
        }
        if (changes['readOnly']) {
            this.quillEditor.enable(!changes['readOnly'].currentValue);
        }
        if (changes['placeholder']) {
            this.quillEditor.root.dataset.placeholder = changes['placeholder'].currentValue;
        }
        if (changes['style']) {
            const currentStyling = changes['style'].currentValue;
            const previousStyling = changes['style'].previousValue;

            if (previousStyling) {
                Object.keys(previousStyling).forEach((key: string) => {
                    this.renderer.removeStyle(this.editorElement.nativeElement, key);
                });
            }
            if (currentStyling) {
                Object.keys(currentStyling).forEach((key: string) => {
                    this.renderer.setStyle(this.editorElement.nativeElement, key, this.style[key]);
                });
            }
        }
    }
}
