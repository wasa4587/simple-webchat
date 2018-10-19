import { Component } from '@angular/core';
import { LocationProvider } from  '../../../../common/location';
import { UtilsHelper } from '../../../../common/core';
import { LeadsProvider } from '../../../../common/leads';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import * as fromRoot from '../../../../app/store/reducers';
import * as fromAgentLeads from '../../../../app/store/reducers/agent-leads.reducer';
import * as fromAgentLeadsAction from '../../../store/actions/agent-leads.action';
import * as moment from 'moment';

@Component({
  selector: 'follow-up-list',
  templateUrl: './follow-up-list.component.html',
  styleUrls: [
    './follow-up-list.component.scss'
  ],
  providers: [
    LocationProvider,
    LeadsProvider,
   ]
})
export class FollowUpListComponent {

  private ngUnsubscribe: Subject<any> = new Subject();
  private agentLeads$ : Observable<fromAgentLeads.AgentLeadsState>;

  public agentLeads: Array<any> = [];
  public page: any = 1;
  public perPage: number = 25;
  public totalPages: number = 1;
  public totalItems: number = 0;
  public dropdownOptions: Array<any> = [];
  public locationNameArray: any = {};
  public followUpList: Array<any> = [];
  public originalFollowUpList: Array<any> = [];
  public defaultLocation: any = {};
  public homeURL: string;
  public arrowStatus: string = 'asc';
  public columnSelected: string = 'next_followup_date';
  public loading: boolean = true;
  public notData: boolean;
  public dropdownChannels: Array<any> = [];
  public dropdownDateRange: Array<any> = [];
  public channelMultiSelectSelectedOptions: Array<any> = [];
  public channelMultiSelectSettings: any;
  public channelMultiSelectTexts: any;
  public dateRange: any;
  public displayDateRangeDiv: boolean;
  private todayDate: string;
  private fromDate: any = "";
  private toDate: any = "";
  private locationMultiSelectSelectedOptions: Array<any> = [];
  private locationMultiSelectSettings: any;
  private locationMultiSelectTexts: any;
  private dropdownLocations: Array<any> = [];
  private dateRangeArray: any = {};
  private dateFilterFlag: string = "";
  private customFilterOption: Array<any> = [];
  public customFilterList: Array<any> = [];
  public refresh: any = "";
  public selectedLocation: string = "";
  public selectedChannel: string = "";
  public searchValue: string = "";

  constructor(
    private locationProvider: LocationProvider,
    private leadsProvider: LeadsProvider,
    private store: Store<fromRoot.AppState>,
    private router: Router
  ) {
      this.agentLeads$ = this.store.select('agentLeads');
   }

