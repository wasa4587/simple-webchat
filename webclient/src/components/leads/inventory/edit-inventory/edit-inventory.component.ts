import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { TopToastComponent } from '../../../../../common/presentational/top-toast';
import { AngularIsEmpty } from 'angularisempty';
import { LeadInventoryProvider } from 'common/lead-inventory/lead-inventory.provider';
import { ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { SessionProvider } from 'common/session';

enum LeadCardViewStates {
    TYPES,
    DETAILS,
    SPECIALS
}

@Component({
    selector: 'edit-inventory-modal',
    templateUrl: './edit-inventory.component.html',
    styleUrls: [
        './edit-inventory.component.scss'
    ],
    providers: [LeadInventoryProvider, SessionProvider]
})
export class EditInventoryComponent {

    public isVisible: boolean;
    public closeIcon: string;
    public errorList: Array<any>;
    public showLoading: boolean = false;
    public location_id: any;
    public parent_id: any;
    public leadCardViewStates = LeadCardViewStates;
    public view: LeadCardViewStates;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private leadInventoryProvider: LeadInventoryProvider,
        private activatedRoute: ActivatedRoute,
        private cp: FormBuilder,
        private sessionProvider: SessionProvider
    ) { }

    ngOnInit() {
        this.errorList = [];
        this.activatedRoute.params.forEach((params: Params) => {
            this.location_id = params['location_id'];
        });
        this.showLoading = true;
        this.view = this.leadCardViewStates.TYPES;
        this.getUserLogged();
    }

    public selectTab(view: any) {
        this.view = view;
        this.showLoading = true;
    }

    public changeTab(event) {
        if (event === 'details') {
            this.view = this.leadCardViewStates.DETAILS;
        } else if (event === 'specials') {
            this.view = this.leadCardViewStates.SPECIALS;
        } else if (event === 'type') {
            this.view = this.leadCardViewStates.TYPES;
        }
    }

    public onHandelLoading(ev) {
        this.showLoading = ev.status;
        if (!AngularIsEmpty.isEmpty(ev.error)) {
            this.errorList = [{
                message: ev.error,
                type: TopToastComponent.ERROR
            }];
        }
        if (!AngularIsEmpty.isEmpty(ev.success)) {
            this.errorList = [{
                message: ev.success,
                type: TopToastComponent.SUCCESS
            }];
        }
    }

    /**
   * Get the session for the logged user
   */
    private getUserLogged() {
        this.sessionProvider.getOne({}).subscribe((res) => {
            if (!AngularIsEmpty.isEmpty(res) && !AngularIsEmpty.isEmpty(res.body) && !AngularIsEmpty.isEmpty(res.body.user)) {
                if (!AngularIsEmpty.isEmpty(res.body.user.parent_id) && res.body.user.parent_id != 0) {
                    this.parent_id = res.body.user.parent_id;
                } else {
                    this.parent_id = res.body.user.user_id;
                }
            }
        }, (error) => {
            if (error) {
                console.log(error);
            }
        });
    }

    public toastIsHidden(ev) {
        if (ev.length > 0) {
            this.errorList = [];
        }
    }
}
