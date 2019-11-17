import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TextureSynthesisPage } from './texture-synthesis.page';

describe('TextureSynthesisPage', () => {
  let component: TextureSynthesisPage;
  let fixture: ComponentFixture<TextureSynthesisPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextureSynthesisPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TextureSynthesisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
