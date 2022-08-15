import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { FileModel } from 'src/app/model/file-model';
import { User } from 'src/app/model/user';
import { DataService } from 'src/app/service/data.service';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css']
})
export class FilesComponent implements OnInit {

  myForm = new FormGroup({
    file: new FormControl('', [Validators.required]),
  });

  textColors : any = ['text-primary','text-info','text-warning','text-danger','text-success']

  user_id: any = '';
  uploadedFiles: FileModel[] = [];
  selectedFile: FileModel = {
    filename: '',
    filesize: '',
    shared: false,
    actualfilesize: ''
  };

  selectedUserId: string = '';

  @ViewChild('modalSuccess')
  modalSuccess: ElementRef | undefined;

  @ViewChild('modalFailure')
  modalFailure: ElementRef | undefined;

  response: string = '';
  id: any;
  allUsers: User[] = [];
  fileShareObj: any = {
    sender_id: '',
    receiver_id: '',
    filename: '',
    filesize: ''
  };
  error: boolean = false;
  success: boolean = false;

  constructor(private http: HttpClient, private dataService: DataService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.user_id = localStorage.getItem('user_id');
    this.myForm = this.fb.group({
      file: ['', [Validators.required]],
    });

    this.id = localStorage.getItem('user_id');
    this.getAllFiles();
    this.selectedFile = {
      filename: '',
      filesize: '',
      actualfilesize: '',
      shared: false
    };
    this.allUsers = [];
    this.getAllUsers();
    this.selectedUserId = '';
    this.fileShareObj = {
      sender_id: '',
      receiver_id: '',
      filename: '',
      filesize: ''
    };
    this.success = false;
    this.error = false;
  }

  selectFile(event: any) {
    const file = event.target.files[0];
    this.myForm.patchValue({
      file: file
    });
    this.myForm.get('')?.updateValueAndValidity()
  }

  uploadFile() {
    const formData = new FormData();
    const file = this.myForm.value.file;
    formData.append("filename", file.name);
    formData.append("_id", this.user_id);
    formData.append("filesize", file.size);
    formData.append("file", file);

    this.dataService.uploadFile(formData).subscribe(res => {
      this.myForm.reset();
      this.response = res.msg;
      this.modalSuccess?.nativeElement.click();
    }, err => {
      this.myForm.reset();
      this.response = err.error.msg;
      this.modalFailure?.nativeElement.click();
    })
  }

  getAllFiles() {
    this.dataService.getFiles(this.id).subscribe(res => {
      this.uploadedFiles = res?.files;
    }, err => {
      this.response = err.error.msg;
      this.modalFailure?.nativeElement.click();
    })
  }

  getSelectedFile(file: FileModel) {
    this.selectedFile.filename = file.filename;
    this.selectedFile.filesize = this.niceBytes(file.filesize);
    this.selectedFile.shared = file.shared;
    this.selectedFile.actualfilesize = file.filesize;
  }

  getAllUsers() {
    this.dataService.getUsers(this.user_id).subscribe(res => {
      this.allUsers = res.users;
    })
  }

  niceBytes(x: string) {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let l = 0, n = parseInt(x, 10) || 0;
    while (n >= 1024 && ++l) {
      n = n / 1024;
    }
    return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
  }

  shareFile() {
    this.fileShareObj.filename = this.selectedFile.filename;
    this.fileShareObj.filesize = this.selectedFile.actualfilesize;
    this.fileShareObj.sender_id = this.user_id;
    this.fileShareObj.receiver_id = this.selectedUserId;

    this.dataService.sendRequest(this.fileShareObj).subscribe(res => {
      this.response = res.msg;
      this.success = true;
    }, err => {
      this.response = err.error.msg;
      this.error = true;
    })

  }

  downloadFile() {
    const fileData = {
      _id : this.user_id,
      filename : this.selectedFile.filename
    }
    this.dataService.downloadFile(fileData).subscribe((res : any) => {
      console.log(res);
      FileSaver.saveAs(res, this.selectedFile.filename)
    }, (err :any) => {
      console.log(err);
    })
  }
}
