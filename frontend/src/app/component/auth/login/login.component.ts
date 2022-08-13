import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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

  userObject : User = {
    _id: '',
    email: '',
    name: '',
    password: ''
  };
  response : String ='';
  userLoginData = new FormGroup({
    email : new FormControl(),
    password : new FormControl()
  })

  constructor(private fb : FormBuilder, private auth : AuthService, private route : Router) { }

  ngOnInit(): void {
    this.userLoginData = this.fb.group({
      email : ['',[Validators.required, Validators.email]],
      password : ['',[Validators.required]]
    });
    this.response = "";
  }

  userLogin()  {
    this.userObject.email = this.userLoginData.value.email;
    this.userObject.password = this.userLoginData.value.password;

    this.auth.login(this.userObject).subscribe(res => {
      this.route.navigate(['/dashboard']);
      localStorage.setItem("user_id", res._id);
    }, err => {
      this.response = err.error.msg;
      this.modal?.nativeElement.click();
    })
  }
}
