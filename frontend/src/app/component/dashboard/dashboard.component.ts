import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  files : boolean = false;
  requests : boolean = false;
  userId : any = '';
  userName : string = '';
  constructor(private router : Router, private dataService : DataService) { }

  ngOnInit(): void {
    this.showFiles();
    this.userId = localStorage.getItem('user_id');
    this.dataService.getUser(this.userId).subscribe(res => {
      this.userName = res.name;
    })
  }

  setoff() {
    this.files = false;
    this.requests = false;
  }

  showFiles() {
    this.setoff();

    this.files = true;
  }

  showRequests() {
    this.setoff();
    this.requests = true;
  }

  signout() {
    localStorage.removeItem("user_id");
    this.router.navigate(['/login']);
  }

}
