import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { ItemReparto } from '../../../../interfaces/item-reparto';

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrl: './card-item.component.scss',
  imports: [MatIconModule, DecimalPipe],
})
export class CardItemComponent {
  @Input() item: ItemReparto | undefined;
  @Input() index: number = 0;
}
