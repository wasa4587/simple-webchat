import { Component, OnInit } from '@angular/core';
import { ConnectionWizardLayoutComponent } from './layout';
import { Router } from '@angular/router';
import { LeadsProvider } from 'common/leads';
import { LocationProvider } from  'common/location';
import { UtilsHelper } from 'common/core/utils.helper';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import * as fromRoot from 'app/store/reducers';
import * as fromAgentLeads from 'app/store/reducers/agent-leads.reducer';
import * as fromAgentLeadsAction from 'app/store/actions/agent-leads.action';
import * as moment from 'moment';
import { UserProvider } from 'common/user';

const DefaultPhone = {
  phone_number: ''
};
@Component({
  selector: 'leads-all',
  templateUrl: './leads-all.component.html',
  styleUrls: [
    './leads-all.component.scss'
  ],
  providers: [
    LeadsProvider,
    LocationProvider
  ]
})
export class LeadsAllComponent implements OnInit {

  private ngUnsubscribe: Subject<any> = new Subject();
  private agentLeads$ : Observable<fromAgentLeads.AgentLeadsState>;

  public page: any = 1;
  public perPage: number = 25;
  public totalPages: number = 1;
  public totalItems: number = 0;
  public agentLeads: Array<any> = [];
  public leads: Array<any>;
  public leadsBackup:Array<any>;
  public locations: Array <any>;
  public locationsHashTable: Array <any>;
  private selectedLocation : string;
  private isFiltersContainerDisplayed: boolean = false;
  private leadId : string;
  private customerPhone : string;
  private customerName : string;
  private includeInactive : boolean;
  public homeURL: string = APP_CONFIG.homeUrl;
  private unit: string;
  private orderedBy: string = 'CONTACT_DATE';
  private arrowStatus: string = 'asc';
  public loading: boolean = true;
  public notData: boolean;

  public leadStatus: any;
  public dropdownDateRange: Array<any> = [];
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
  public dropdownEmployee: Array<any> = [];
  public searchValue: any = "";

  constructor(
    private leadsProvider: LeadsProvider,
    private locationProvider: LocationProvider,
    private router: Router,
    private userProvider: UserProvider,
    private store: Store<fromRoot.AppState>,
  ) {
    this.agentLeads$ = this.store.select('agentLeads');
  }
  ngOnInit() {
    this.selectedLocation = "";
    this.locations = [];
    this.locationsHashTable = [];
    this.leadId = "";
    this.customerPhone = "";
    this.customerName = "";
    this.unit = "";
    this.includeInactive = false;
    this.setDefaultLocation();
    this.getEmployeesList();
    this.getAgentsLead();

    this.getLocations()
      .then(()=>this.getData());


    this.leadStatus = "active";
    this.selectedLocation = "Location".bold() + "\n" + "All Locations" + "\n";
    this.dateRange = "All Time";
    this.displayDateRangeDiv = false;
    this.todayDate = moment().format('YYYY-MM-DD');
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
      {parent_name: 'Phone Number', parent_key: 'customerPhone', type: 'number', validationType: 'number', child_data: '', isVisible: false},
      {parent_name: 'Employee Name', parent_key: 'employeeId', type: 'employeelist', validationType: '', child_data: '', isVisible: false},
      {parent_name: 'Lead Id', parent_key: 'leadId', type: 'number', validationType: 'number', child_data: '', isVisible: false},
      {parent_name: 'Lead Types', parent_key: 'leadType', type: 'leadtype', validationType: '', child_data: '', isVisible: false},
    ];
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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

  /** Set the order arrow
   * @param {string} orderedBy - Column name
   * @param {string} property - Property used to order the table
   */
  private setOrderedBy(orderedBy: string, property: string) {
    if ( this.orderedBy !== orderedBy ) {
      this.orderedBy = orderedBy;
      this.arrowStatus = 'asc';
    } else {
      if ( this.arrowStatus === 'asc' ) {
        this.arrowStatus = 'desc';
      } else {
        if ( this.arrowStatus === 'desc' ) {
          this.arrowStatus = '';
        } else {
          this.arrowStatus = 'asc';
        }
      }
    }
    this.orderColumnBy(this.arrowStatus, property);
  }
  /** Orders in ascending or descending order
   * @param {string} orderStatus - Can be 'asc' or 'desc'
   * @param {string} property - Property used to order the table
   */
  public orderColumnBy(orderStatus, property) {
    property = property.toLowerCase();
    if(orderStatus === '') {
      this.leads = this.leadsBackup.slice(0);
    } else {
      this.leads.sort((a, b) => {
        if (a[property] !== undefined && b[property] !== undefined && a[property] !== null && b[property] !== null) {
          const order = a[property].toString().localeCompare(b[property].toString());
          return orderStatus === 'asc' ? order : order * -1;
        }
      });
    }
  }
  /**
   * Sets the given location filter
   *
   * @param {any} location - Object with the new location filter value
   * @return {void}
   */
  public setLocation(location: any): void {
    this.selectedLocation = location;
    return;
  }

