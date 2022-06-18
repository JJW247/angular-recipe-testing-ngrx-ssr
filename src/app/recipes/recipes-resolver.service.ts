import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {DataStorageService} from '../shared/data-storage.service';
import {Recipe} from './recipe.model';
import {RecipeService} from './recipe.service';

@Injectable({providedIn: 'root'})
export class RecipesResolverService implements Resolve<Recipe[]> {
  constructor(
    private dataStorageServce: DataStorageService,
    private recipeService: RecipeService,
    private router: Router,
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Recipe[] | Observable<Recipe[]> | Promise<Recipe[]> {
    const recipes = this.recipeService.getRecipes();
    if (recipes[route.params.id] === undefined) {
      this.router.navigate(['/recipes']);
    }
    if (recipes.length === 0) {
      return this.dataStorageServce.fetchRecipes();
    } else {
      return recipes;
    }
  }
}
