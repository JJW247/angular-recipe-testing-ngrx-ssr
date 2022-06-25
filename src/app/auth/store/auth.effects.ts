import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, map, of, switchMap, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import * as AuthActions from './auth.actions';
import {Router} from '@angular/router';
import {User} from '../user.model';
import {AuthService} from '../auth.service';

export interface AuthResponseData {
  idToken: string;
  email: string;
  expiresIn: string;
}

const handleAuthentication = (email: string, token: string, expiresIn: number) => {
  const tokenExpirationDate = new Date(expiresIn * 1000);
  const user = new User(email, token, tokenExpirationDate);
  localStorage.setItem('userData', JSON.stringify(user));
  return new AuthActions.AuthenticateSuccess({
    email: email,
    token: token,
    expirationDate: tokenExpirationDate,
  });
};

const handleError = (errorResponse: any) => {
  let errorMessage = 'An unknown error occured!';
  if (!errorResponse.error || !errorResponse.error.statusCode) {
    return of(new AuthActions.AuthenticateFail(errorMessage));
  }
  switch (errorResponse.error.statusCode) {
    case 400:
      errorMessage = errorResponse.error.message;
      break;
    default:
      errorMessage = 'An error occurred!';
  }
  return of(new AuthActions.AuthenticateFail(errorMessage));
};

@Injectable()
export class AuthEffects {
  @Effect()
  authSignup = this.actions$.pipe(
    ofType(AuthActions.SIGNUP_START),
    switchMap((signupAction: AuthActions.SignupStart) => {
      return this.http
        .post<AuthResponseData>(environment.backendUrl + '/user/signup', {
          email: signupAction.payload.email,
          password: signupAction.payload.password,
        })
        .pipe(
          tap(responseData => {
            const tokenExpirationDate = new Date(+responseData.expiresIn * 1000);
            const expirationDuration = new Date(tokenExpirationDate).getTime() - new Date().getTime();
            this.authService.setLogoutTimer(expirationDuration);
          }),
          map(responseData => {
            return handleAuthentication(responseData.email, responseData.idToken, +responseData.expiresIn);
          }),
          catchError(errorResponse => {
            return handleError(errorResponse);
          }),
        );
    }),
  );

  @Effect()
  authLogin = this.actions$.pipe(
    ofType(AuthActions.LOGIN_START),
    switchMap((authData: AuthActions.LoginStart) => {
      return this.http
        .post<AuthResponseData>(environment.backendUrl + '/user/signin', {
          email: authData.payload.email,
          password: authData.payload.password,
        })
        .pipe(
          tap(responseData => {
            const tokenExpirationDate = new Date(+responseData.expiresIn * 1000);
            const expirationDuration = new Date(tokenExpirationDate).getTime() - new Date().getTime();
            this.authService.setLogoutTimer(expirationDuration);
          }),
          map(responseData => {
            return handleAuthentication(responseData.email, responseData.idToken, +responseData.expiresIn);
          }),
          catchError(errorResponse => {
            return handleError(errorResponse);
          }),
        );
    }),
  );

  @Effect({dispatch: false})
  authRedirect = this.actions$.pipe(
    ofType(AuthActions.AUTHENTICATE_SUCCESS),
    tap(() => {
      this.router.navigate(['/']);
    }),
  );

  @Effect()
  autoLogin = this.actions$.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map(() => {
      const userData: {email: string; _token: string; _tokenExpirationDate: string} = JSON.parse(
        localStorage.getItem('userData'),
      );
      if (!userData) {
        return {type: 'DUMMY'};
      }
      const loadedUser = new User(userData.email, userData._token, new Date(userData._tokenExpirationDate));
      if (loadedUser.token) {
        const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
        this.authService.setLogoutTimer(expirationDuration);
        return new AuthActions.AuthenticateSuccess({
          email: loadedUser.email,
          token: loadedUser.token,
          expirationDate: new Date(userData._tokenExpirationDate),
        });
      }
      return {type: 'DUMMY'};
    }),
  );

  @Effect({dispatch: false})
  authLogout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    tap(() => {
      this.authService.clearLogoutTimer();
      localStorage.removeItem('userData');
      this.router.navigate(['/auth']);
    }),
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
  ) {}
}
