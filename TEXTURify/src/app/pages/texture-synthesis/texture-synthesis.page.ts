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
// import { Storage } from '@ionic/storage';
// import { FilePath } from '@ionic-native/file-path/ngx';
// import { ImagePicker } from '@ionic-native/image-picker';
// import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';


export interface Image {
  id: string;
  image_url: string;
}

@Component({
  selector: 'app-texture-synthesis',
  templateUrl: './texture-synthesis.page.html',
  styleUrls: ['./texture-synthesis.page.scss'],
})
export class TextureSynthesisPage implements OnInit {
  debug = "";

  isLoading = false;
  options: any;
  
  imgDataLocal = {
    croppedImagepath: "",
    imgFilePath: "",
    imgFile: ""
  };
  
  showAdvanced = false;
  synthesisInProgress = false;

  targetImgOptions = {
    scale: 4,
    blockSize: 10,
    overlapSize: 5,
    tolerance: 0.1
  };

  image: Image = {
    id: this.afs.createId(), 
    image_url: ''
  }

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


  uploadFile(event: FileList) {

    // The File object
    this.status = "Loading Sample Texture Image..."
    this.isLoading = true;
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
      this.imgDataLocal.croppedImagepath = e.target.result;

      // For Uploading Image To Firebase
      const fileraw = file;
      console.log(fileraw);
      const filePath = '/Image/' + this.image.id + '/' + 'Image' + (Math.floor(1000 + Math.random() * 9000) + 1);
      const result = this.saveImageRef(filePath, fileraw);
      const ref = result.ref;
      result.task.then(a => {
        ref.getDownloadURL().subscribe(a => {
          console.log(a);
          this.image.image_url = a;
          this.isLoading = false;
          this.afs.collection('Image').doc(this.image.id).set(this.image);
          // this.loading = false;
        });

      });
    }, error => {
      this.presentToast("Error: " + error);
    }

  }

  saveImageRef(filePath, file) {
    this.debug = this.debug + "within saveImageRef()...";
    return {
      task: this.storage.upload(filePath, file)
      , ref: this.storage.ref(filePath)
    };
  }

  scaleChanged(e){
    console.log(parseInt(e.detail.value));
    this.targetImgOptions.scale = parseInt(e.detail.value);
  }

  // widthChanged(e){
  //   console.log(parseInt(e.detail.value));
  //   this.targetImgOptions.width = parseInt(e.detail.value);
  // }

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
    // this.status = "Uploading image to firebase...";
    this.synthesisInProgress = true;
    

    // Now send the image to backend & wait for result.
    this.status = "Generating new texture. Please wait..."
    await this.delay(2000);
    this.synthesisInProgress = false;
    // // On obtaining result, go to result page
    this.router.navigate(['/result', this.imgDataLocal.croppedImagepath])
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }


    // async selectImage() {
  //   const actionSheet = await this.actionSheetController.create({
  //     header: "Select Image source",
  //     buttons: [{
  //       text: 'Load from Library',
  //       handler: () => {
  //         this.pickImage(this.camera.PictureSourceType.PHOTOLIBRARY);
  //       }
  //     },
  //     {
  //       text: 'Use Camera',
  //       handler: () => {
  //         this.pickImage(this.camera.PictureSourceType.CAMERA);
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

  // cropImage(fileUrl) {
  //   this.crop.crop(fileUrl, { quality: 90 })
  //     .then(
  //       newPath => {
  //         this.showCroppedImage(newPath.split('?')[0])
  //       },
  //       error => {
  //         alert('Error cropping image' + error);
  //       }
  //     );
  // }

  // showCroppedImage(ImagePath) {
  //   this.isLoading = true;
  //   var copyPath = ImagePath;
  //   var splitPath = copyPath.split('/');
  //   var imageName = splitPath[splitPath.length - 1];
  //   var filePath = ImagePath.split(imageName)[0];

  //   this.file.readAsDataURL(filePath, imageName).then(base64 => {
  //     this.imgDataLocal.croppedImagepath = base64;
  //     this.imgDataLocal.imgFilePath = filePath;
  //     this.imgDataLocal.imgFile = imageName;
  //     // this.presentToast(this.croppedImagepath);
  //     this.isLoading = false;
  //   }, error => {
  //     alert('Error in showing image' + error);
  //     this.isLoading = false;
  //   });
  // }

  // uploadImageToFirebase(){
  //   this.file.readAsArrayBuffer(this.imgDataLocal.imgFilePath, this.imgDataLocal.imgFile).then(data => {
  //     this.debug = this.debug + "within uploadToFirebase()...";
  //     const filePath = '/Image/' + this.image.id + '/' + 'Image' + (Math.floor(1000 + Math.random() * 9000) + 1);


  //     const result = this.saveImageRef(filePath, data);
  //     const ref = result.ref;
  //     result.task.then(a => {
  //       this.debug = this.debug + "result.task complete...";
  //       ref.getDownloadURL().subscribe(a => {
  //         this.debug = this.debug + "got " + a;
  //         console.log(a);
  //         this.image.image = a;
  //         // this.loading = false;
  //       });

  //       this.afs.collection('Image').doc(this.image.id).set(this.image);
  //       this.debug = this.debug + "afs.collection done...";
  //     }).catch(err => {
  //       this.debug = this.debug + err;
  //     })
  //   })
  // }

  // pickImage(sourceType) {
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
  //     this.cropImage(imageData)
  //     }, (err) => {
  //     // Handle error
  //     });
  // }

}
