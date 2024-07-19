import { Routes } from '@angular/router';
import { authGuard } from './shared/auth.guard';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { BoardComponent } from './board/board.component';
import { IsVerifiedComponent } from './is-verified/is-verified.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
    { path: 'board', component: BoardComponent, canActivate: [authGuard] },
    { path: 'verified', component: IsVerifiedComponent, canActivate: [authGuard] },
    { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login', pathMatch: 'full' },
];
