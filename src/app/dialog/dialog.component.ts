import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [],
  template: `
    <div class="dialog-backdrop" (click)="close()"></div>
    <div class="dialog-content">
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }

}
