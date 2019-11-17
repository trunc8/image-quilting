import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ActionSheetController, ToastController, Platform, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
})
export class ResultPage implements OnInit {

  resultImagePath= "";
  savingInProgress = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private toastController: ToastController) { }

  ngOnInit() {
    this.resultImagePath = this.activatedRoute.snapshot.paramMap.get('img_path');
    // this.presentToast(this.resultImagePath);
  }

  async presentToast(text) {
    const toast = await this.toastController.create({
        message: text,
        position: 'bottom',
        duration: 3000
    });
    toast.present();
  }

  async saveImage() {
    // Save Image
    this.savingInProgress = true;
    // this.presentToast("Saving Image. Please wait...");
    

    // Now send the image to backend & wait for result.
    await this.delay(2000);
    this.savingInProgress = false;
    this.router.navigateByUrl("/home");

  }

  tryAgain() {
    this.router.navigateByUrl("/home");
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

}
