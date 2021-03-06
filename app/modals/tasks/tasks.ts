import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { TaskDetailsComponent } from '../../components/task-details/task-details';
import { AnalyticsService } from '../../services/analytics/analytics.service';

@Component({
  templateUrl: 'build/modals/tasks/tasks.html',
  providers: [],
  directives: [TaskDetailsComponent]
})
export class TasksModal {
  tasks: Array<number> = [];
  serviceName: string;
  service: any;
  loading: boolean = true;
  error: any;

  constructor(private navParams: NavParams, private viewCtrl: ViewController, public analytics: AnalyticsService) {
    this.serviceName = this.navParams.get('serviceName');
    this.service = this.navParams.get('service');
    this.getTasks();
    this.analytics.trackView('tasks');
  }

  getTasks() {
    this.loading = true;
    this.service.getTasks(this.serviceName)
      .subscribe((ids) => {
        this.tasks = ids;
        this.loading = false;
      },
      null,
      () => this.loading = false
    );
  }

  close(): void {
    this.viewCtrl.dismiss({});
  }

  doRefresh(refresher): void {
    this.getTasks();
    setTimeout(() => {
      refresher.complete();
    }, 300);
  }
}
