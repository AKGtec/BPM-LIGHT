import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-recent-requests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recent-requests.component.html',
  styleUrls: ['./recent-requests.component.scss']
})
export class RecentRequestsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