  ngOnInit() {

    this.getAgentsLead();
    this.getLocations(()=>{
      this.getInfo();
    });

    this.homeURL = APP_CONFIG.homeUrl;
    this.selectedLocation = "Location".bold() + "\n" + "All Locations" + "\n";
    this.selectedChannel = "Channel".bold() + "\n" + "All Channels" + "\n";
    this.channelMultiSelectSelectedOptions = ["All Channels"]
    this.dateRange = "All Time";
    this.displayDateRangeDiv = false;
    this.todayDate = moment().format('YYYY-MM-DD');
    this.dropdownChannels = [
      {
        id:"All Channels",
        name:"All Channels"
      },
      {
        id:"Calls",
        name:"Calls"
      },
      {
        id:"Emails",
        name:"Emails"
      },
      {
        id:"SMS",
        name:"SMS"
      }
    ];
    this.dropdownDateRange = [
      {
        id:"Today",
        name:"Today"
      },
      {
        id:"Thepast7days",
        name:"The past 7 days"
      },
      {
        id:"Thepast30days",
        name:"The past 30 days"
      },
      {
        id:"AllTime",
        name:"All Time"
      }
    ];
    this.dateRangeArray = {
      Today: {
        'endDate': undefined,
        'startDate': undefined
      },
      Thepast7days: {
        'endDate': undefined,
        'startDate': undefined
      },
      Thepast30days: {
        'endDate': undefined,
        'startDate': undefined
      },
      AllTime: {
        'endDate': undefined,
        'startDate': undefined
      }
    }
    this.channelMultiSelectSettings = {
      pullRight: false,
      enableSearch: false,
      checkedStyle: 'checkboxes',
      buttonClasses: 'select',
      selectionLimit: 0,
      closeOnSelect: false,
      showCheckAll: false,
      showUncheckAll: false,
      dynamicTitleMaxItems: 3,
      maxHeight: '300px',
      itemClasses: 'item-name',
    };
    this.channelMultiSelectTexts = {
      checkAll: 'Check all',
      uncheckAll: 'Uncheck all',
      checked: 'checked',
      checkedPlural: 'Channels',
      searchPlaceholder: 'Search',
      defaultTitle: 'All Channels',
    };
    this.locationMultiSelectSettings = {
      pullRight: false,
      enableSearch: true,
      checkedStyle: 'checkboxes',
      buttonClasses: 'select',
      selectionLimit: 0,
      closeOnSelect: false,
      showCheckAll: false,
      showUncheckAll: false,
      dynamicTitleMaxItems: 3,
      maxHeight: '300px',
      itemClasses: 'item-name',
      focusBack: true
    };
    this.locationMultiSelectTexts = {
      checkAll: 'Check all',
      uncheckAll: 'Uncheck all',
      checked: 'checked',
      checkedPlural: 'Locations',
      searchPlaceholder: 'Search',
      defaultTitle: 'All Locations',
    };
    this.customFilterOption = [
      {parent_name: 'Customer Name', parent_key: 'customerName', type: 'input', validationType: 'name',  child_data: '', isVisible: false},
      {parent_name: 'Email Address', parent_key: 'customerEmail', type: 'input', validationType: 'email', child_data: '', isVisible: false},
      {parent_name: 'Lead Id', parent_key: 'leadId', type: 'number', validationType: 'number', child_data: '', isVisible: false},
      {parent_name: 'Lead Types', parent_key: 'leadType', type: 'leadtype', validationType: '', child_data: '', isVisible: false},
    ];
  }

  /**
   * Get the default location from storage
   */
  private getDefaultLocation() {
    let defaultLocation = UtilsHelper.readLocalStorage('userDefaultLocation');
    if (defaultLocation && defaultLocation['location_id']) {
      this.defaultLocation = defaultLocation['location_id'];
    }
  }

