import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
// import closeIcon from 'assets/icon/close-button.svg';
import closeIcon from '../../../../../assets/icon/close-button.svg';
import { FollowUpDelayReasonProvider } from 'common/followup-delay-reason/followup-delay-reason.provider';
import { SessionProvider } from 'common/session';
import { AngularIsEmpty } from 'angularisempty';
import { TopToastComponent } from '../../../../../common/presentational/top-toast';

@Component({
    selector: 'create-followup-delay-reasons-modal',
    templateUrl: './create-followup-delay-reasons.component.html',
    styleUrls: [
        './create-followup-delay-reasons.component.scss'
    ],
    providers: [FollowUpDelayReasonProvider, SessionProvider]
})
export class CreateFollowupDelayReasonsModalComponent {

    @Output() onClose: EventEmitter<any> = new EventEmitter();

    @Input() cssClasses: string;
    @Input() title: string;
    @Input() editRecordId: any;

    public isVisible: boolean;
    public closeIcon: string;
    public description: string;
    public user: any;
    public parent_id: any;
    public errorList: Array<any>;
    public showLoading: boolean = false;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private followUpDelayReasonProvider: FollowUpDelayReasonProvider,
        private sessionProvider: SessionProvider
    ) { }

    ngOnInit() {
        this.errorList = [];
        this.closeIcon = closeIcon;
        this.isVisible = true;
        this.cssClasses = this.cssClasses ? this.cssClasses + ' new-modal' : 'new-modal';
        this.toggleBodyScroll(this.isVisible);
        this.getUserLogged();
        if (!AngularIsEmpty.isEmpty(this.editRecordId) && this.editRecordId != 0) {
            this.getRecord(this.editRecordId);
        }
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

    /**
     * save record
     * @param ev event any
     */
    public save(ev: any) {
        const params: any = {
            body: {
                "parent_id": this.parent_id,
                "description": this.description
            }
        };
        this.showLoading = true;
        this.followUpDelayReasonProvider.create(params).subscribe((res) => {
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
                    if (!AngularIsEmpty.isEmpty(parsedError.messages) && parsedError.messages.length > 0) {
                        this.errorList = parsedError.messages.map(error => {
                            return {
                                message: error,
                                type: TopToastComponent.ERROR
                            };
                        });
                    }
                } else if ('status' in parsedError && parsedError.status === 'ERROR') {
                    if (!AngularIsEmpty.isEmpty(parsedError.messages) && parsedError.messages.length > 0) {
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
     * save record
     * @param ev event any
     */
    public update(ev: any) {
        const params: any = {
            body: {
                "parent_id": this.parent_id,
                "description": this.description
            },
            id: this.editRecordId
        };
        this.showLoading = true;
        this.followUpDelayReasonProvider.update(params).subscribe((res) => {
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
                    if (!AngularIsEmpty.isEmpty(parsedError.messages) && parsedError.messages.length > 0) {
                        this.errorList = parsedError.messages.map(error => {
                            return {
                                message: error,
                                type: TopToastComponent.ERROR
                            };
                        });
                    }
                } else if ('status' in parsedError && parsedError.status === 'ERROR') {
                    if (!AngularIsEmpty.isEmpty(parsedError.messages) && parsedError.messages.length > 0) {
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
   * Get the session for the logged user
   */
    private getUserLogged() {
        this.sessionProvider.getOne({}).subscribe((res) => {
            if (!AngularIsEmpty.isEmpty(res) && !AngularIsEmpty.isEmpty(res.body) && !AngularIsEmpty.isEmpty(res.body.user)) {
                this.user = res.body.user;
                if (!AngularIsEmpty.isEmpty(this.user.parent_id) && this.user.parent_id != 0) {
                    this.parent_id = this.user.parent_id;
                } else {
                    this.parent_id = this.user.user_id;
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

    public getRecord(id) {
        this.showLoading = true;
        this.followUpDelayReasonProvider.getOne({ id: id }).subscribe((res) => {
            this.showLoading = false;
            if (!AngularIsEmpty.isEmpty(res) && !AngularIsEmpty.isEmpty(res.body)) {
                this.description = res.body.description;
                this.parent_id = res.body.parent_id;
            }
        }, (error) => {
            this.showLoading = false;
            if (error) {
                console.log(error);
            }
        });
    }
}
