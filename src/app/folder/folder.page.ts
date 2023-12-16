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
years = [ 
  {year:'2020'}, 
  {year:'2021'}, 
  {year:'2022'}, 
  {year:'2023'}, 
  {year:'2024'}, 
  {year:'2025'}, 
  {year:'2026'}, 
  {year:'2027'}, 
  {year:'2028'}, 
  {year:'2029'}, 
  {year:'2030'} 
];
months :any=[]
  dates: any;

  month(){
    this.service.getBoxData().subscribe(data => {
      console.log(data);
      this.dates = data.april;
      // console.log(this.dates.april)
    });
    this.service.getMonths().subscribe((data) => {
      console.log(data);

      if (Array.isArray(data)) {
        this.months = data;
      } else if (data && typeof data === 'object' && data.hasOwnProperty('months')) {
        this.months = data.months;
      } else {
        console.error('Unexpected data format:', data);
      }

      console.log(this.months);
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
