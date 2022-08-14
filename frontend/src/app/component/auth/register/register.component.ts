import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ViewChild, ElementRef } from '@angular/core';
import { User } from 'src/app/model/user';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  @ViewChild('successModal')
  successModal: ElementRef | undefined;

  @ViewChild('failModal')
  failModal: ElementRef | undefined;

  response: string = "";
  userObject: User = {
    _id: '',
    email: '',
    name: '',
    password: ''
  };
  userRegisterData = new FormGroup({
    name: new FormControl(),
    email: new FormControl(),
    password: new FormControl()
  })

  constructor(private fb: FormBuilder, private auth: AuthService, private route : Router) { }

  ngOnInit(): void {
    this.userRegisterData = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  userRegister() {
    this.userObject.name = this.userRegisterData.value.name;
    this.userObject.email = this.userRegisterData.value.email;
    this.userObject.password = this.userRegisterData.value.password;

    this.auth.register(this.userObject).subscribe(res => {
      this.response = res.msg;
      this.successModal?.nativeElement.click();
    }, err => {
      this.response = err.error.msg;
      this.failModal?.nativeElement.click();
      console.log(err);
    });

  }

}
