import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import {ViewChild, ElementRef} from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { User } from 'src/app/model/user';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @ViewChild('modal')
  modal: ElementRef | undefined;
  isLogingSuccess : boolean = false;
  userObject : User = {
    _id: '',
    email: '',
    name: '',
    password: ''
  };
  count : number = 3;
  response : String ='';
  userLoginData = new UntypedFormGroup({
    email : new UntypedFormControl(),
    password : new UntypedFormControl()
  })
  
  userOTP = new UntypedFormGroup({
    otp : new UntypedFormControl(),
    userId : new UntypedFormControl()
  })
  showPassword : boolean = false;

  constructor(private fb : UntypedFormBuilder, private auth : AuthService, private route : Router) { }

  ngOnInit(): void {
    this.userLoginData = this.fb.group({
      email : ['',[Validators.required, Validators.email]],
      password : ['',[Validators.required]]
    });
    this.userOTP = this.fb.group({
      otp : ['',[Validators.required]]
    });
    this.response = "";
  }

  userLogin()  {
    this.userObject.email = this.userLoginData.value.email;
    this.userObject.password = this.userLoginData.value.password;

    this.auth.login(this.userObject).subscribe(res => {
      console.log(res);
      localStorage.setItem("user_id", res._id);
      this.isLogingSuccess = true;
      //this.route.navigate(['/dashboard']);
    }, err => {
      this.response = err.error.msg;
      this.modal?.nativeElement.click();
    })
  }
  
  verifyOtp() {
    if(this.count < 1) {
      this.response = "You have reached maximum attempts for verifying OTP";
      this.modal?.nativeElement.click();
      return;
    }
    
    this.userObject.otp = this.userOTP.value.otp;
    this.userObject.userId = localStorage.getItem("user_id");
    this.count = this.count - 1;
    this.auth.verifyOTP(this.userObject).subscribe(res => {
      this.route.navigate(['/dashboard']);
    }, err => {
      this.response = err.error.msg;
      this.modal?.nativeElement.click();
    })
  }
  
  closeModel() {
    if(this.count < 1) {
      this.route.navigate(['/']);
      return;
    }
  }
  
  changePasswordProperty() {
    this.showPassword = !this.showPassword;
  }
}
