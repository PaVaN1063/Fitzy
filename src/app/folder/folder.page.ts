import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { JsonService } from '../services/json.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder!: string;

  constructor(private activatedRoute: ActivatedRoute, private http: HttpClient, private service :JsonService) { }

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

}
