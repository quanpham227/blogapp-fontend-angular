import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebLayoutComponent } from './components/layouts/web-layout/web-layout.component';
import { AuthLayoutComponent } from './components/layouts/auth-layout/auth-layout.component';
import { AdminLayoutComponent } from './components/layouts/admin-layout/admin-layout.component';
import { NotfoundAdminComponent } from './components/admin/notfound/notfound.admin.component';
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
        data: { animation: 'HomePage' },
      },
      {
        path: 'blog',
        loadComponent: () => import('./components/blog/blog.component').then((m) => m.BlogComponent),
        data: { animation: 'BlogPage' },
      },
      {
        path: 'blog/page/:page',
        loadComponent: () => import('./components/blog/blog.component').then((m) => m.BlogComponent),
        data: { animation: 'BlogPage' },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
      },
      {
        path: 'blog/category/:categorySlug',
        loadComponent: () => import('./components/blog/blog.component').then((m) => m.BlogComponent),
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        data: { animation: 'BlogPage' },
      },
      {
        path: 'blog/category/:categorySlug/page/:page',
        loadComponent: () => import('./components/blog/blog.component').then((m) => m.BlogComponent),
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        data: { animation: 'BlogPage' },
      },
      {
        path: 'blog/search/:keyword',
        loadComponent: () => import('./components/blog/blog.component').then((m) => m.BlogComponent),
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        data: { animation: 'BlogPage' },
      },
      {
        path: 'blog/search/:keyword/page/:page',
        loadComponent: () => import('./components/blog/blog.component').then((m) => m.BlogComponent),
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        data: { animation: 'BlogPage' },
      },
      {
        path: 'blog/:slug',
        loadComponent: () => import('./components/blog-detail/blog-detail.component').then((m) => m.BlogDetailComponent),
        data: { animation: 'BlogDetailPage' },
      },

      {
        path: 'user-profile',
        loadComponent: () => import('./components/user-profile/user-profile.component').then((m) => m.UserProfileComponent),
        data: { animation: 'UserProfilePage' },
        canActivate: [AuthGuardFn],
      },
    ],
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./components/register/register.component').then((m) => m.RegisterComponent) },
      {
        path: 'auth/google/callback',
        loadComponent: () => import('./auth-callback/auth-callback.component').then((m) => m.AuthCallbackComponent),
      },
      {
        path: 'auth/facebook/callback',
        loadComponent: () => import('./auth-callback/auth-callback.component').then((m) => m.AuthCallbackComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./components/forgot-password/forgot-password.admin.component').then((m) => m.ForgotPasswordAdminComponent),
      },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminGuardFn],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin/dashboard/dashboard.admin.component').then((m) => m.DashboardAdminComponent),
      },
      {
        path: 'clients',
        loadComponent: () => import('./components/admin/client/client.admin.component').then((m) => m.ClientAdminComponent),
        data: { animation: 'ClientPage' },
      },
      {
        path: 'about',
        loadComponent: () => import('./components/admin/about/about-admin.component').then((m) => m.AboutAdminComponent),
        data: { animation: 'AboutPage' },
      },
      {
        path: 'categories',
        loadComponent: () => import('./components/admin/category/category.admin.component').then((m) => m.CategoryAdminComponent),
        data: { animation: 'CategoryPage' },
      },
      {
        path: 'posts',
        loadComponent: () => import('./components/admin/post/post.admin.component').then((m) => m.PostAdminComponent),
        data: { animation: 'PostPage' },
      },
      {
        path: 'add-post',
        loadComponent: () => import('./components/admin/insert-post/insert-post.admin.component').then((m) => m.InsertPostAdminComponent),
        data: { animation: 'InsertPostPage' },
      },
      {
        path: 'post-edit/:id',
        loadComponent: () => import('./components/admin/update-post/update-post.admin..component').then((m) => m.UpdatePostAdminComponent),
        data: { animation: 'UpdatePostPage' },
      },
      {
        path: 'slides',
        loadComponent: () => import('./components/admin/slide/slide.admin.component').then((m) => m.SlideAdminComponent),
        data: { animation: 'SlidePage' },
      },
      {
        path: 'media',
        loadComponent: () => import('./components/admin/media/media.admin.component').then((m) => m.MediaAdminComponent),
        data: { animation: 'MediaPage' },
      },
      {
        path: 'emails',
        loadComponent: () => import('./components/admin/email/email.admin.component').then((m) => m.EmailAdminComponent),
        data: { animation: 'EmailPage' },
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/admin/profile/profile.admin.component').then((m) => m.ProfileAdminComponent),
        data: { animation: 'ProfilePage' },
      },
      {
        path: 'contact',
        loadComponent: () => import('./components/admin/contact/contact.admin.component').then((m) => m.ContactAdminComponent),
        data: { animation: 'ContactPage' },
      },
      {
        path: '404',
        loadComponent: () => import('./components/admin/notfound/notfound.admin.component').then((m) => m.NotfoundAdminComponent),
        data: { animation: 'NotFoundPage' },
      },
      {
        path: 'comments',
        loadComponent: () => import('./components/admin/comment/comment.admin.component').then((m) => m.CommentAdminComponent),
        data: { animation: 'CommentPage' },
      },
      {
        path: 'achievements',
        loadComponent: () => import('./components/admin/achievement/admin-achievement.component').then((m) => m.AchievementAdminComponent),
      },
      {
        path: 'tags',
        loadComponent: () => import('./components/admin/tag/tag-admin.component').then((m) => m.TagAdminComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./components/admin/user-management/user-management.component').then((m) => m.UserManagementComponent),
      },

      {
        path: '**',
        loadComponent: () => import('./components/admin/notfound/notfound.admin.component').then((m) => m.NotfoundAdminComponent),
      },
    ],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [{ provide: LocationStrategy, useClass: PathLocationStrategy }],
  exports: [RouterModule],
})
export class AppRoutingModule {}
