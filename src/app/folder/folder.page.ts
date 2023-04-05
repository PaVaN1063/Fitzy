import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { JsonService } from '../services/json.service';
import { ModalController } from '@ionic/angular';
import { IonModalPage } from '../ionic-Components/ion-modal/ion-modal.page';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder!: string;

  constructor(
    private activatedRoute: ActivatedRoute, 
    private http: HttpClient, 
    private service :JsonService,
    private modalController: ModalController,
    ) { }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;

    this.month(); 
  }
  calender: any=[];

  dates: any;

  month(){
    this.service.getData().subscribe(data => {
      console.log(data);
      this.dates = data.april;
      // console.log(this.dates.april)


    });

  }

  async openModal() {
    const modal = await this.modalController.create({
      component: IonModalPage,
      cssClass: 'ionModelCSS'
    });
    return await modal.present();
  }
  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }
}
