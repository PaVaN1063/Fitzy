import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-delivery-steps',
  templateUrl: './delivery-steps.page.html',
  styleUrls: ['./delivery-steps.page.scss'],
})
export class DeliveryStepsPage implements OnInit {

  name = "Pavan-Status";

  currentStep = 1;
  numSteps = 4;
  statuses = ['Active', 'Running', 'Deactivate'];
  status = { status: '' };
  info: any;
  currentStatus: any;
  data: any = [];
  constructor(private http: HttpClient){}
  ngOnInit() {
    this.http.get('http://localhost:3000/posts').subscribe((res: any) => {
      this.data = res;
      this.info = this.data[2];
      this.currentStatus = this.info.status; // replace with the "status" property from the JSON data
      console.log(this.currentStatus); 

    })
  }

  nextStep() {
    this.currentStep++;
    if (this.currentStep > this.numSteps) {
      this.currentStep = 1;
    }
    var stepper:any = document.getElementById("stepper1");
    var steps = stepper.getElementsByClassName("step");

    Array.from(steps).forEach((step, index) => {
      let stepNum = index + 1;
      if (stepNum === this.currentStep) {
        this.addClass(step, "editing");
      } else {
        this.removeClass(step, "editing");
      }
      if (stepNum < this.currentStep) {
        this.addClass(step, "done");
      } else {
        this.removeClass(step, "done");
      }
    });
  }
  hasClass(elem:any, className:any) {
    return new RegExp(" " + className + " ").test(" " + elem.className + " ");
  }

  addClass(elem:any, className:any) {
    if (!this.hasClass(elem, className)) {
      elem.className += " " + className;
    }
  }

  removeClass(elem:any, className:any) {
    var newClass = " " + elem.className.replace(/[\t\r\n]/g, " ") + " ";
    if (this.hasClass(elem, className)) {
      while (newClass.indexOf(" " + className + " ") >= 0) {
        newClass = newClass.replace(" " + className + " ", " ");
      }
      elem.className = newClass.replace(/^\s+|\s+$/g, "");
    }
  }
}




