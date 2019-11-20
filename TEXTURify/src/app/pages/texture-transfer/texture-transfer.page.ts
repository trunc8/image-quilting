import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActionSheetController, ToastController, Platform, LoadingController } from '@ionic/angular';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { HttpClient } from '@angular/common/http';
// import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage} from '@angular/fire/storage';

export interface Image {
  id: string;
  image_url: string;
}

@Component({
  selector: 'app-texture-transfer',
  templateUrl: './texture-transfer.page.html',
  styleUrls: ['./texture-transfer.page.scss'],
})
export class TextureTransferPage implements OnInit {

  options: any;
  isTextureLoading = false;
  isTargetLoading = false;

  textureImg = {
    croppedImagepath: ""
  };

  targetImg = {
    croppedImagepath: ""
  }

  textureImgDataLocal = {
    croppedImagepath: "",
    imgFilePath: "",
    imgFile: ""
  };

  targetImgDataLocal = {
    croppedImagepath: "",
    imgFilePath: "",
    imgFile: ""
  };

  textureImage: Image = {
    id: this.afs.createId(), 
    image_url: ''
  };

  targetImage: Image = {
    id: this.afs.createId(), 
    image_url: ''
  };

  targetImgOptions = {
    scale: 4,
    blockSize: 10,
    overlapSize: 5,
    tolerance: 0.1
  };

  showAdvanced = false;

  transferInProgress = false;

  status = "";

  constructor(private afs: AngularFirestore, private storage: AngularFireStorage, private router:Router, private crop: Crop, private camera: Camera, public actionSheetController: ActionSheetController, private file: File, private toastController: ToastController) { }

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

  uploadFile(event: FileList, imgType: string) {

    // The File object
    if (imgType === 'texture'){
      this.status = "Loading Sample Texture Image...";
      this.isTextureLoading = true;
    }
    if (imgType === 'target') {
      this.status = "Loading Sample Target Image...";
      this.isTargetLoading = true;
    }
    
    // this.isLoading = true;
    const file = event.item(0);
    console.log(event);
 
    // Validation for Images Only
    if (file.type.split('/')[0] !== 'image') { 
     console.error('unsupported file type :( ');
     return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e:any) => { // called once readAsDataURL is completed
      console.log(e)
      let image_id;
      if (imgType === 'texture'){
        this.textureImgDataLocal.croppedImagepath = e.target.result;
        image_id = this.textureImage.id;
      }
      if (imgType === 'target') {
        this.targetImgDataLocal.croppedImagepath = e.target.result;
        image_id = this.targetImage.id;
      }

      // For Uploading Image To Firebase
      const fileraw = file;
      console.log(fileraw);
      const filePath = '/Image/' + image_id + '/' + 'Image' + (Math.floor(1000 + Math.random() * 9000) + 1);
      const result = this.saveImageRef(filePath, fileraw);
      const ref = result.ref;
      result.task.then(a => {
        ref.getDownloadURL().subscribe(a => {
          console.log(a);
          if (imgType === 'texture'){
            this.textureImage.image_url = a;
            this.afs.collection('Image').doc(image_id).set(this.textureImage);
            this.isTextureLoading = false;
          }
          if (imgType === 'target') {
            this.targetImage.image_url = a;
            this.afs.collection('Image').doc(image_id).set(this.targetImage);
            this.isTargetLoading = false;
          }

        });
      });
    }, error => {
      this.presentToast("Error: " + error);
    }

  }

  saveImageRef(filePath, file) {
    // this.debug = this.debug + "within saveImageRef()...";
    return {
      task: this.storage.upload(filePath, file)
      , ref: this.storage.ref(filePath)
    };
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
    // this.presentToast("Transfering Texture. Please wait...");
    this.transferInProgress = true;

    // Now send the image to backend & wait for result.
    this.status = "Transferring texture. Please wait..."
    await this.delay(2000);
    this.transferInProgress = false;
    // On obtaining result, go to result page
    this.router.navigate(['/result', this.textureImg.croppedImagepath])

  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  // pickImage(sourceType, imgType) {
  //   console.log("Uploading Image...");
  //   this.options = {
  //     // maximumImagesCount: 1,
  //     quality: 100,
  //     sourceType: sourceType,
  //     destinationType: this.camera.DestinationType.FILE_URI,
  //     encodingType: this.camera.EncodingType.JPEG,
  //     mediaType: this.camera.MediaType.PICTURE
  //   };

  //   this.camera.getPicture(this.options).then((imageData) => {
  //     // imageData is either a base64 encoded string or a file URI
  //     // If it's base64 (DATA_URL):
  //     // let base64Image = 'data:image/jpeg;base64,' + imageData;
  //     this.cropImage(imageData, imgType)
  //     }, (err) => {
  //     // Handle error
  //     });
  // }

  // async selectImage(imgType) {
  //   console.log(imgType);
  //   const actionSheet = await this.actionSheetController.create({
  //     header: "Select Image source",
  //     buttons: [{
  //       text: 'Load from Library',
  //       handler: () => {
  //         this.pickImage(this.camera.PictureSourceType.PHOTOLIBRARY, imgType);
  //       }
  //     },
  //     {
  //       text: 'Use Camera',
  //       handler: () => {
  //         this.pickImage(this.camera.PictureSourceType.CAMERA, imgType);
  //       }
  //     },
  //     {
  //       text: 'Cancel',
  //       role: 'cancel'
  //     }
  //     ]
  //   });
  //   await actionSheet.present();
  // }

  // cropImage(fileUrl, imgType) {
  //   this.crop.crop(fileUrl, { quality: 90 })
  //     .then(
  //       newPath => {
  //         this.showCroppedImage(newPath.split('?')[0], imgType);
  //       },
  //       error => {
  //         alert('Error cropping image' + error);
  //       }
  //     );
  // }

  // showCroppedImage(ImagePath, imgType) {
  //   this.isLoading = true;
  //   var copyPath = ImagePath;
  //   var splitPath = copyPath.split('/');
  //   var imageName = splitPath[splitPath.length - 1];
  //   var filePath = ImagePath.split(imageName)[0];

  //   this.file.readAsDataURL(filePath, imageName).then(base64 => {
  //     if(imgType === "texture"){
  //       this.textureImg.croppedImagepath = base64;
  //       // this.presentToast(this.textureImg.croppedImagepath);
  //     }
  //     if(imgType === "target"){
  //       this.targetImg.croppedImagepath = base64;
  //       // this.presentToast(this.targetImg.croppedImagepath);
  //     }
  //     // else{
  //     //   this.presentToast("Invalid Image Type!");
  //     // }
  //     this.isLoading = false;
  //   }, error => {
  //     alert('Error in showing image' + error);
  //     this.isLoading = false;
  //   });
  // }
}
