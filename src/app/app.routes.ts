import { AdminGuardFn } from './guards/admin.guard';
import { AuthGuardFn } from './guards/auth.guard';
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { BlogComponent } from './components/blog/blog.component';
import { BlogDetailComponent } from './components/blog-detail/blog-detail.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { WebLayoutComponent } from './components/layouts/web-layout/web-layout.component';
import { AuthLayoutComponent } from './components/layouts/auth-layout/auth-layout.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
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
import { PostPreviewAdminComponent } from './components/post-preview/post-preview.admin.component';

export const routes: Routes = [
  {
    path: '',
    component: WebLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'blog', component: BlogComponent },
      { path: 'blog-detail/:slug', component: BlogDetailComponent },
      {
        path: 'user-profile',
        component: UserProfileComponent,
        canActivate: [AuthGuardFn],
      },
      {
        path: 'post-preview',
        component: PostPreviewAdminComponent,
      },
      // other routes that should use the MainLayout
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
  // other routes...
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminGuardFn],
    children: [
      {
        path: 'dashboard',
        component: DashboardAdminComponent,
        canActivateChild: [AdminGuardFn], // Bảo vệ route con
      },
      {
        path: 'clients',
        component: ClientAdminComponent,
        canActivateChild: [AdminGuardFn], // Bảo vệ route con
      },
      {
        path: 'about',
        component: AboutAdminComponent,
        canActivateChild: [AdminGuardFn], // Bảo vệ route con
      },

      {
        path: 'categories',
        component: CategoryAdminComponent,
        canActivateChild: [AdminGuardFn], // Bảo vệ route con
      },
      {
        path: 'posts',
        component: PostAdminComponent,
        canActivateChild: [AdminGuardFn], // Bảo vệ route con
      },
      {
        path: 'add-post',
        component: InsertPostAdminComponent,
        canActivateChild: [AdminGuardFn], // Bảo vệ route con
      },
      {
        path: 'post-edit/:id',
        component: UpdatePostAdminComponent,
        canActivateChild: [AdminGuardFn], // Bảo vệ route con
      },

      {
        path: 'slides',
        component: SlideAdminComponent,
        canActivateChild: [AdminGuardFn], // Bảo vệ route con
      },
      {
        path: 'media',
        component: MediaAdminComponent,
        canActivateChild: [AdminGuardFn], // Bảo vệ route con
      },
      {
        path: 'emails',
        component: EmailAdminComponent,
        canActivateChild: [AdminGuardFn], // Bảo vệ route con
      },
      {
        path: 'profile',
        component: ProfileAdminComponent,
        canActivate: [AdminGuardFn], // Bảo vệ route con
      },
      {
        path: 'contact',
        component: ContactAdminComponent,
        canActivateChild: [AdminGuardFn], // Bảo vệ route con
      },
      {
        path: '404',
        component: NotfoundAdminComponent,
        canActivateChild: [AdminGuardFn], // Bảo vệ route con
      },
      {
        path: 'category-add',
        component: CategoryAddOrUpdateAdminComponent,
        canActivateChild: [AdminGuardFn], // Bảo vệ route con
      },
      {
        path: 'category-edit/:id',
        component: CategoryAddOrUpdateAdminComponent,
        canActivateChild: [AdminGuardFn], // Bảo vệ route con
      },
      {
        path: 'client-add',
        component: ClientAddOrUpdateAdminComponent,
        canActivateChild: [AdminGuardFn], // Bảo vệ route con
      },
      {
        path: 'client-edit/:id',
        component: ClientAddOrUpdateAdminComponent,
        canActivateChild: [AdminGuardFn], // Bảo vệ route con
      },
      {
        path: 'comments',
        component: CommentAdminComponent,
        canActivateChild: [AdminGuardFn], // Bảo vệ route con
      },
    ],
  },
];
