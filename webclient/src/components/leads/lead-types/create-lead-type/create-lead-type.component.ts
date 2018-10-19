import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import closeIcon from '../../../../../assets/icon/close-button.svg';
import { WorkflowProvider } from 'common/workflow';
import { LeadTypeProvider } from 'common/leadtype';
import { TopToastComponent } from '../../../../../common/presentational/top-toast';
import { UtilsHelper } from '../../../../../common/core';
import { AngularIsEmpty } from 'angularisempty';
import * as _ from "lodash";
@Component({
    selector: 'create-lead-type-modal',
    templateUrl: './create-lead-type.component.html',
    styleUrls: [
        './create-lead-type.component.scss'
    ],
    providers: [WorkflowProvider, LeadTypeProvider]
})
export class CreateLeadTypeModalComponent {

    @Output() onClose: EventEmitter<any> = new EventEmitter();

    @Input() cssClasses: string;
    @Input() title: string;
    @Input() parent_id: number;
    @Input() editRecordId: any;

    public isVisible: boolean;
    public closeIcon: string;
    public lable: string;
    public followupRuleArr: any = [];
    public apiTypeArr: any = [];
    public transmissionTypeArr: any = [];
    public transmission_type: any;
    public api_type: any;
    public showLoading: boolean = false;
    public followupRuleIdError: boolean = false;
    public leadTypeError: boolean = false;
    public followup_rule_id: any;
    public errorList: Array<any>;
    public is_default: boolean;
    public editObj: any;
    public isDefaultFlag: boolean = false;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private workflowProvider: WorkflowProvider,
        private leadtypeProvider: LeadTypeProvider
    ) { }

    ngOnInit() {
        this.errorList = [];
        this.editObj = {};
        this.closeIcon = closeIcon;
        this.isVisible = true;
        this.cssClasses = this.cssClasses ? this.cssClasses + ' new-modal' : 'new-modal';
        this.toggleBodyScroll(this.isVisible);
        this.transmissionTypeArr = _.values(UtilsHelper.transmitTypeArray(1));
        this.apiTypeArr = _.values(UtilsHelper.apiTypeArray());
        this.transmission_type = 1;
        this.api_type = 1;
        this.followup_rule_id = '';
        this.getWorkFlowRule();
    }

    public onCloseHandler(ev: any): void {
        this.isVisible = false;
        this.toggleBodyScroll(this.isVisible);
        this.onClose.emit(ev);
    }

    /* Helper functions */
    private toggleBodyScroll(isModalVisible: boolean): void {
        let body: any = this.document.querySelectorAll('body');

        if (body.length > 0) {
            body = body[0];
        } else {
            return;
        }

        if (isModalVisible) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    }

    public changeLeadType(ev: any) {
        this.leadTypeError = (!ev) ? true : false;
    }

    public folloupRuleChange(ev: any) {
        this.followupRuleIdError = this.followup_rule_id === '' ? true : false;
    }

    /**
     * update record
     * @param ev event any
     */
    public save(ev: any) {
        if (!this.lable) {
            this.leadTypeError = true;
            return;
        }
        if (this.followup_rule_id === '') {
            this.followupRuleIdError = true;
            return;
        }
        const params: any = {
            body: {
                "user_id": this.parent_id,
                "lable": this.lable,
                "api_type": this.api_type,
                "transmission_type": this.transmission_type,
                "followup_rule_id": this.followup_rule_id,
                "is_default": (this.is_default === true) ? 1 : 0,
                "is_active": 1
            }
        };
        this.showLoading = true;
        this.leadtypeProvider.create(params).subscribe((res) => {
            this.showLoading = false;
            this.errorList = [{
                message: "Record created successfully.",
                type: TopToastComponent.SUCCESS
            }];
            this.onCloseHandler('save');
        }, (err) => {
            this.showLoading = false;
            if (err && '_body' in err) {
                const parsedError = JSON.parse(err._body);
                if ('messages' in parsedError) {
                    if (!!parsedError.messages && parsedError.messages.length > 0) {
                        this.errorList = parsedError.messages.map(error => {
                            return {
                                message: error,
                                type: TopToastComponent.ERROR
                            };
                        });
                    }
                } else if ('status' in parsedError && parsedError.status === 'ERROR') {
                    if (!!parsedError.messages && parsedError.messages.length > 0) {
                        this.errorList = parsedError.messages.map(error => {
                            return {
                                message: error,
                                type: TopToastComponent.ERROR
                            };
                        });
                    }
                }
            }
        });
    }

    /**
     * update record
     * @param ev event any
     */
    public update(ev: any) {
        if (!this.lable) {
            this.leadTypeError = true;
            return;
        }
        if (this.followup_rule_id === '') {
            this.followupRuleIdError = true;
            return;
        }
        this.editObj.lable = this.lable;
        this.editObj.api_type = this.api_type;
        this.editObj.transmission_type = this.transmission_type;
        this.editObj.followup_rule_id = this.followup_rule_id;
        this.editObj.is_default = (this.is_default === true) ? 1 : 0;
        const params: any = {
            body: this.editObj,
            id: this.editRecordId
        };
        this.showLoading = true;
        this.leadtypeProvider.update(params).subscribe((res) => {
            this.showLoading = false;
            this.errorList = [{
                message: "Record update successfully.",
                type: TopToastComponent.SUCCESS
            }];
            this.onCloseHandler('update');
        }, (err) => {
            this.showLoading = false;
            if (err && '_body' in err) {
                const parsedError = JSON.parse(err._body);
                if ('messages' in parsedError) {
                    if (!!parsedError.messages && parsedError.messages.length > 0) {
                        this.errorList = parsedError.messages.map(error => {
                            return {
                                message: error,
                                type: TopToastComponent.ERROR
                            };
                        });
                    }
                } else if ('status' in parsedError && parsedError.status === 'ERROR') {
                    if (!parsedError.messages && parsedError.messages.length > 0) {
                        this.errorList = parsedError.messages.map(error => {
                            return {
                                message: error,
                                type: TopToastComponent.ERROR
                            };
                        });
                    }
                }
            }
        });
    }


    /**
     * get edit records details
     * @param id number
     */
    public getRecord(id) {
        this.showLoading = true;
        this.leadtypeProvider.getOne({ id: id }).subscribe((res) => {
            this.showLoading = false;
            if (!!res && !!res.body) {
                this.editObj = res.body;
                this.lable = res.body.lable;
                this.api_type = res.body.api_type;
                this.transmission_type = res.body.transmission_type;
                this.followup_rule_id = (!!res.body.followup_rule_id) ? Number(res.body.followup_rule_id):'';
                this.is_default = (res.body.is_default === 1) ? true : false;
                this.onSoftwareChange();
                if (this.is_default===true || res.body.is_active===0) {
                    this.isDefaultFlag =true;
                }
            }
        }, (error) => {
            this.showLoading = false;
            if (error) {
                console.log(error);
            }
        });
    }

    /**
     * get work flow rule list
     */
    public getWorkFlowRule() {
        this.showLoading = true;
        this.workflowProvider.getAll({ type: 'followup', page: false, filter: 1 }).subscribe((res) => {
            this.showLoading = false;
            if (!!res && !!res.body && !!res.body.items) {
                this.followupRuleArr = res.body.items;
            }
            if (!!this.editRecordId && this.editRecordId != 0) {
                this.getRecord(this.editRecordId);
            }
        }, (error) => {
            this.showLoading = false;
            if (error) {
                console.log(error);
            }
        });
    }

    /**
     * On change management software haldel transmission type
     */
    public onSoftwareChange() {
        this.transmissionTypeArr = _.values(UtilsHelper.transmitTypeArray(this.api_type));
    }

    public toastIsHidden(ev) {
        if (ev.length > 0) {
            this.errorList = [];
        }
    }
}
