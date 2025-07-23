import { Component, computed, inject, input } from '@angular/core';
import { Member } from '../../../types/member';
import { RouterLink } from '@angular/router';
import { AgePipe } from '../../../core/pipe/age-pipe';
import { LikesService } from '../../../core/service/likes-service';
import { PresenceService } from '../../../core/service/presence-service';

@Component({
  selector: 'app-member-card',
  imports: [RouterLink, AgePipe],
  templateUrl: './member-card.html',
  styleUrl: './member-card.css'
})
export class MemberCard {
    private likeService = inject(LikesService);
    private presenceService = inject(PresenceService);
    member = input.required<Member>();
    protected hasLiked = computed(() => this.likeService.likesIds().includes(this.member().id));
    protected isOnline = computed(() => this.presenceService.onlineUsers().includes(this.member().id));

    toggleLike(event: Event){
        event.stopPropagation();
        this.likeService.toggleLike(this.member().id).subscribe({
            next: () =>{
                if(this.hasLiked()){
                    this.likeService.likesIds.update(ids => ids.filter(x => x !== this.member().id))
                }
                else{
                    this.likeService.likesIds.update(ids => [...ids, this.member().id])
                }
            }
        })
    }
}
