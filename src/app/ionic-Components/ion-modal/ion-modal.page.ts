import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, ModalController } from '@ionic/angular';


@Component({
  selector: 'app-ion-modal',
  templateUrl: './ion-modal.page.html',
  styleUrls: ['./ion-modal.page.scss'],
})
export class IonModalPage implements OnInit {
  @ViewChild(IonModal) modal: IonModal | any;
todayDate: any;

dateTime:any;
  constructor(private modalController: ModalController,) { }

  ngOnInit() {
    setTimeout(() => {
      this.dateTime = new Date().toISOString();
    });
  }
  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }
}
