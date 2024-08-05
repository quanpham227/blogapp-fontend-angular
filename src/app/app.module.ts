import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HomeComponent } from './home/home.component';
import { BlogComponent } from './blog/blog.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    HomeComponent,
    BlogComponent,
    HeaderComponent,
    FooterComponent,
    BlogDetailComponent,
    SidebarComponent,
    LoginComponent,
    RegisterComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot([{ path: 'register', component: RegisterComponent }]),
  ],
  providers: [],
  bootstrap: [
    //HomeComponent
    //BlogComponent,
    //BlogDetailComponent,
    // LoginComponent,
    RegisterComponent,
  ],
})
export class AppModule {}
