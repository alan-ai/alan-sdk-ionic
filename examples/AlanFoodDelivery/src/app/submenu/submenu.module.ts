import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {SubmenuPage} from './submenu.page';
import {OrderToolbarModule} from '../order-toolbar/order-toolbar.module';

const routes: Routes = [
    {
        path: '',
        component: SubmenuPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        OrderToolbarModule
    ],
    declarations: [SubmenuPage]
})
export class CategoryPageModule {
}
