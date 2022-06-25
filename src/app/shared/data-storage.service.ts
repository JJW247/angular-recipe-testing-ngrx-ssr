import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {map, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {Recipe} from '../recipes/recipe.model';
import {environment} from '../../environments/environment';
import * as fromApp from '../store/app.reducer';
import * as RecipesActions from '../recipes/store/recipe.actions';

@Injectable({providedIn: 'root'})
export class DataStorageService {
  constructor(private http: HttpClient, private store: Store<fromApp.AppState>) {}

  fetchRecipes() {
    return this.http.get<Recipe[]>(environment.backendUrl + '/recipes').pipe(
      map(recipes => {
        return recipes.map(recipe => {
          return {...recipe, ingredients: recipe.ingredients ? recipe.ingredients : []};
        });
      }),
      tap(recipes => {
        this.store.dispatch(new RecipesActions.SetRecipes(recipes));
      }),
    );
  }
}
