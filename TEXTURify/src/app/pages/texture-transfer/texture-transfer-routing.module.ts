import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TextureTransferPage } from './texture-transfer.page';

const routes: Routes = [
  {
    path: '',
    component: TextureTransferPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TextureTransferPageRoutingModule {}
