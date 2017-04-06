import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { User } from '../model/user';
import { AlertService } from '../service/alert.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit {

  private users: User[];
  private selectedUser: User;
  private displayDialog: boolean = false;
  private editDialog: boolean = false;
  private changePwdDialog: boolean = false;
  private model: any = {};
  private loading = false;
  private currPassword: string ='';
  private newPassword1: string ='';
  private newPassword2: string ='';
  
  private loggedInUser: string;


  constructor(private userService: UserService, private alertService: AlertService, private router: Router) { }

  ngOnInit() {
    this.userService.getAll()
    .subscribe(
        (data) => { 
          this.users = data;
/*          let docs = data.rows.map((row) => {
              this.users.push(row.doc);
          }) 
*/        },
        (error) => {
          console.log(error);
          this.alertService.error(error);
        }
    );
    this.loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    this.displayDialog = true;
  }

  editUser(user: User): void {
    this.selectedUser = user;
    this.model = user;
    this.editDialog = true;
  }

  changeUserPwd(user: User): void {
    this.selectedUser = user;
    this.model = user;
    this.changePwdDialog = true;
  }

  deleteUser(user: User, index: any): void {
    this.selectedUser = user;
    this.userService.delete(user._id,user._rev)
    .subscribe((data) => { 
                  console.log("user deleted"); 
                  this.alertService.success("Membre supprimé")
                  this.ngOnInit();},
                (error) => { console.log("problem deleting user"); this.alertService.error(error); }
    );
  }

  update() {
    this.loading = true;
    this.userService.update(this.model)
        .subscribe(
            data => {
                this.alertService.success('Mise à jour réussie', true);
                this.router.navigate(['/members']);
            },
            error => {
                this.alertService.error(error);
                this.loading = false;
            });
      this.editDialog=false
  }

  updatePwd() {
    this.selectedUser = this.model;
    if (this.newPassword1 != this.newPassword2) {
      this.alertService.error('Les nouveaux deux mots de passe sont les mêmes.');   
      this.loading = false;
    }
    else {
      this.loading = true;
      this.userService.updatePwd(this.model,this.currPassword, this.newPassword1)
          .subscribe(
              data => {
                  this.alertService.success('Mise à jour réussie', true);
                  this.router.navigate(['/members']);
              },
              error => {
                  this.alertService.error(error);
                  this.loading = false;
              });
    }
    this.changePwdDialog=false
  }


  onDialogHide() {
    this.displayDialog = false;
    this.editDialog = false;
    this.changePwdDialog = false;
    //this.selectUser = null;
    //this.model = null;
  }
}
