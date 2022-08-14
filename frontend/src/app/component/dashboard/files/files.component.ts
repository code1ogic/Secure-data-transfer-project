import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css']
})
export class FilesComponent implements OnInit {
  myForm = new FormGroup({
    file: new FormControl('', [Validators.required]),
  });

  fileObj : any = {
    _id : '',
    file : '',
    filename : '',
    filesize : ''
  }

  user_id : any = '';
  constructor(private http: HttpClient, private dataService : DataService, private fb : FormBuilder) {
    this.myForm = this.fb.group({
      file : ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.user_id = localStorage.getItem('user_id');
  }

  get f(){
    return this.myForm.controls;
  }

  uploadFile(event:any) {
    const file = event.target.files[0];
    this.myForm.patchValue({
      file: file
    });
    this.myForm.get('')?.updateValueAndValidity()
  }

  submit(){
    const formData = new FormData();
    const file  = this.myForm.value.file;
    formData.append("filename",file.name);
    formData.append("_id",this.user_id);
    formData.append("filesize",file.size);
    formData.append("file",file);

    this.dataService.uploadFile(formData).subscribe(res => {
      console.log(res);
    }, err => {
      console.log(err);
    })
  }
}
