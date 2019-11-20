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
import { stringify } from '@angular/compiler/src/util';
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



  constructor(private http: HttpClient, private afs: AngularFirestore, private storage: AngularFireStorage, private router:Router, public actionSheetController: ActionSheetController, private toastController: ToastController) { }

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
    this.targetImgOptions.scale = parseFloat(e.detail.value);
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
    let post_data = {
      "img_url": this.image.image_url,
      "scale": this.targetImgOptions.scale,
      "blockSize": this.targetImgOptions.blockSize,
      "overlapSize": this.targetImgOptions.overlapSize,
      "tolerance": this.targetImgOptions.tolerance
    };

    // Change URL accordingly
    const url = "http://localhost:8000/texture_synthesis/";

    // Now send the image to backend & wait for result.
    this.status = "Generating new texture. Please wait..."
    this.http.post(url, JSON.stringify(post_data)).subscribe((response) => {
      console.log(response);
      // On obtaining result, go to result page
      this.synthesisInProgress = false;
      this.router.navigate(['/result', response])
    }, (error)=> {
      this.presentToast(stringify(error));
      console.log(error);
      this.synthesisInProgress=false;
    });
    // await this.delay(2000);
  }

  // delay(ms: number) {
  //   return new Promise( resolve => setTimeout(resolve, ms) );
  // }

}
