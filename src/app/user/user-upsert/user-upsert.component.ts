import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../user.model';


@Component({
  selector: 'app-user-upsert',
  templateUrl: './user-upsert.component.html',
  styleUrl: './user-upsert.component.css'
})
export class UserUpsertComponent implements OnInit {
userForm!: FormGroup
userId: number | null = null;
userExists = false;
conflictMessage: string | null = null;


constructor(
  private route: ActivatedRoute,
  private router : Router,
  private userService: UserService,
  private cdr: ChangeDetectorRef 

){
  this.userForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('',Validators.required),
    address: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required,Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^\d{10}$/)]),
  })
}


ngOnInit(): void {
  this.route.params.subscribe(params => {
    this.userId = +params['id'] || null;
    if (this.userId) {
      const user = this.userService.getUserById(this.userId);
      if (user) this.userForm.patchValue(user);
    }
  });
}

onUserSubmit() {
  if (this.userForm.invalid) return;

  const user: User = {
    id: this.userId || Date.now(),
    ...this.userForm.value
  };

  if (!this.userId) {
  this.conflictMessage = this.userService.checkUserExists(user.email, user.phone);

    if (this.conflictMessage) {
      return;
    }
  }

  if (this.userId) {
    this.userService.updateUser(user);
  } else {
    this.userService.addUser(user);
  }

  this.router.navigate(['/users']);
  this.conflictMessage= null
}




onReset() {
  this.userForm.reset();
  this.conflictMessage = null;
}

} 
