import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl : string = 'http://localhost:5000/';
  constructor(private http: HttpClient) { }

  login(user : User) : Observable<any> {
    return this.http.post(this.apiUrl+'login', user);
  }

  register(user : User) : Observable<any> {
    return this.http.post(this.apiUrl+'register', user);
  }

}
