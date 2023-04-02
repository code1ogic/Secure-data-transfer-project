import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl : string = 'http://localhost:5000/api/auth/';
  constructor(private http: HttpClient) { }

  login(user : User) : Observable<any> {
    return this.http.post(this.apiUrl+'login', user);
  }

  register(user : User) : Observable<any> {
    return this.http.post(this.apiUrl+'register', user);
  }
  
  verifyOTP(user : User) : Observable<any> {
    return this.http.post(this.apiUrl+'verifyOtp', user);
  }

  isUserLoggedIn() : Boolean{
    if(localStorage.getItem("user_id")) {
      return true;
    }
    return false;
  }

}
