import { AdminComponent } from './admin.component';
import { Routes } from '@angular/router';
import { CategoryAdminComponent } from './category/category.admin.component';
import { ClientAdminComponent } from '../../components/admin/client/client.admin.component';
import { PostAdminComponent } from '../../components/admin/post/post.admin.component';
import { SlideAdminComponent } from '../../components/admin/slide/slide.admin.component';
import { DashboardAdminComponent } from '../../components/admin/dashboard/dashboard.admin.component';
import { ProfileAdminComponent } from './profile/profile.admin.component';
import { ContactAdminComponent } from './contact/contact.admin.component';
import { NotfoundAdminComponent } from './notfound/notfound.admin.component';
import { CategoryAddOrUpdateAdminComponent } from './category-form/category-add-or-update.admin.component';
import { ClientAddOrUpdateAdminComponent } from './client-form/client-add-or-update.admin.component';
import { MediaAdminComponent } from './media/media.admin.component';
import { EmailAdminComponent } from './email/email.admin.component';

export const adminRoutes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardAdminComponent,
      },
      {
        path: 'clients',
        component: ClientAdminComponent,
      },

      {
        path: 'categories',
        component: CategoryAdminComponent,
      },
      {
        path: 'posts',
        component: PostAdminComponent,
      },
      {
        path: 'slides',
        component: SlideAdminComponent,
      },
      {
        path: 'media',
        component: MediaAdminComponent,
      },
      {
        path: 'emails',
        component: EmailAdminComponent,
      },
      {
        path: 'profile',
        component: ProfileAdminComponent,
      },
      {
        path: 'contact',
        component: ContactAdminComponent,
      },
      {
        path: '404',
        component: NotfoundAdminComponent,
      },
      {
        path: 'category-add',
        component: CategoryAddOrUpdateAdminComponent,
      },
      {
        path: 'category-edit/:id',
        component: CategoryAddOrUpdateAdminComponent,
      },
      {
        path: 'client-add',
        component: ClientAddOrUpdateAdminComponent,
      },
      {
        path: 'client-edit/:id',
        component: ClientAddOrUpdateAdminComponent,
      },
    ],
  },
];
