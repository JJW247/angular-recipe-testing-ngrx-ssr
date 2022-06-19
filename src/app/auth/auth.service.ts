import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject, catchError, tap, throwError} from 'rxjs';
import {User} from './user.model';
import {environment} from '../../environments/environment';

export interface AuthResponseData {
  idToken: string;
  email: string;
  expiresIn: string;
}

@Injectable({providedIn: 'root'})
export class AuthService {
  user = new BehaviorSubject<User>(null);
  private tokenExpirationTimer: NodeJS.Timeout;

  constructor(private http: HttpClient, private router: Router) {}

  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(environment.backendUrl + '/user/signup', {
        email: email,
        password: password,
      })
      .pipe(
        catchError(this.handleError),
        tap(responseData => {
          this.handleAuthentication(responseData.email, responseData.idToken, +responseData.expiresIn);
        }),
      );
  }

  signin(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(environment.backendUrl + '/user/signin', {
        email: email,
        password: password,
      })
      .pipe(
        catchError(this.handleError),
        tap(responseData => {
          this.handleAuthentication(responseData.email, responseData.idToken, +responseData.expiresIn);
        }),
      );
  }

  autoLogin() {
    const userData: {email: string; _token: string; _tokenExpirationDate: string} = JSON.parse(
      localStorage.getItem('userData'),
    );
    if (!userData) {
      return;
    }
    const loadedUser = new User(userData.email, userData._token, new Date(userData._tokenExpirationDate));
    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(email: string, token: string, expiresIn: number) {
    const tokenExpirationDate = new Date(expiresIn * 1000);
    const user = new User(email, token, tokenExpirationDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(errorResponse: HttpErrorResponse) {
    let errorMessage = 'An unknown error occured!';
    if (!errorResponse.error || !errorResponse.error.statusCode) {
      return throwError(errorMessage);
    }
    switch (errorResponse.error.statusCode) {
      case 400:
        errorMessage = errorResponse.error.message;
        break;
      default:
        errorMessage = 'An error occurred!';
    }
    return throwError(errorMessage);
  }
}
