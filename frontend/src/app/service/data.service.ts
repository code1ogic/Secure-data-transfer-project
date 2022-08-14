import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import { Request } from '../model/request';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  requestsUrl : string = 'http://localhost:5000/api/requests/';
  filesUrl : string = 'http://localhost:5000/api/files/';
  usersUrl : string = 'http://localhost:5000/api/auth/';

  constructor(private http : HttpClient) { }

  getRequests(id : string) : Observable<any> {
    return this.http.get<any>(this.requestsUrl+'getrequests/'+id);
  }

  sendRequest(requestObj : any) : Observable<any> {
    return this.http.post<any>(this.requestsUrl+'sendrequest',requestObj);
  }


   getFiles(id : string) : Observable<File[]> {
    return this.http.get<File[]>(this.filesUrl+'getfiles/'+id);
   }

   uploadFile(formData : FormData) : Observable<any> {
    return this.http.post<any>(this.filesUrl+'upload',formData);
   }


  getUsers(id : string) : Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl+'getusers/'+id);
  }

  getUser(id : string) : Observable<User> {
    return this.http.get<User>(this.usersUrl+'getuser/'+id);
  }


}
