import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject, takeUntil } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { UserDto } from '../../../core/models/auth.models';
import { NotificationDto, NotificationType } from '../../../core/models/notification.models';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
  children?: NavigationItem[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav 
        #drawer 
        class="sidenav" 
        fixedInViewport
        [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="(isHandset$ | async) === false">
        
        <!-- Sidebar Header -->
        <div class="sidenav-header">
          <div class="logo-container">
            <mat-icon class="logo-icon">business</mat-icon>
            <span class="logo-text">BPM Light</span>
          </div>
          <div class="user-info" *ngIf="currentUser$ | async as user">
            <div class="user-avatar">
              <mat-icon>account_circle</mat-icon>
            </div>
            <div class="user-details">
              <div class="user-name">{{user.firstName}} {{user.lastName}}</div>
              <div class="user-role">{{getUserRoles(user)}}</div>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <mat-nav-list class="nav-list">
          <ng-container *ngFor="let item of navigationItems">
            <mat-list-item 
              *ngIf="hasAccess(item.roles)"
              [routerLink]="item.route"
              routerLinkActive="active-link"
              class="nav-item">
              <mat-icon matListItemIcon>{{item.icon}}</mat-icon>
              <span matListItemTitle>{{item.label}}</span>
            </mat-list-item>
          </ng-container>
        </mat-nav-list>

        <!-- Sidebar Footer -->
        <div class="sidenav-footer">
          <mat-list-item class="nav-item" (click)="logout()">
            <mat-icon matListItemIcon>logout</mat-icon>
            <span matListItemTitle>Logout</span>
          </mat-list-item>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <!-- Top Toolbar -->
        <mat-toolbar class="toolbar" color="primary">
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="drawer.toggle()"
            *ngIf="isHandset$ | async">
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>
          
          <span class="toolbar-title">{{getPageTitle()}}</span>
          
          <div class="toolbar-spacer"></div>
          
          <!-- Notifications -->
          <button 
            mat-icon-button 
            [matMenuTriggerFor]="notificationMenu"
            matTooltip="Notifications">
            <mat-icon [matBadge]="unreadNotificationCount" 
                      [matBadgeHidden]="unreadNotificationCount === 0"
                      matBadgeColor="warn">
              notifications
            </mat-icon>
          </button>
          
          <!-- User Menu -->
          <button 
            mat-icon-button 
            [matMenuTriggerFor]="userMenu"
            matTooltip="User Menu">
            <mat-icon>account_circle</mat-icon>
          </button>
        </mat-toolbar>

        <!-- Main Content -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>

    <!-- Notification Menu -->
    <mat-menu #notificationMenu="matMenu" class="notification-menu">
      <div class="notification-header">
        <span>Notifications</span>
        <button mat-button (click)="markAllAsRead()" *ngIf="unreadNotificationCount > 0">
          Mark all as read
        </button>
      </div>
      <div class="notification-list" *ngIf="recentNotifications.length > 0; else noNotifications">
        <mat-list-item 
          *ngFor="let notification of recentNotifications" 
          class="notification-item"
          [class.unread]="!notification.isRead"
          (click)="markAsRead(notification)">
          <mat-icon matListItemIcon [color]="getNotificationColor(notification.type)">
            {{getNotificationIcon(notification.type)}}
          </mat-icon>
          <div matListItemTitle>{{notification.title}}</div>
          <div matListItemLine>{{notification.message}}</div>
          <div matListItemLine class="notification-time">
            {{formatNotificationTime(notification.createdAt)}}
          </div>
        </mat-list-item>
      </div>
      <ng-template #noNotifications>
        <div class="no-notifications">
          <mat-icon>notifications_none</mat-icon>
          <span>No notifications</span>
        </div>
      </ng-template>
      <mat-divider></mat-divider>
      <button mat-menu-item routerLink="/notifications">
        <mat-icon>list</mat-icon>
        <span>View All Notifications</span>
      </button>
    </mat-menu>

    <!-- User Menu -->
    <mat-menu #userMenu="matMenu">
      <button mat-menu-item routerLink="/profile">
        <mat-icon>person</mat-icon>
        <span>Profile</span>
      </button>
      <button mat-menu-item routerLink="/settings">
        <mat-icon>settings</mat-icon>
        <span>Settings</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="logout()">
        <mat-icon>logout</mat-icon>
        <span>Logout</span>
      </button>
    </mat-menu>
  `,
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser$: Observable<UserDto | null>;
  unreadNotificationCount = 0;
  recentNotifications: NotificationDto[] = [];
  isHandset$: Observable<boolean>;

  navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'My Requests',
      icon: 'assignment',
      route: '/requests'
    },
    {
      label: 'New Request',
      icon: 'add_circle',
      route: '/requests/new'
    },
    {
      label: 'Manager Dashboard',
      icon: 'supervisor_account',
      route: '/dashboard/manager',
      roles: ['Manager', 'Admin']
    },
    {
      label: 'HR Dashboard',
      icon: 'people',
      route: '/dashboard/hr',
      roles: ['HR', 'Admin']
    },
    {
      label: 'Reports',
      icon: 'analytics',
      route: '/dashboard/reports',
      roles: ['Manager', 'HR', 'Admin']
    },
    {
      label: 'Workflows',
      icon: 'account_tree',
      route: '/workflows',
      roles: ['Admin']
    },
    {
      label: 'User Management',
      icon: 'group',
      route: '/admin/users',
      roles: ['Admin']
    },
    {
      label: 'System Settings',
      icon: 'settings',
      route: '/admin/settings',
      roles: ['Admin']
    }
  ];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private notificationService: NotificationService,
    private signalRService: SignalRService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
  }

  ngOnInit(): void {
    this.loadNotifications();
    this.setupSignalRListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadNotifications(): void {
    this.notificationService.getNotifications({ pageNumber: 1, pageSize: 5 })
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        this.recentNotifications = response.data;
        this.unreadNotificationCount = response.data.filter(n => !n.isRead).length;
      });
  }

  private setupSignalRListeners(): void {
    this.signalRService.notification$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notification => {
        if (notification) {
          this.recentNotifications.unshift(notification);
          if (this.recentNotifications.length > 5) {
            this.recentNotifications.pop();
          }
          if (!notification.isRead) {
            this.unreadNotificationCount++;
          }
        }
      });
  }

  hasAccess(roles?: string[]): boolean {
    if (!roles || roles.length === 0) {
      return true;
    }
    return this.authService.hasAnyRole(roles);
  }

  getUserRoles(user: UserDto): string {
    return user.roles?.join(', ') || 'User';
  }

  getPageTitle(): string {
    const url = this.router.url;
    const titleMap: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/requests': 'My Requests',
      '/requests/new': 'New Request',
      '/dashboard/manager': 'Manager Dashboard',
      '/dashboard/hr': 'HR Dashboard',
      '/dashboard/reports': 'Reports',
      '/workflows': 'Workflow Management',
      '/admin/users': 'User Management',
      '/admin/settings': 'System Settings',
      '/notifications': 'Notifications'
    };
    
    return titleMap[url] || 'BPM Light';
  }

  markAsRead(notification: NotificationDto): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          notification.isRead = true;
          this.unreadNotificationCount--;
        });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.recentNotifications.forEach(n => n.isRead = true);
        this.unreadNotificationCount = 0;
      });
  }

  getNotificationIcon(type: NotificationType): string {
    const iconMap: { [key in NotificationType]: string } = {
      [NotificationType.Info]: 'info',
      [NotificationType.Success]: 'check_circle',
      [NotificationType.Warning]: 'warning',
      [NotificationType.Error]: 'error',
      [NotificationType.RequestUpdate]: 'assignment',
      [NotificationType.WorkflowUpdate]: 'account_tree'
    };
    return iconMap[type] || 'notifications';
  }

  getNotificationColor(type: NotificationType): string {
    const colorMap: { [key in NotificationType]: string } = {
      [NotificationType.Success]: 'primary',
      [NotificationType.Warning]: 'accent',
      [NotificationType.Error]: 'warn',
      [NotificationType.Info]: '',
      [NotificationType.RequestUpdate]: '',
      [NotificationType.WorkflowUpdate]: ''
    };
    return colorMap[type] || '';
  }

  formatNotificationTime(date: Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }

  logout(): void {
    this.authService.logout();
  }
}