  /**
   * Get the default location from storage
   */
  public setDefaultLocation() {
    let defaultLocation = UtilsHelper.readLocalStorage('userDefaultLocation');
    if (defaultLocation && defaultLocation['location_id']) {
      this.selectedLocation = defaultLocation['location_id'];
    }
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
      this.getData();
    }
  }
  /**
   * @method onPreviousPage - Handle the pagination page event change
   */
  public onPreviousPage() {
    const nextPage = this.page -1;
    if (nextPage > 0 ) {
      this.page = nextPage;
      this.getData();
    }
  }
  /**
   * @method onNextPage - Handle the pagination page event change
   */
  public onNextPage() {
    const nextPage = this.page +1;
    if (nextPage <= this.totalPages ) {
      this.page = nextPage;
      this.getData();
    }
  }
  /**
   * @method onPageChange - Handle the pagination page event change
   * @param {number} page - Typed page
   */
  public onPageChange(page) {
    if (page !== this.page && page > 0 && page <= this.totalPages) {
      this.page = page;
      this.getData();
    }
  }
  /**
   * @method getLocations - Promise wrapper for getLocationsRecursive
   */
  public getLocations(): any {
    return new Promise((resolve)=> {
      this.getLocationsRecursive(1, resolve);
    });
  }
  /**
   * @method getLocationsRecursive - Get all locations
   * @param {number} page - the page to request
   * @param {Function} cb - callback function
   */
  public getLocationsRecursive(page = 1, cb: Function): any {
    this.locationProvider.getAll({filterActive: true, page})
      .subscribe(
        (res) => {
          let auxList = [];
          auxList = this.locations;
          this.locations = auxList.concat(res.body.items);
          res.body.items.forEach(loc => {
            this.locationsHashTable[loc.location_id] = loc.location_name;
          });
          const nextPage = res.body.paging.nextPage;
          if (nextPage > page) {
            this.getLocationsRecursive(nextPage, cb);
          } else {
            this.dropdownLocations = this.locations.map((obj) => {
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
            cb();
          }
        },
        (error) => {
          cb();
          if (error) {
            console.log(error);
          }
        }
      );
  }

  /**
   * @method getData - Get leads from backend
   */
  public getData() {
    this.leads = [];
    const body = {
      locationId: "0",
      leadId: undefined,
      customerName: undefined,
      customerPhone: undefined,
      startDate: undefined,
      endDate: undefined,
      customerEmail: undefined,
      leadType: undefined,
      search: undefined,
      page: this.page,
      perPage: this.perPage,
      listType:'all',
      // unit: this.unit,
      filterActive: undefined,
      leadStatus: this.leadStatus
    };
    //TODO: pendding decision
    // if (this.includeInactive === false) {
    //   body.filterActive = !this.includeInactive;
    // }
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
    this.leadsProvider.getAll(body)
      .subscribe(
        (res) => {
          this.totalPages = res.body.paging.totalPages;
          this.totalItems = res.body.paging.totalItems;
          this.leads = res.body.items.map((lead)=> {
            lead.location = this.locationsHashTable[lead.location_id];
            return lead;
          });
          this.leadsBackup = res.body.items;
          this.loading = false;
          if (this.leadsBackup.length === 0) {
            this.notData = true;
          } else {
            this.notData = false;
          }
          this.orderColumnBy(this.arrowStatus, this.orderedBy);
        },
        (error) => {
          this.notData = true;
          this.loading = false;
          if (error) {
            console.log(error);
          }
        }
      );
  }

  /**
   *  Toggle Filters Container
   *
   *  @param {any} ev - The event object from the DOM event.
   *  @return {void}
   */
  private toggleFiltersContainer(ev?: any): void {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }
    this.isFiltersContainerDisplayed = !this.isFiltersContainerDisplayed;
  }

  /**
   *  Apply selected filters and hide the filters sidebar
   *
   *  @param {any} ev -
   *  @return {void}
   */
  private applyFilters(ev: any): void {
    this.getData();
    this.toggleFiltersContainer();
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


  private onLeadStatusChange(event) {
    this.leadStatus = event.key;
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
    if (ev.fromDate) {
      this.fromDate = moment(ev.fromDate).format("MMM DD, YYYY");
    }
    if (ev.toDate) {
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
    this.leadStatus = "active";
    this.locationMultiSelectSelectedOptions = [];
    this.customFilterList = [];
    this.dateRange = "All Time";
    this.dateFilterFlag = "AllTime";
    this.selectedLocation = "Location".bold() + "\n" + "All Locations" + "\n";
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
  /**
  * @method getEmployeesRecursive - Get all employees
  * @param {number} page - the page to request
  * @param {Function} cb - callback function
  */
  public getEmployeesList(): void {
    this.userProvider.getAll({page: false, filterActive: true, listType: 'shortlist'})
    .subscribe((res) => {
      if (!!res.body && !!res.body.items && res.body.items.length > 0) {
        this.dropdownEmployee = res.body.items.map((obj) => {
          return {
            id: Number(obj.user_id),
            name: `${obj.firstname} ${obj.lastname}`
          }
        });
        this.dropdownEmployee.sort((a, b) => {
          if ( a.name < b.name ) {
            return -1;
          } else {
            return 1;
          }
        });
      }
    },(error) => {
        if (error) {
          console.log(error);
        }
    });
  }
}
