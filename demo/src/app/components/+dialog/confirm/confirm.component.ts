import { Component } from '@angular/core';
import { ThyDialog } from 'ngx-tethys';
import { of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

@Component({
    selector: 'app-demo-dialog-confirm',
    templateUrl: './confirm.component.html'
})
export class DemoDialogConfirmComponent {
    constructor(private thyDialog: ThyDialog) {}

    openConfirm() {
        this.thyDialog.confirm({
            title: '确认删除',
            content: '确认要删除这条任务<code>21111</code>吗？</script>',
            onOk: () => {
                return of([1]).pipe(
                    delay(2000),
                    map(() => {
                        return false;
                    })
                );
            }
        });
    }
}
