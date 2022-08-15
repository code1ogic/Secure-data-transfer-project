import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  files : boolean = false;
  requests : boolean = false;

  constructor(private router : Router) { }

  ngOnInit(): void {
    this.showFiles();
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
