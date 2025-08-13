import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { NotificationDto } from '../models/notification.models';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: HubConnection | null = null;
  private readonly connectionStateSubject = new BehaviorSubject<boolean>(false);
  private readonly notificationSubject = new BehaviorSubject<NotificationDto | null>(null);
  private readonly requestUpdateSubject = new BehaviorSubject<string | null>(null);

  public connectionState$ = this.connectionStateSubject.asObservable();
  public notification$ = this.notificationSubject.asObservable();
  public requestUpdate$ = this.requestUpdateSubject.asObservable();

  constructor(private readonly authService: AuthService) {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.startConnection();
      } else {
        this.stopConnection();
      }
    });
  }

  private async startConnection(): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      console.warn('No token available for SignalR connection');
      return;
    }

    try {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(`${environment.signalRUrl}`, {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(environment.production ? LogLevel.Warning : LogLevel.Information)
        .build();

      this.setupEventHandlers();

      await this.hubConnection.start();
      console.log('SignalR connection established');
      this.connectionStateSubject.next(true);
      
      // Join user-specific group
      const user = this.authService.getCurrentUser();
      if (user?.id) {
        await this.hubConnection.invoke('JoinUserGroup', user.id);
      }
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      this.connectionStateSubject.next(false);
    }
  }

  private setupEventHandlers(): void {
    if (!this.hubConnection) return;

    // Handle connection events
    this.hubConnection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      this.connectionStateSubject.next(false);
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.connectionStateSubject.next(true);
      
      // Rejoin user group after reconnection
      const user = this.authService.getCurrentUser();
      if (user?.id) {
        this.hubConnection?.invoke('JoinUserGroup', user.id);
      }
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR connection closed');
      this.connectionStateSubject.next(false);
    });

    // Handle business events
    this.hubConnection.on('ReceiveNotification', (notification: NotificationDto) => {
      console.log('Received notification:', notification);
      this.notificationSubject.next(notification);
    });

    this.hubConnection.on('RequestStatusChanged', (requestId: string) => {
      console.log('Request status changed:', requestId);
      this.requestUpdateSubject.next(requestId);
    });

    this.hubConnection.on('WorkflowUpdated', (workflowId: string) => {
      console.log('Workflow updated:', workflowId);
      // Emit workflow update event if needed
    });

    this.hubConnection.on('UserAssigned', (requestId: string, userId: string) => {
      console.log('User assigned to request:', requestId, userId);
      const currentUser = this.authService.getCurrentUser();
      if (currentUser?.id === userId) {
        this.requestUpdateSubject.next(requestId);
      }
    });
  }

  private async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
        console.log('SignalR connection stopped');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      } finally {
        this.hubConnection = null;
        this.connectionStateSubject.next(false);
      }
    }
  }

  // Public methods for sending messages
  async sendNotificationToUser(userId: string, message: string): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      try {
        await this.hubConnection.invoke('SendNotificationToUser', userId, message);
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  }

  async sendNotificationToRole(role: string, message: string): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      try {
        await this.hubConnection.invoke('SendNotificationToRole', role, message);
      } catch (error) {
        console.error('Error sending notification to role:', error);
      }
    }
  }

  async notifyRequestStatusChange(requestId: string): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      try {
        await this.hubConnection.invoke('NotifyRequestStatusChange', requestId);
      } catch (error) {
        console.error('Error notifying request status change:', error);
      }
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.hubConnection?.state === 'Connected';
  }

  getConnectionState(): string {
    return this.hubConnection?.state || 'Disconnected';
  }

  // Clean up on service destruction
  ngOnDestroy(): void {
    this.stopConnection();
  }
}