  private getAgentsLead() {
    this.agentLeads$
      .map((agentsLeadState: fromAgentLeads.AgentLeadsState) => {
        return agentsLeadState.leads;
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe((leads) => {
        this.agentLeads = leads;
      });
  }

  /**
   * @method getInfo - Get all the follow up list data needed from backend to fill the table.
   */
  public getInfo() {
    const body = {
      locationId: "0",
      listType: 'followup',
      startDate: undefined,
      endDate: undefined,
      customerEmail: undefined,
      customerName: undefined,
      leadType: undefined,
      leadId: undefined,
      search: undefined,
      page: this.page,
      perPage: this.perPage
    };
    if (!!this.searchValue && this.searchValue.trim() !== "") {
      body.search = this.searchValue.trim();
    }
    if (this.dateFilterFlag === "") {
      body.startDate = (this.fromDate === "") ? undefined : moment(this.fromDate).format("YYYY-MM-DD");
      body.endDate = (this.toDate === "") ? undefined : moment(this.toDate).format("YYYY-MM-DD");
    } else {
      body.startDate = this.dateRangeArray[this.dateFilterFlag].startDate;
      body.endDate = this.dateRangeArray[this.dateFilterFlag].endDate;
    }
    if (this.locationMultiSelectSelectedOptions.length > 0) {
      body.locationId = this.locationMultiSelectSelectedOptions.toString();
    }
    if (this.customFilterList.length > 0) {
      this.customFilterList.map((obj) => {
        body[obj.key] = obj.value;
      });
    }

    this.loading = true;
    this.followUpList = [];
    this.leadsProvider.getAll(body)
      .subscribe(
        (res) => {
          if (res.body.items) {
            this.followUpList = res.body.items.slice(0);
            this.originalFollowUpList = res.body.items.slice(0);
            this.totalPages = res.body.paging.totalPages;
            this.totalItems = res.body.paging.totalItems;
            this.loading = false;
            this.followUpList.map((lead)=> {
              lead.location = this.locationNameArray[lead.location_id];
            });
            if (this.followUpList.length === 0) {
              this.notData = true;
            } else {
              this.notData = false;
            }
          } else {
            this.followUpList = [];
          }
          this.orderColumnBy(this.arrowStatus, this.columnSelected);
        },
        (error) => {
          this.loading = false;
          this.notData = true;
          if (error) {
            console.log(error);
          }
        }
      );

  }

  /**
   * @method onPerPageChange - Handle the pagination page event change
   * @param {any} $event - The event object
   */
  public onPerPageChange($event) {
    if (this.perPage !== $event.number) {
      if ($event.number === 'all') {
        this.perPage = undefined;
        this.page = false;
      } else {
        this.page = 1;
        this.perPage = $event.number;
      }
      this.getInfo();
    }
  }
  /**
   * @method onPreviousPage - Handle the pagination page event change
   */
  public onPreviousPage() {
    const nextPage = this.page -1;
    if (nextPage > 0 ) {
      this.page = nextPage;
      this.getInfo();
    }
  }
  /**
   * @method onNextPage - Handle the pagination page event change
   */
  public onNextPage() {
    const nextPage = this.page +1;
    if (nextPage <= this.totalPages ) {
      this.page = nextPage;
      this.getInfo();
    }
  }
  /**
   * @method onPageChange - Handle the pagination page event change
   * @param {number} page - Typed page
   */
  public onPageChange(page) {
    if (page !== this.page && page > 0 && page <= this.totalPages) {
      this.page = page;
      this.getInfo();
    }
  }
  /**
   * @method getLocations - Get all the locations needed to fill the dropdown.
   */
  public getLocations(cb) {
      this.locationProvider.getAll({filterActive: true, page: false})
       .subscribe(
         (res) => {
          if (!!res.body.items) {
            this.dropdownLocations = res.body.items.map((obj) => {
              return {
                id: Number(obj.location_id),
                name: obj.location_name
              }
            });
            this.dropdownLocations.sort((a, b) => {
              if ( a.name < b.name ) {
                return -1;
              } else {
                return 1;
              }
            });
            res.body.items.map((item)=> {
              this.locationNameArray[item.location_id] = item.location_name;
            });
          }
          cb();
         }, (error) => {
           if (error) {
             console.log(error);
           }
           cb();
         }
        );
    }
    /**
  * Changes the status of the arrows used to order columns
  * @param {string} order - Can be 'asc', 'desc' or ''
  * @param {string} property - Property used to order the table
  */
  public arrowStatusChange(order, property) {
    this.columnSelected = property;
    if (this.arrowStatus === '') {
        this.arrowStatus = 'asc';
        this.orderColumnBy(this.arrowStatus, property);
    } else if (this.arrowStatus === 'asc') {
        this.arrowStatus = 'desc';
        this.orderColumnBy(this.arrowStatus, property);
    } else if (this.arrowStatus === 'desc') {
      this.arrowStatus = '';
      this.followUpList = this.originalFollowUpList.slice(0);
    }
  }
  /** Orders in ascending or descending order
  * @param {string} orderStatus - Can be 'asc' or 'desc'
  * @param {string} property - Property used to order the table
  */
  public orderColumnBy(orderStatus, property) {

    this.followUpList.sort((a, b) => {
      if (a[property] === 0) {
        a[property] = a[property].toString();
      }
      if (b[property] === 0) {
        b[property] = b[property].toString();
      }
      if (!a[property]) {
        a[property] = '';
      }
      if (!b[property]) {
        b[property] = '';
      }
      const order = a[property].toString().localeCompare(b[property].toString());
      return orderStatus === 'asc' ? order : order * -1;
    });
  }

  /**
   * Open pop up card
   * @param {any} lead - lead object
   */
  private goToLeadCard(lead : any) {
    let leadId;
    if (lead._id) {
      leadId = lead._id;
    } else if (lead.es_lead_id) {
      leadId = lead.es_lead_id;
    }
    let alreadyLoaded = this.agentLeads.find(x => x._id === leadId || x.es_lead_id === leadId);
    if (!alreadyLoaded) {
      this.store.dispatch(new fromAgentLeadsAction.LoadAgentLead(lead));
    }
    this.router.navigate(['/v2/lead-card', leadId]);
  }

  private getDropdownSelectedChannel(event) {

    if (!!event && event.length > 1 && this.channelMultiSelectSelectedOptions.indexOf("All Channels") !== -1) {
      if (this.channelMultiSelectSelectedOptions[0] === "All Channels") {
        this.channelMultiSelectSelectedOptions.splice(0, 1)
      } else {
        this.channelMultiSelectSelectedOptions = ["All Channels"];
      }
    } else if (event.length === 0) {
      this.channelMultiSelectSelectedOptions = ["All Channels"];
    }

    this.selectedChannel = "Channel".bold() + "\n";
    if (this.channelMultiSelectSelectedOptions.length > 0) {
      this.channelMultiSelectSelectedOptions.map((obj) => {
        this.selectedChannel += obj + "\n";
      });
    }
  }

  private onSelectionChange(ev: any) {
    this.dateFilterFlag = ev.key;
    if (ev.value === "") {
      if (!!this.fromDate) {
        this.dateRange = `${this.fromDate} to ${this.toDate}`;
      } else {
        this.dateRange = "";
      }
    } else {
      this.dateRange = ev.value;
    }
    switch(ev.key) {
      case 'Today':
        this.dateRangeArray[ev.key].startDate = this.todayDate;
        this.dateRangeArray[ev.key].endDate = this.todayDate;
        break;
      case 'Thepast7days':
        this.dateRangeArray[ev.key].startDate = moment().add('days',-6).format('YYYY-MM-DD');
        this.dateRangeArray[ev.key].endDate = this.todayDate;
        break;
      case 'Thepast30days':
        this.dateRangeArray[ev.key].startDate = moment().add('days',-29).format('YYYY-MM-DD');
        this.dateRangeArray[ev.key].endDate = this.todayDate;
        break;
    }
  }

  private onSelectionDateRange(ev:any) {
      if(ev.fromDate) {
        this.fromDate = moment(ev.fromDate).format("MMM DD, YYYY");
      }
      if(ev.toDate) {
        this.toDate = moment(ev.toDate).format("MMM DD, YYYY");
      }
      this.dateRange = `${this.fromDate} to ${this.toDate}`;
    }

  private getDropdownSelectedLocation(event) {
    this.selectedLocation = "Location".bold() + "\n";
    if (event.length > 0) {
      event.map((obj) => {
        let item = this.dropdownLocations.find(x => x.id === obj);
        if (!!item) {
          this.selectedLocation += item.name + "\n";
        }
      });
    } else {
      this.selectedLocation = "Location".bold() + "\n" + "All Locations" + "\n";
    }
  }

  private resetFilter() {
    this.channelMultiSelectSelectedOptions = ["All Channels"];
    this.locationMultiSelectSelectedOptions = [];
    this.customFilterList = [];
    this.dateRange = "All Time";
    this.dateFilterFlag = "AllTime";
    this.selectedLocation = "Location".bold() + "\n" + "All Locations" + "\n";
    this.selectedChannel = "Channel".bold() + "\n" + "All Channels" + "\n";
    this.fromDate = undefined;
    this.toDate = undefined;
    this.searchValue = "";
    this.refresh = Date.now();
    this.page = 1;
  }

  private filterRemoved(ev: any) {
    let index = this.customFilterList.findIndex(x => x.key === ev.key);
    this.customFilterList.splice(index, 1)
  }

  private filterSelected(ev: any) {
    let obj = {
      key: ev.key,
      value: ev.name
    };
    let index = -1;
    index = this.customFilterList.findIndex(x=>x.key === ev.key);
    if (index === -1) {
      this.customFilterList.push(obj);
    } else {
      this.customFilterList[index].value = ev.name;
    }
  }


  onFilterChange(selectedData: any) {
    let selectedArray = [];
    if (selectedData.length > 0) {
      let position;
      selectedData.map((obj) => {
        this.dropdownLocations.find((item, index) => { position = index; return item.id === obj; });
        selectedArray.push(this.dropdownLocations[position]);
        this.dropdownLocations.splice(position,1);
      });
      selectedArray.sort((a, b) => {
        if ( a.name < b.name ) {
          return -1;
        } else {
          return 1;
        }
      });
      this.dropdownLocations =  selectedArray.concat(this.dropdownLocations);
    }
  }
}
