import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ToastController} from '@ionic/angular';

import { IonicModule } from '@ionic/angular';

import { TextureSynthesisPageRoutingModule } from './texture-synthesis-routing.module';

import { TextureSynthesisPage } from './texture-synthesis.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TextureSynthesisPageRoutingModule
  ],
  declarations: [TextureSynthesisPage]
})
export class TextureSynthesisPageModule {}
