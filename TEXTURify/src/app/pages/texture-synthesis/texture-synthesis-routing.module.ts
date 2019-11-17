import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { ImagePicker } from '@ionic-native/image-picker';

import { TextureSynthesisPage } from './texture-synthesis.page';

const routes: Routes = [
  {
    path: '',
    component: TextureSynthesisPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TextureSynthesisPageRoutingModule {}
