import {
    Component,
    Input,
    ElementRef,
    Renderer2,
    OnInit,
    forwardRef,
    HostBinding,
    Output,
    EventEmitter,
    OnDestroy,
    HostListener,
    ViewChild,
    AfterContentInit
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ThyEditorService } from './editor.service';
import { ThyEditorLinkModuleService } from './editor-linkmodule.service';
import { thyEditorPattern, ThyEditorConfig } from './editor.constant';
import { ThyEditorRichService } from './editor-rich.service';
@Component({
    selector: 'thy-editor',
    templateUrl: './editor.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ThyEditorComponent),
            multi: true
        },
        ThyEditorService,
        ThyEditorRichService
    ]
})
export class ThyEditorComponent implements OnInit, AfterContentInit, ControlValueAccessor, OnDestroy {
    public model: any;

    public options: ThyEditorConfig;

    @Input() config: ThyEditorConfig;

    @ViewChild('editorWrap') editorWrap: ElementRef;

    public placeholder: string;

    public className: String = '';

    @HostBinding('class.thy-editor-wrapper') _thyWrapperClass = true;

    @HostBinding('class.thy-editor-wrapper-full') _thyFullClass = true;

    @Output() uploadImg: EventEmitter<any> = new EventEmitter<any>();

    public value: String = '';

    public isMarkdown = true;

    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer2,
        public thyEditorService: ThyEditorService,
        public thyEditorRichService: ThyEditorRichService,
        public thyEditorLinkModuleService: ThyEditorLinkModuleService
    ) {}

    @HostListener('paste', ['$event'])
    paste(e: any) {
        e.stopPropagation();
        if (!this.isMarkdown) {
            return;
        }
        const $files = [];
        const theClipboardData = e.clipboardData;
        if (!theClipboardData.items) {
            return;
        }

        let _name = 'image';
        if (window['appGlobal']) {
            _name = window['appGlobal'].me.display_name;
        }

        let _date = '';
        const _now = new Date();
        _date =
            _now.getFullYear() +
            '-' +
            (_now.getMonth() + 1) +
            '-' +
            _now.getDate() +
            ' ' +
            _now.getHours() +
            ':' +
            _now.getMinutes() +
            ':' +
            _now.getSeconds();
        for (const item of theClipboardData.items) {
            if (item.kind === 'file' && item.type.indexOf('image/') === 0) {
                const imageFile: any = item.getAsFile();
                if (imageFile) {
                    imageFile.title = '[' + _name + '] ' + 'upload' + ' - ' + _date + '.png';
                    $files.push(imageFile);
                    e.preventDefault();
                    break;
                }
            }
        }
        if ($files.length > 0 && this.uploadImg) {
            this.uploadImg.emit({
                event: { files: $files },
                callBack: this.uploadImgAction.bind(this)
            });
        }
    }

    @HostListener('mouseenter', ['$event'])
    mouseenter(e: any) {
        if (!this.isMarkdown) {
            return;
        }
        this.thyEditorService.focusEditor();
    }

    @HostListener('mouseleave', ['$event'])
    mouseleave(e: any) {
        if (!this.isMarkdown) {
            return;
        }
        const isHasActive = this.hasParent(document.activeElement, this.editorWrap.nativeElement);
        if (!isHasActive) {
            this.thyEditorService.blurEditor();
        }
    }

    hasParent(el: any, parent: any) {
        let isHas = false;
        if (!el || !parent) {
            return isHas;
        }
        let p = el;
        while (!isHas && p) {
            if (p === parent) {
                isHas = true;
            } else {
                p = p.parentNode;
            }
        }
        return isHas;
    }

    writeValue(value: any) {
        this.model = value;
        if (this.model && this.isMarkdown) {
            setTimeout(() => {
                this.thyEditorService.setTextareaHeight();
            });
        }
    }

    registerOnChange(fn: Function) {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: Function) {
        this.onModelTouched = fn;
    }

    public onModelChange: Function = () => {};

    public onModelTouched: Function = () => {};

    changeValue(event: Event) {
        this.model = event;
        this.onModelChange(this.model);
        this.thyEditorService.setTextareaHeight();
    }

    insertTable() {
        this.thyEditorService.insertTable(this.changeValue.bind(this));
    }

    setHeaderLi(id: string): void {
        this.thyEditorService.header_action = !this.thyEditorService.header_action;
    }

    styleFn(name: string, event: Event) {
        this.thyEditorService.styleFn(name, event, this.changeValue.bind(this));
    }

    togglePreview() {
        this.thyEditorService.isPreview = !this.thyEditorService.isPreview;
        this.value = this.elementRef.nativeElement.querySelector('.thy-editor-textarea').value;
    }

    selectFiles(event: Event) {
        if (this.uploadImg) {
            this.uploadImg.emit({
                event: event,
                callBack: this.uploadImgAction.bind(this)
            });
        }
    }

    uploadImgAction(src: string, title: string) {
        this.thyEditorService.insertContent('\n![' + title + '](' + src + ')\n', this.changeValue.bind(this));
    }

    selectModule(event: Event) {
        this.thyEditorLinkModuleService.open(event, this.linkModuleAction.bind(this));
    }

    linkModuleAction(str: string) {
        this.thyEditorService.insertContent(str, this.changeValue.bind(this));
    }

    blurEditor() {
        const isHasActive = this.hasParent(document.activeElement, this.editorWrap.nativeElement);
        if (!isHasActive) {
            this.thyEditorService.blurEditor();
        }
    }

    ngOnInit(): void {
        if (this.config) {
            this.isMarkdown = !this.config.pattern || this.config.pattern === thyEditorPattern.markdown;
            if (this.isMarkdown) {
                setTimeout(() => {
                    this.thyEditorService.initEditor(this.config, this.elementRef, this.editorWrap);
                    this._thyFullClass = this.thyEditorService.options.isHeightFull;
                });
            } else {
                setTimeout(() => {
                    this.thyEditorRichService.initEditor(this.config, this.elementRef);
                });
            }
        }
    }

    ngAfterContentInit() {}

    ngOnDestroy() {
        this.thyEditorService.clear();
    }
}
