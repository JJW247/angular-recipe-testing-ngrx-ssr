import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Recipe} from '../recipe.model';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss'],
})
export class RecipeListComponent implements OnInit {
  @Output()
  recipeWasSelected = new EventEmitter<Recipe>();

  recipes: Recipe[] = [
    new Recipe(
      'A Test Recipe',
      'This is simply a test',
      'https://cdn.pixabay.com/photo/2020/02/02/15/07/meat-4813261_960_720.jpg',
    ),
    new Recipe(
      'Another Test Recipe',
      'This is simply a test',
      'https://cdn.pixabay.com/photo/2020/02/02/15/07/meat-4813261_960_720.jpg',
    ),
  ];

  constructor() {}

  ngOnInit(): void {}

  onRecipeSelected(recipe: Recipe) {
    this.recipeWasSelected.emit(recipe);
  }
}
