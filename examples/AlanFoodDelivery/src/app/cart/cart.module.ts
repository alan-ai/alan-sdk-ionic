import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {CartPage} from './cart.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild([
            {
                path: '',
                component: CartPage
            }
        ])
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [CartPage]
})
export class CartPageModule {
}
