// import { AdminComponent } from './admin.component';
// import { Routes } from '@angular/router';
// import { CategoryAdminComponent } from './category/category.admin.component';
// import { ClientAdminComponent } from '../../components/admin/client/client.admin.component';
// import { PostAdminComponent } from '../../components/admin/post/post.admin.component';
// import { SlideAdminComponent } from '../../components/admin/slide/slide.admin.component';
// import { DashboardAdminComponent } from '../../components/admin/dashboard/dashboard.admin.component';
// import { ProfileAdminComponent } from './profile/profile.admin.component';
// import { ContactAdminComponent } from './contact/contact.admin.component';
// import { NotfoundAdminComponent } from './notfound/notfound.admin.component';
// import { CategoryAddOrUpdateAdminComponent } from './category-form/category-add-or-update.admin.component';
// import { ClientAddOrUpdateAdminComponent } from './client-form/client-add-or-update.admin.component';
// import { MediaAdminComponent } from './media/media.admin.component';
// import { EmailAdminComponent } from './email/email.admin.component';
// import { CommentAdminComponent } from './comment/comment.admin.component';
// import { AdminGuardFn } from '../../guards/admin.guard';

// export const adminRoutes: Routes = [
//   {
//     path: 'admin',
//     component: AdminComponent,
//     children: [
//       {
//         path: 'dashboard',
//         component: DashboardAdminComponent,
//         canActivate: [AdminGuardFn], // Bảo vệ route con
//       },
//       {
//         path: 'clients',
//         component: ClientAdminComponent,
//         canActivate: [AdminGuardFn], // Bảo vệ route con
//       },

//       {
//         path: 'categories',
//         component: CategoryAdminComponent,
//         canActivate: [AdminGuardFn], // Bảo vệ route con
//       },
//       {
//         path: 'posts',
//         component: PostAdminComponent,
//         canActivate: [AdminGuardFn], // Bảo vệ route con
//       },
//       {
//         path: 'slides',
//         component: SlideAdminComponent,
//         canActivate: [AdminGuardFn], // Bảo vệ route con
//       },
//       {
//         path: 'media',
//         component: MediaAdminComponent,
//         canActivate: [AdminGuardFn], // Bảo vệ route con
//       },
//       {
//         path: 'emails',
//         component: EmailAdminComponent,
//         canActivate: [AdminGuardFn], // Bảo vệ route con
//       },
//       {
//         path: 'profile',
//         component: ProfileAdminComponent,
//         canActivate: [AdminGuardFn], // Bảo vệ route con
//       },
//       {
//         path: 'contact',
//         component: ContactAdminComponent,
//         canActivate: [AdminGuardFn], // Bảo vệ route con
//       },
//       {
//         path: '404',
//         component: NotfoundAdminComponent,
//         canActivate: [AdminGuardFn], // Bảo vệ route con
//       },
//       {
//         path: 'category-add',
//         component: CategoryAddOrUpdateAdminComponent,
//         canActivate: [AdminGuardFn], // Bảo vệ route con
//       },
//       {
//         path: 'category-edit/:id',
//         component: CategoryAddOrUpdateAdminComponent,
//         canActivate: [AdminGuardFn], // Bảo vệ route con
//       },
//       {
//         path: 'client-add',
//         component: ClientAddOrUpdateAdminComponent,
//         canActivate: [AdminGuardFn], // Bảo vệ route con
//       },
//       {
//         path: 'client-edit/:id',
//         component: ClientAddOrUpdateAdminComponent,
//         canActivate: [AdminGuardFn], // Bảo vệ route con
//       },
//       {
//         path: 'comments',
//         component: CommentAdminComponent,
//         canActivate: [AdminGuardFn], // Bảo vệ route con
//       },
//     ],
//   },
// ];
