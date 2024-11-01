import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { WebLayoutComponent } from './components/layouts/web-layout/web-layout.component';
import { AuthLayoutComponent } from './components/layouts/auth-layout/auth-layout.component';
import { AdminLayoutComponent } from './components/layouts/admin-layout/admin-layout.component';
import { DashboardAdminComponent } from './components/admin/dashboard/dashboard.admin.component';
import { ClientAdminComponent } from './components/admin/client/client.admin.component';
import { CategoryAdminComponent } from './components/admin/category/category.admin.component';
import { PostAdminComponent } from './components/admin/post/post.admin.component';
import { SlideAdminComponent } from './components/admin/slide/slide.admin.component';
import { MediaAdminComponent } from './components/admin/media/media.admin.component';
import { EmailAdminComponent } from './components/admin/email/email.admin.component';
import { ProfileAdminComponent } from './components/admin/profile/profile.admin.component';
import { ContactAdminComponent } from './components/admin/contact/contact.admin.component';
import { NotfoundAdminComponent } from './components/admin/notfound/notfound.admin.component';
import { CategoryAddOrUpdateAdminComponent } from './components/admin/category-form/category-add-or-update.admin.component';
import { ClientAddOrUpdateAdminComponent } from './components/admin/client-form/client-add-or-update.admin.component';
import { CommentAdminComponent } from './components/admin/comment/comment.admin.component';
import { AboutAdminComponent } from './components/admin/about/about-admin.component';
import { InsertPostAdminComponent } from './components/admin/insert-post/insert-post.admin.component';
import { UpdatePostAdminComponent } from './components/admin/update-post/update-post.admin..component';
import { AdminGuardFn } from './guards/admin.guard';
import { AuthGuardFn } from './guards/auth.guard';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';

export const routes: Routes = [
  {
    path: '',
    component: WebLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'blog',
        loadComponent: () => import('./components/blog/blog.component').then((m) => m.BlogComponent),
      },
      {
        path: 'blog/category/:categorySlug',
        loadComponent: () => import('./components/blog/blog.component').then((m) => m.BlogComponent),
      },
      {
        path: 'blog/category/:categorySlug/page/:page',
        loadComponent: () => import('./components/blog/blog.component').then((m) => m.BlogComponent),
        runGuardsAndResolvers: 'paramsChange',
      },
      {
        path: 'blog/search/:keyword',
        loadComponent: () => import('./components/blog/blog.component').then((m) => m.BlogComponent),
      },
      {
        path: 'blog/search/:keyword/page/:page',
        loadComponent: () => import('./components/blog/blog.component').then((m) => m.BlogComponent),
        runGuardsAndResolvers: 'paramsChange',
      },
      {
        path: 'blog/:slug',
        loadComponent: () =>
          import('./components/blog-detail/blog-detail.component').then((m) => m.BlogDetailComponent),
      },
      {
        path: 'post-preview',
        loadComponent: () =>
          import('./components/post-preview/post-preview.admin.component').then((m) => m.PostPreviewAdminComponent),
      },
      {
        path: 'user-profile',
        loadComponent: () =>
          import('./components/user-profile/user-profile.component').then((m) => m.UserProfileComponent),
        canActivate: [AuthGuardFn],
      },
    ],
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminGuardFn],
    children: [
      { path: 'dashboard', component: DashboardAdminComponent },
      { path: 'clients', component: ClientAdminComponent },
      { path: 'about', component: AboutAdminComponent },
      { path: 'categories', component: CategoryAdminComponent },
      { path: 'posts', component: PostAdminComponent },
      { path: 'add-post', component: InsertPostAdminComponent },
      { path: 'post-edit/:id', component: UpdatePostAdminComponent },
      { path: 'slides', component: SlideAdminComponent },
      { path: 'media', component: MediaAdminComponent },
      { path: 'emails', component: EmailAdminComponent },
      { path: 'profile', component: ProfileAdminComponent },
      { path: 'contact', component: ContactAdminComponent },
      { path: '404', component: NotfoundAdminComponent },
      { path: 'category-add', component: CategoryAddOrUpdateAdminComponent },
      {
        path: 'category-edit/:id',
        component: CategoryAddOrUpdateAdminComponent,
      },
      { path: 'client-add', component: ClientAddOrUpdateAdminComponent },
      { path: 'client-edit/:id', component: ClientAddOrUpdateAdminComponent },
      { path: 'comments', component: CommentAdminComponent },
      { path: '**', component: NotfoundAdminComponent },
    ],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload',
    }),
  ],
  providers: [{ provide: LocationStrategy, useClass: PathLocationStrategy }],
  exports: [RouterModule],
})
export class AppRoutingModule {}
