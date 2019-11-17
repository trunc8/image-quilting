import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TextureTransferPageRoutingModule } from './texture-transfer-routing.module';

import { TextureTransferPage } from './texture-transfer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TextureTransferPageRoutingModule
  ],
  declarations: [TextureTransferPage]
})
export class TextureTransferPageModule {}
