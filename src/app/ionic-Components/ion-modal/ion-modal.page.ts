import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, ModalController } from '@ionic/angular';
import { JsonService } from 'src/app/services/json.service';


@Component({
  selector: 'app-ion-modal',
  templateUrl: './ion-modal.page.html',
  styleUrls: ['./ion-modal.page.scss'],
})
export class IonModalPage implements OnInit {
  @ViewChild(IonModal) modal: IonModal | any;
todayDate: any;
data:any;
dateTime:any;
// employee = ;
employeeID= "01";
userInfo = {id:'', name:'', sname:'', image:''};

  constructor(private modalController: ModalController, private jsonService: JsonService) { }

  ngOnInit() {
    setTimeout(() => {
      this.dateTime = new Date().toISOString();
    });
    this.getUsers();
    // this.employeeID = this.employee;
    console.log(this.employeeID)
  }
  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  getUsers(){
    this.jsonService.getUsers().subscribe(res =>{
      this.data = res.users;
      console.log(this.data);
    })
  }
}
