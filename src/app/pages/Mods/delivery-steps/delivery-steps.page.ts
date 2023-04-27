import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-delivery-steps',
  templateUrl: './delivery-steps.page.html',
  styleUrls: ['./delivery-steps.page.scss'],
})
export class DeliveryStepsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  name = "Angular";
  currentStep = 1;
  numSteps = 4;

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
