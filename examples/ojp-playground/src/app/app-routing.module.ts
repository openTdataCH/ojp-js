import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DeparturesComponent } from './departures/departures.component';
import { PlaygroundComponent } from './playground/playground.component';

const routes: Routes = [
  { path: 'departures', component: DeparturesComponent },
  { path: 'playground', component: PlaygroundComponent },
  { path: '', redirectTo: '/playground', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
