import { Component, OnInit } from '@angular/core';
import { Request } from 'src/app/model/request';
import { User } from 'src/app/model/user';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit {

  id : any = '';
  allRequests : Request[] = [];
  userId : any = '';
  allUsers: User[] = [];
  constructor(private dataService : DataService) { }

  ngOnInit(): void {
    this.id = localStorage.getItem('user_id');
    this.allRequests = [];
    this.userId = localStorage.getItem('user_id');
    this.getAllRequests();
    this.getAllUsers();
  }

  getAllRequests() {
    this.dataService.getRequests(this.id).subscribe( res => {
      this.allRequests = res.requests;
      this.modifyRequests(this.allRequests);
      //console.log(this.allRequests);
    }, err => {
      console.log(err);
    })

  }
  modifyRequests(requests: Request[]) {
    requests.forEach(async element => {
      element.sender_name = await this.getSenderName(element.sender_id);
      element.filesize = this.niceBytes(element.filesize);
    });
    console.log(requests);
  }

  niceBytes(x: string) {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let l = 0, n = parseInt(x, 10) || 0;
    while (n >= 1024 && ++l) {
      n = n / 1024;
    }
    return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
  }

  getSenderName(id : string) : string {
    let senderName = '';
    this.allUsers.forEach(element => {
      if(element._id === id) {
        senderName = element.name;
      }
    });
    return senderName;
  }

  acceptRequest(request : Request) {
    request.receiver_id = this.userId;
    this.dataService.acceptRequest(request).subscribe(res => {
      this.ngOnInit();
    }, err => {
      console.log(err)
    })
  }

  rejectRequest(request : Request) {
    request.receiver_id = this.userId;
    this.dataService.rejectRequest(request).subscribe(res => {
      this.ngOnInit();
    }, err => {
      console.log(err)
    })
  }

  getAllUsers() {
    this.dataService.getUsers(this.userId).subscribe(res => {
      this.allUsers = res.users;
      console.log(this.allUsers);
    })
  }

}
