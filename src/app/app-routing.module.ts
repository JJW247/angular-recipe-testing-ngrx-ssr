import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const appRoutes: Routes = [
  {path: '', redirectTo: 'recipes', pathMatch: 'full'},
  // {path: 'recipes', loadChildren: './recipes/recipes.module#RecipesModule'},
  {path: 'recipes', loadChildren: () => import('./recipes/recipes.module').then(modules => modules.RecipesModule)},
  // {path: 'shopping-list', loadChildren: './shopping-list/shopping-list.module#ShoppingListModule'},
  {
    path: 'shopping-list',
    loadChildren: () => import('./shopping-list/shopping-list.module').then(modules => modules.ShoppingListModule),
  },
  // {
  //   path: 'auth',
  //   loadChildren: './auth/auth.module#AuthModule',
  // },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(modules => modules.AuthModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
