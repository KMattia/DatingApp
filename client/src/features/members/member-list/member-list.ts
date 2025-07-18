import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MemberService } from '../../../core/service/member-service';
import { Member, MemberParams } from '../../../types/member';
import { MemberCard } from "../member-card/member-card";
import { PaginatedResult } from '../../../types/pagination';
import { Paginator } from "../../../shared/paginator/paginator";
import { FilterModal } from '../filter-modal/filter-modal';

@Component({
    selector: 'app-member-list',
    imports: [MemberCard, Paginator, FilterModal],
    templateUrl: './member-list.html',
    styleUrl: './member-list.css'
})
export class MemberList implements OnInit {
    @ViewChild('filterModal') modal!: FilterModal;
    private memberService = inject(MemberService);
    protected paginatedMembers = signal<PaginatedResult<Member> | null>(null);
    MemberParams = new MemberParams();
    private updatedParams = new MemberParams();

    constructor(){
        const filters = localStorage.getItem('filters');
        if(filters){
            this.MemberParams = JSON.parse(filters);
            this.updatedParams = JSON.parse(filters);
        }
    }

    ngOnInit(): void {
        this.loadMembers();
    }

    loadMembers() {
        this.memberService.getMembers(this.MemberParams).subscribe({
            next: result => {
                this.paginatedMembers.set(result)
            }
        });
    }

    onPageChange(event:{pageNumber: number, pageSize: number}){
        this.MemberParams.pageSize = event.pageSize;
        this.MemberParams.pageNumber = event.pageNumber;
        this.loadMembers();
    }

    openModal(){
        this.modal.open();
    }

    onClose(){
        console.log('Modal closed')
    }

    onFilterChange(data: MemberParams){
        this.MemberParams = {...data};
        this.updatedParams = {...data};
        this.loadMembers();
    }

    resetFilter(){
        this.MemberParams = new MemberParams();
        this.updatedParams = new MemberParams();
        this.loadMembers();
    }


    get displayMessage(): string{
        const defaultParams = new MemberParams();

        const filters: string[] = [];

        if(this.updatedParams.gender){
            filters.push(this.updatedParams.gender + 's');
        }else {
            filters.push('Males, Females')
        }

        if(this.updatedParams.minAge !== defaultParams.minAge 
            || this.updatedParams.maxAge !== defaultParams.maxAge){
                filters.push(` ages ${this.updatedParams.minAge}-${this.updatedParams.maxAge}`)
            }

            filters.push(this.updatedParams.orderBy === 'lastActive' ? 'Recently active' : 'Newest')

            return filters.length > 0 ? `Selected ${filters.join('  | ')}` : 'All members'
    }
}
