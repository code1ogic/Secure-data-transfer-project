import { Component, OnInit } from '@angular/core';
import { Request } from 'src/app/model/request';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit {

  id : any = '';
  allRequests : Request[] = [];
  constructor(private dataService : DataService) { }

  ngOnInit(): void {
    this.id = localStorage.getItem('user_id');
    this.allRequests = [];
    this.getAllRequests();

  }

  async getAllRequests() {
    this.dataService.getRequests(this.id).subscribe( res => {
      console.log(res);
    }, err => {
      console.log(err);
    })

  }

  print() : void {

  }



}
