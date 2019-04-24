import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEditorComponent } from './editor.component';
import { QUILL_CONFIG_TOKEN, QuillConfig } from './editor.interface';
import { CONFIGRATION_SIMPLE, CONFIGRATION } from './editor.configration';
import { ModuleWithProviders } from '@angular/compiler/src/core';
@NgModule({
    declarations: [NgxEditorComponent],
    imports: [CommonModule],
    exports: [NgxEditorComponent],
    providers: [
        {
            provide: QUILL_CONFIG_TOKEN,
            useValue: CONFIGRATION
        }
    ]
})
export class EditorModule {
    static forRoot(config?: QuillConfig): ModuleWithProviders {
        return {
            ngModule: EditorModule,
            providers: [
                {
                    provide: QUILL_CONFIG_TOKEN,
                    useValue: config || CONFIGRATION
                }
            ]
        };
    }
}
