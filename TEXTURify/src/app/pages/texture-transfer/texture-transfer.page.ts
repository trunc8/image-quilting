import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActionSheetController, ToastController, Platform, LoadingController } from '@ionic/angular';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { HttpClient} from '@angular/common/http';
// import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage} from '@angular/fire/storage';
import { headersToString } from 'selenium-webdriver/http';
import { stringify } from '@angular/compiler/src/util';

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
    blockSize: 80,
    overlapSize: 20,
    tolerance: 0.1,
    alpha: 0.2
  };

  showAdvanced = false;

  transferInProgress = false;

  status = "";

  constructor(private http: HttpClient, private afs: AngularFirestore, private storage: AngularFireStorage, private router:Router, private crop: Crop, private camera: Camera, public actionSheetController: ActionSheetController, private file: File, private toastController: ToastController) { }

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

  alphaChanged(e){
    console.log(parseFloat(e.detail.value));
    this.targetImgOptions.alpha = parseFloat(e.detail.value);
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
    let post_data = {
      "texture_img_url": this.textureImage.image_url,
      "target_img_url": this.targetImage.image_url,
      "blockSize": this.targetImgOptions.blockSize,
      "overlapSize": this.targetImgOptions.overlapSize,
      "tolerance": this.targetImgOptions.tolerance,
      "alpha": this.targetImgOptions.alpha
    };


    // Change URL accordingly
    let url = "http://localhost:8000/texture_transfer/"

    // Now send the image to backend & wait for result.
    this.status = "Generating new texture. Please wait..."
    this.http.post(url, JSON.stringify(post_data)).subscribe((response) => {
      console.log(response);
      // On obtaining result, go to result page
      this.transferInProgress = false;
      this.router.navigate(['/result', response])
    }, (error)=> {
      this.presentToast(stringify(error));
      console.log(error);
      this.transferInProgress=false;
    });
    // await this.delay(2000);
    // this.transferInProgress = false;
    // // On obtaining result, go to result page
    // this.router.navigate(['/result', this.textureImage.image_url])

  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

}
