import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrderToolbarComponent} from './order-toolbar.component';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

@NgModule({
    imports: [
        CommonModule,
        IonicModule.forRoot(),
    ],
    exports: [OrderToolbarComponent],
    declarations: [OrderToolbarComponent],
    providers: [],
})
export class OrderToolbarModule {
}
