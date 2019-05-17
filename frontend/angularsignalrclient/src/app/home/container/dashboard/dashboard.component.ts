import { Component, OnInit } from '@angular/core';
import { FoodDataService } from '@app/core/services/food-data.service';
import { SignalRService } from '@app/core/services/signalR.service';
import { FoodItem } from '@app/models/foodItem.model';
import { Observable, forkJoin } from 'rxjs';
import { ChatMessage } from '@app/models/chatMessage.model';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  cpuValue$: Observable<number>;
  signalrConnectionEstablished$: Observable<boolean>;
  foodItems$: Observable<FoodItem[]>;
  chatmessages = [];

  constructor(
    private readonly signalRService: SignalRService,
    private foodDataService: FoodDataService
  ) {}

  ngOnInit() {
    this.cpuValue$ = this.signalRService.newCpuValue$;
    this.signalrConnectionEstablished$ = this.signalRService.connectionEstablished$;
    this.signalRService.foodchanged$.subscribe(() => this.getFoodData());

    this.signalRService.messageReceived$
      .pipe(tap(console.log))
      .subscribe(message => {
        this.chatmessages = [...this.chatmessages, message];
      });

    this.getFoodData();
  }

  saveFood(item: FoodItem) {
    if (item.id) {
      this.foodDataService.updateFood(item).subscribe(() => this.getFoodData());
    } else {
      this.foodDataService
        .addFood(item.itemName)
        .subscribe(() => this.getFoodData());
    }
  }

  deleteFood(item: FoodItem) {
    if (!confirm('Really delete?')) {
      return;
    }

    this.foodDataService
      .deleteFood(item.id)
      .subscribe(() => this.getFoodData());
  }

  sendChat(message: ChatMessage) {
    this.signalRService.sendChatMessage(message);
  }

  private getFoodData() {
    this.foodItems$ = this.foodDataService.getAllFood();
  }
}
