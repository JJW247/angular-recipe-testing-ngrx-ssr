import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, throwError} from 'rxjs';

export interface AuthResponseData {
  idToken: string;
  email: string;
  expiresIn: string;
}

@Injectable({providedIn: 'root'})
export class AuthService {
  constructor(private http: HttpClient) {}

  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>('http://localhost:3010/user/signup', {
        email: email,
        password: password,
      })
      .pipe(catchError(this.handleError));
  }

  signin(email: string, password: string) {
    return this.http
      .post<AuthResponseData>('http://localhost:3010/user/signin', {
        email: email,
        password: password,
      })
      .pipe(catchError(this.handleError));
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
