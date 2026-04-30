import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonInput, IonButton, IonItem,
  IonLabel, IonText, IonSpinner
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    FormsModule,
    IonContent, IonInput, IonButton, IonItem,
    IonLabel, IonText, IonSpinner, RouterLink
  ],
})
export class LoginPage {

  email    = '';
  password = '';
  error    = '';
  loading  = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    this.error   = '';
    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        if (this.authService.isFullyRegistered()) {
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/onboarding']);
        }
      },
      error: (err) => {
      this.loading = false;

      console.log('EMAIL ERROR:', err.error?.email);
      console.log('PASSWORD ERROR:', err.error?.password);  

      this.error =
        err.error?.detail ||
        err.error?.email?.[0] ||
        err.error?.password?.[0] ||
        err.error?.non_field_errors?.[0] ||
        'Email o contraseña incorrectos.';
    }
    });
  }
}