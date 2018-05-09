import { Component, Directive, Input, ElementRef, Renderer2, ViewEncapsulation } from '@angular/core';
import { AfterContentInit, OnChanges, SimpleChanges } from '@angular/core';
import { inputValueToBoolean, isUndefined } from '../util/helpers';


export type ThyButtonType = 'primary' | 'secondary' | 'outline-primary' | 'outline-default' | 'danger';

const btnTypeClassesMap: any = {
    'primary': ['btn', 'btn-primary'],
    'secondary': ['btn', 'btn-primary', 'btn-md'],
    'outline-primary': ['btn', 'btn-outline-primary'],
    'outline-default': ['btn', 'btn-outline-default'],
    'danger': ['btn', 'btn-danger'],
    'link': ['btn', 'btn-link'], // 链接按钮
    'link-secondary': ['btn', 'btn-link', 'btn-link-default'] // 幽灵链接按钮
};

@Component({
    selector: '[thyButton]',
    templateUrl: './button.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ThyButtonComponent implements AfterContentInit, OnChanges {

    private _nativeElement: any;

    private _typeClassNames: string[] = [];

    private _originalText: string;

    private _type: string;

    private _size: string;

    private _icon: string;

    private _loading: boolean;

    private _loadingText: string;

    public iconClass: any;

    @Input()
    set thyButton(value: ThyButtonType) {
        this._type = value;
        this._setClassesByType();
    }

    @Input()
    set thyType(value: ThyButtonType) {
        this._type = value;
        this._setClassesByType();
    }

    @Input()
    set thyLoading(value: boolean) {
        const newLoading = inputValueToBoolean(value);
        // from false to true
        if (!this._loading && newLoading) {
            this._loading = newLoading;
            this._originalText = this._nativeElement.innerText;
            this._setLoadingStatus();
        } else {
            this._loading = newLoading;
            this._setLoadingStatus();
        }
    }

    @Input()
    set thyLoadingText(value: string) {
        if (this._loadingText !== value) {
            this._loadingText = value;
            if (this._loading) {
                this.renderer.setProperty(this._nativeElement, 'innerText', this._loadingText);
            }
        }
    }

    @Input()
    set thySize(size: string) {
        if (!isUndefined(size)) {
            if (this._size) {
                this._removeClass(`btn-${this._size}`);
            }
            this._size = size;
            this._addClass(`btn-${this._size}`);
        }
    }

    // 字体前缀，默认 wtf
    @Input() thyIconPrefix: string;

    @Input()
    set thyIcon(icon: string) {
        this._icon = icon;
        if (this._icon) {
            const btnIconPrefix = this.thyIconPrefix || 'wtf';
            this.iconClass = [btnIconPrefix, `${this._icon}`];
        } else {
            this.iconClass = null;
        }
    }

    private _setLoadingStatus() {
        let disabled = false;
        let innerText: string;
        if (this._loading) {
            disabled = true;
            innerText = this._loadingText ? this._loadingText : null;
        } else {
            disabled = false;
            innerText = this._originalText ? this._originalText : null;
        }
        this.renderer.setProperty(this._nativeElement, 'disabled', disabled);
        if (innerText) {
            this.renderer.setProperty(this._nativeElement, 'innerText', innerText);
        }
    }

    private _setClassesByType() {
        let classNames: string[] = null;
        if (btnTypeClassesMap[this._type]) {
            classNames = btnTypeClassesMap[this._type];
        } else {
            console.error(`button type (${this._type}) is not support`);
            classNames = ['btn'];
            classNames.push(`btn-${this._type}`);
        }
        // remove old classes
        this._typeClassNames.forEach(className => {
            this._removeClass(className);
        });
        // add new classes
        this._typeClassNames = classNames;
        this._typeClassNames.forEach((className) => {
            this._addClass(className);
        });
    }

    private _removeClass(className: string) {
        this.renderer.removeClass(this._nativeElement, className);
    }

    private _addClass(className: string) {
        this.renderer.addClass(this._nativeElement, className);
    }

    constructor(private elementRef: ElementRef, private renderer: Renderer2) {
        this._nativeElement = this.elementRef.nativeElement;
    }

    ngAfterContentInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
    }
}
