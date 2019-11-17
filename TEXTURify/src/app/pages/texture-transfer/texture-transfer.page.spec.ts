import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TextureTransferPage } from './texture-transfer.page';

describe('TextureTransferPage', () => {
  let component: TextureTransferPage;
  let fixture: ComponentFixture<TextureTransferPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextureTransferPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TextureTransferPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
