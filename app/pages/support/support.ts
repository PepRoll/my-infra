import {ViewChild, Component} from '@angular/core';
import {ModalController, Nav} from 'ionic-angular';
import {SupportService} from './support.service';
import {TicketComponent} from '../../components/ticket/ticket';
import {AnalyticsService} from '../../services/analytics/analytics.service';
import {ToastService} from '../../services/toast/toast.service';
import {TicketCreateModal} from '../../modals/ticket-create/ticket-create';

@Component({
  templateUrl: 'build/pages/support/support.html',
  providers: [SupportService],
  directives: [TicketComponent]
})
export class SupportPage {
  @ViewChild(Nav) nav: Nav;
  infos: any;
  error: any;
  loading: boolean = false;
  reload: boolean = false;
  pageNumber: number = 0;
  ticketIds: Array<number> = [];
  ticketIdsFiltered: Array<number> = [];
  ticketsLoaded: number = 0;
  constructor(private supportService: SupportService, private toast: ToastService, private analytics: AnalyticsService, private modalCtrl: ModalController) {
    this.getTickets();
    this.analytics.trackView('Support');
  }

  getTickets() {
    this.loading = true;
    return this.supportService.getTickets()
      .then((ticketsId) => {
        this.ticketIds = ticketsId;
        this.refreshTicketsList();
        this.loading = false;
      }, (err) => {
        this.error = err;
        this.toast.error('Erreur de chargement: ' + (err.message ? err.message : JSON.stringify(err))).present();
        this.loading = false;
      });
  }

  refreshTicketsList(): void {
    let newTicketIds = this.supportService.getNextIds(this.ticketIds, this.pageNumber, 20);

    this.ticketIdsFiltered = this.ticketIdsFiltered.concat(newTicketIds);
    this.pageNumber++;
  }

  loadMore(infiniteScroll): void {
    setTimeout(() => {
      this.refreshTicketsList();
      infiniteScroll.complete();
      if (this.ticketIdsFiltered.length >= this.ticketIds.length) {
        infiniteScroll.enable(false);
      }
    }, 500);
  }

  ticketLoaded(state: boolean): void {
    if (state) {
      this.ticketsLoaded++;
    }

    this.loading = this.ticketsLoaded !== this.ticketIdsFiltered.length;
  }

  doRefresh(refresher): void {
    this.ticketsLoaded = 0;
    this.ticketIds = [];
    this.pageNumber = 0;
    this.ticketIdsFiltered = [];

    this.getTickets();
    setTimeout(() => {
      refresher.complete();
    }, 300);
  }

  createTicket(): void {
    let addModal = this.modalCtrl.create(TicketCreateModal);
    addModal.onDidDismiss(() => {
      this.reload = true;
      this.getTickets()
        .then(() => this.reload = false)
        .catch(() => this.reload = false);
    });
    addModal.present();
  }

}
