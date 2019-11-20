import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';


@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
})
export class ResultPage implements OnInit {

  resultImagePath= "";
  savingInProgress = false;

  constructor(private transfer: FileTransfer, private file: File, private router: Router, private activatedRoute: ActivatedRoute, private toastController: ToastController) { }

  fileTransfer: FileTransferObject = this.transfer.create();

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
    this.fileTransfer.download(this.resultImagePath, this.file.dataDirectory + "saved_img.png").then((entry) => {
      console.log("Download Complete: " + entry);
      this.presentToast("Image Saved!");
    }, (error) => {
      console.log(error);
    });

    // Now send the image to backend & wait for result.
    // await this.delay(2000);
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
