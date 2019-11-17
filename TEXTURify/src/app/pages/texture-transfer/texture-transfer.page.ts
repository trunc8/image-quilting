import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActionSheetController, ToastController, Platform, LoadingController } from '@ionic/angular';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { HttpClient } from '@angular/common/http';
// import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-texture-transfer',
  templateUrl: './texture-transfer.page.html',
  styleUrls: ['./texture-transfer.page.scss'],
})
export class TextureTransferPage implements OnInit {

  options: any;
  isLoading = false;

  textureImg = {
    croppedImagepath: ""
  };

  targetImg = {
    croppedImagepath: ""
  }

  transferInProgress = false;

  constructor(private router:Router, private crop: Crop, private camera: Camera, public actionSheetController: ActionSheetController, private file: File, private toastController: ToastController) { }

  ngOnInit() {
  }

  async presentToast(text) {
    const toast = await this.toastController.create({
        message: text,
        position: 'bottom',
        duration: 3000
    });
    toast.present();
  }

  pickImage(sourceType, imgType) {
    console.log("Uploading Image...");
    this.options = {
      // maximumImagesCount: 1,
      quality: 100,
      sourceType: sourceType,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.camera.getPicture(this.options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      // let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.cropImage(imageData, imgType)
      }, (err) => {
      // Handle error
      });
  }

  async selectImage(imgType) {
    console.log(imgType);
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      buttons: [{
        text: 'Load from Library',
        handler: () => {
          this.pickImage(this.camera.PictureSourceType.PHOTOLIBRARY, imgType);
        }
      },
      {
        text: 'Use Camera',
        handler: () => {
          this.pickImage(this.camera.PictureSourceType.CAMERA, imgType);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
      ]
    });
    await actionSheet.present();
  }

  cropImage(fileUrl, imgType) {
    this.crop.crop(fileUrl, { quality: 90 })
      .then(
        newPath => {
          this.showCroppedImage(newPath.split('?')[0], imgType);
        },
        error => {
          alert('Error cropping image' + error);
        }
      );
  }

  showCroppedImage(ImagePath, imgType) {
    this.isLoading = true;
    var copyPath = ImagePath;
    var splitPath = copyPath.split('/');
    var imageName = splitPath[splitPath.length - 1];
    var filePath = ImagePath.split(imageName)[0];

    this.file.readAsDataURL(filePath, imageName).then(base64 => {
      if(imgType === "texture"){
        this.textureImg.croppedImagepath = base64;
        // this.presentToast(this.textureImg.croppedImagepath);
      }
      if(imgType === "target"){
        this.targetImg.croppedImagepath = base64;
        // this.presentToast(this.targetImg.croppedImagepath);
      }
      // else{
      //   this.presentToast("Invalid Image Type!");
      // }
      this.isLoading = false;
    }, error => {
      alert('Error in showing image' + error);
      this.isLoading = false;
    });
  }

  async submit() {
    // this.presentToast("Transfering Texture. Please wait...");
    this.transferInProgress = true;

    // Now send the image to backend & wait for result.
    await this.delay(2000);
    this.transferInProgress = false;
    // On obtaining result, go to result page
    this.router.navigate(['/result', this.textureImg.croppedImagepath])

  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
