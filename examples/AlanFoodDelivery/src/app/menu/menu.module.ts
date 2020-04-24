import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {MenuPage} from './menu.page';
import {OrderToolbarModule} from '../order-toolbar/order-toolbar.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild([
            {
                path: '',
                component: MenuPage
            }
        ]),
        OrderToolbarModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [MenuPage]
})
export class MenuPageModule {
}
