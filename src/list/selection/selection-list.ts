import {
    Component,
    Input,
    HostBinding,
    ContentChildren,
    QueryList,
    ChangeDetectionStrategy,
    AfterContentInit,
    Renderer2,
    ElementRef,
    OnInit,
    EventEmitter,
    Output,
    OnDestroy,
    Inject,
    NgZone,
    forwardRef
} from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import {
    ThyListOptionComponent,
    THY_OPTION_PARENT_COMPONENT,
    IThyOptionParentComponent
} from '../../core/option';
import { keycodes, helpers } from '../../util';
import { inputValueToBoolean } from '../../util/helpers';
import { Subscription, throwError } from 'rxjs';
import { DOCUMENT } from '@angular/platform-browser';
import { ThySelectionListChange } from './selection.interface';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';


@Component({
    selector: 'thy-selection-list,[thy-selection-list]',
    template: '<ng-content></ng-content>',
    providers: [
        {
            provide: THY_OPTION_PARENT_COMPONENT,
            useExisting: ThySelectionListComponent
        },
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ThySelectionListComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThySelectionListComponent implements OnInit, OnDestroy, AfterContentInit, IThyOptionParentComponent, ControlValueAccessor {

    private _keyManager: FocusKeyManager<ThyListOptionComponent>;

    private _selectionChangesUnsubscribe$ = Subscription.EMPTY;

    private _bindKeyEventUnsubscribe: () => void;

    private _tempValues: any[];

    /** The currently selected options. */
    selectionModel: SelectionModel<ThyListOptionComponent>;

    disabled: boolean;

    @HostBinding(`class.thy-list`) _isList = true;

    @HostBinding(`class.thy-selection-list`) _isSelectionList = true;

    @HostBinding(`class.thy-multiple-selection-list`) multiple = true;

    /** The option components contained within this selection-list. */
    @ContentChildren(ThyListOptionComponent) options: QueryList<ThyListOptionComponent>;

    @Input()
    set thyMultiple(value: any) {
        const previousValue = this.multiple;
        this.multiple = inputValueToBoolean(value);
        if (previousValue !== this.multiple) {
            this._instanceSelectionModel();
            this._subscribeSelectionModelChanges();
        }
    }

    @Input() thyBindKeyEventContainer: HTMLElement | ElementRef | string;

    @Input() thyBeforeKeydown: (event?: KeyboardEvent) => boolean;

    @Input() thyCompareWith: (o1: any, o2: any) => boolean;

    /** Emits a change event whenever the selected state of an option changes. */
    @Output() readonly thySelectionChange: EventEmitter<ThySelectionListChange> =
        new EventEmitter<ThySelectionListChange>();

    private _onTouched: () => void = () => { };

    private _onChange: (value: any) => void = (_: any) => { };

    private _emitChangeEvent(option: ThyListOptionComponent, event: Event) {
        this.thySelectionChange.emit({
            source: this,
            option: option,
            event: event
        });
    }

    private _toggleFocusedOption(event: KeyboardEvent): void {
        if (this._keyManager.activeItem) {
            this.ngZone.run(() => {
                this.toggleOption(this._keyManager.activeItem, event);
            });
        }
    }

    private _initializeFocusKeyManager() {
        this._keyManager = new FocusKeyManager<ThyListOptionComponent>(this.options)
            .withWrap()
            // .withTypeAhead()
            // Allow disabled items to be focusable. For accessibility reasons, there must be a way for
            // screenreader users, that allows reading the different options of the list.
            .skipPredicate(() => false);
    }

    private _subscribeSelectionModelChanges() {
        // Sync external changes to the model back to the options.
        this._selectionChangesUnsubscribe$ = this.selectionModel.onChange.subscribe(event => {
            if (event.added) {
                for (const item of event.added) {
                    item.selected = true;
                }
            }

            if (event.removed) {
                for (const item of event.removed) {
                    item.selected = false;
                }
            }
        });
    }

    private _instanceSelectionModel() {
        this.selectionModel = new SelectionModel<ThyListOptionComponent>(this.multiple);
    }

    private _getSelectorElement(element: HTMLElement | ElementRef | string) {
        if (!element) {
            return this.elementRef.nativeElement;
        } else if (element === 'body') {
            return this.document;
        } else if (helpers.isString(element)) {
            return this.document.querySelector(element as string);
        } else if (element instanceof ElementRef) {
            return element.nativeElement;
        } else {
            return element;
        }
    }

    private _setOptionsFromValues(values: any[]) {
        // this.options.forEach(option => option.setSelected(false));
        this.selectionModel.clear();
        values.forEach(value => {
            const correspondingOption = this.options.find(option => {
                // Skip options that are already in the model. This allows us to handle cases
                // where the same primitive value is selected multiple times.
                if (option.selected) {
                    return false;
                }

                return this.thyCompareWith ? this.thyCompareWith(option.thyValue, value) : option.thyValue === value;
            });
            if (correspondingOption) {
                this.selectionModel.select(correspondingOption);
            }
        });
    }

    private _setAllOptionsSelected(toIsSelected: boolean) {
        // Keep track of whether anything changed, because we only want to
        // emit the changed event when something actually changed.
        let hasChanged = false;

        this.options.forEach(option => {
            const fromIsSelected = this.selectionModel.isSelected(option);
            if (fromIsSelected !== toIsSelected) {
                hasChanged = true;
                this.selectionModel.toggle(option);
            }
        });

        if (hasChanged) {
            this._reportModelValueChange();
        }
    }

    private _reportModelValueChange() {
        if (this.options) {
            const selectedValues = this.selectionModel.selected.map((option) => {
                return option.thyValue;
            });
            let changeValue = selectedValues;
            if (!this.multiple && selectedValues && selectedValues.length > 0) {
                changeValue = selectedValues[0];
            }
            this._onChange(changeValue);
        }
    }

    constructor(
        private renderer: Renderer2,
        private elementRef: ElementRef,
        @Inject(DOCUMENT) private document: Document,
        private ngZone: NgZone
    ) {
    }

    ngOnInit() {
        const bindKeyEventElement = this._getSelectorElement(this.thyBindKeyEventContainer);
        this.ngZone.runOutsideAngular(() => {
            this._bindKeyEventUnsubscribe = this.renderer.listen(bindKeyEventElement, 'keydown', this.onKeydown.bind(this));
        });
        this._instanceSelectionModel();
        this._subscribeSelectionModelChanges();
    }

    writeValue(value: any[] | any): void {
        if (value) {
            if (this.multiple && !helpers.isArray(value)) {
                throw new Error(`multiple selection ngModel must be array.`);
            }
            if (!this.multiple && helpers.isArray(value)) {
                throw new Error(`single selection ngModel not be array.`);
            }
        }
        const values = helpers.isArray(value) ? value : (value ? [value] : null);
        if (this.options) {
            this._setOptionsFromValues(values || []);
        } else {
            this._tempValues = values;
        }
    }

    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this._onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onKeydown(event: KeyboardEvent) {
        if (this.thyBeforeKeydown) {
            // stop key down event
            const isContinue = this.thyBeforeKeydown(event);
            if (!isContinue) {
                return;
            }
        }
        const keyCode = event.keyCode || event.which;
        const manager = this._keyManager;
        const previousFocusIndex = manager.activeItemIndex;

        switch (keyCode) {
            case keycodes.SPACE:
            case keycodes.ENTER:
                this._toggleFocusedOption(event);
                // Always prevent space from scrolling the page since the list has focus
                event.preventDefault();
                break;
            default:
                manager.onKeydown(event);
        }

        if ((keyCode === keycodes.UP_ARROW || keyCode === keycodes.DOWN_ARROW) && event.shiftKey &&
            manager.activeItemIndex !== previousFocusIndex) {
            this._toggleFocusedOption(event);
        }
    }

    toggleOption(option: ThyListOptionComponent, event?: Event) {
        if (option && !option.disabled) {
            this.selectionModel.toggle(option);
            // Emit a change event because the focused option changed its state through user
            // interaction.
            this._reportModelValueChange();
            this._emitChangeEvent(option, event);
        }
    }

    setFocusedOption(option: ThyListOptionComponent) {
        this._keyManager.updateActiveItem(option); // .updateActiveItemIndex(this._getOptionIndex(option));
    }

    /** Selects all of the options. */
    selectAll() {
        this._setAllOptionsSelected(true);
    }

    /** Deselects all of the options. */
    deselectAll() {
        this._setAllOptionsSelected(false);
    }

    ngAfterContentInit(): void {
        this._initializeFocusKeyManager();
        // this._subscribeSelectionModelChanges();
        if (this._tempValues) {
            this._setOptionsFromValues(this._tempValues);
            this._tempValues = null;
        }
    }

    ngOnDestroy() {
        this._selectionChangesUnsubscribe$.unsubscribe();
        if (this._bindKeyEventUnsubscribe) {
            this._bindKeyEventUnsubscribe();
        }
    }
}
