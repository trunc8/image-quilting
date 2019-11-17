import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActionSheetController, ToastController, Platform, LoadingController } from '@ionic/angular';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { HttpClient } from '@angular/common/http';
// import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Router } from '@angular/router';
// import { Storage } from '@ionic/storage';
// import { FilePath } from '@ionic-native/file-path/ngx';
// import { ImagePicker } from '@ionic-native/image-picker';
// import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';


@Component({
  selector: 'app-texture-synthesis',
  templateUrl: './texture-synthesis.page.html',
  styleUrls: ['./texture-synthesis.page.scss'],
})
export class TextureSynthesisPage implements OnInit {

  // imageResponse: any = [];
  isLoading = false;
  options: any;
  croppedImagepath: any = "";
  showAdvanced = false;
  synthesisInProgress = false;

  targetImgOptions = {
    height: 1000,
    width: 1000,
    blockSize: 10,
    overlapSize: 5,
    tolerance: 0.1
  };


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

  pickImage(sourceType) {
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
      this.cropImage(imageData)
      }, (err) => {
      // Handle error
      });
  }

  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      buttons: [{
        text: 'Load from Library',
        handler: () => {
          this.pickImage(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Use Camera',
        handler: () => {
          this.pickImage(this.camera.PictureSourceType.CAMERA);
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

  cropImage(fileUrl) {
    this.crop.crop(fileUrl, { quality: 90 })
      .then(
        newPath => {
          this.showCroppedImage(newPath.split('?')[0])
        },
        error => {
          alert('Error cropping image' + error);
        }
      );
  }

  showCroppedImage(ImagePath) {
    this.isLoading = true;
    var copyPath = ImagePath;
    var splitPath = copyPath.split('/');
    var imageName = splitPath[splitPath.length - 1];
    var filePath = ImagePath.split(imageName)[0];

    this.file.readAsDataURL(filePath, imageName).then(base64 => {
      this.croppedImagepath = base64;
      // this.presentToast(this.croppedImagepath);
      this.isLoading = false;
    }, error => {
      alert('Error in showing image' + error);
      this.isLoading = false;
    });
  }

  heightChanged(e){
    console.log(parseInt(e.detail.value));
    this.targetImgOptions.height = parseInt(e.detail.value);
  }

  widthChanged(e){
    console.log(parseInt(e.detail.value));
    this.targetImgOptions.width = parseInt(e.detail.value);
  }

  setShowAdvanced(b){
    this.showAdvanced = b;
  }

  blockSizeChanged(e){
    console.log(parseInt(e.detail.value));
    this.targetImgOptions.blockSize = parseInt(e.detail.value);
  }
  
  overlapSizeChanged(e){
    console.log(parseInt(e.detail.value));
    this.targetImgOptions.overlapSize = parseInt(e.detail.value);
  }

  toleranceChanged(e){
    console.log(parseFloat(e.detail.value));
    this.targetImgOptions.tolerance = parseFloat(e.detail.value);
  }

  async submit() {
    // this.presentToast("Generating Texture. Please wait...");
    this.synthesisInProgress = true;

    // Now send the image to backend & wait for result.
    await this.delay(2000);
    this.synthesisInProgress = false;
    // On obtaining result, go to result page
    this.router.navigate(['/result', this.croppedImagepath])
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

}
