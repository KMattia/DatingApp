import { Component, inject, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/service/member-service';
import { ActivatedRoute } from '@angular/router';
import { Member, Photo } from '../../../types/member';
import { ImageUpload } from "../../../shared/image-upload/image-upload";
import { AccountService } from '../../../core/service/account-service';
import { User } from '../../../types/user';
import { StarButton } from "../../../shared/star-button/star-button";
import { DeleteButton } from "../../../shared/delete-button/delete-button";

@Component({
    selector: 'app-member-photo',
    imports: [ImageUpload, StarButton, DeleteButton],
    templateUrl: './member-photo.html',
    styleUrl: './member-photo.css'
})
export class MemberPhoto implements OnInit {
    protected memberPhoto = inject(MemberPhoto);
    protected accountService = inject(AccountService);
    protected memberService = inject(MemberService);
    private route = inject(ActivatedRoute);
    protected photos = signal<Photo[]>([]);
    protected loading = signal(false);

    ngOnInit(): void {
        const memberId = this.route.parent?.snapshot.paramMap.get('id');
        if (memberId) {
            this.memberService.getMemberPhotos(memberId).subscribe({
                next: photos => this.photos?.set(photos)
            })
        }
    }

    onUploadImage(file: File){
        this.loading.set(true);
        this.memberService.uploadPhoto(file).subscribe({
            next: photo => {
                this.memberService.editMode.set(false);
                this.loading.set(false);
                this.photos.update(photos => [...photos, photo])
            },
            error: error => {
                console.log('Error uploading image', error);
                this.loading.set(false);
            }
        })
    }

    setMainPhoto(photo: Photo){
        this.memberService.setMainPhoto(photo).subscribe({
                next: () => {
                    const currentUser = this.accountService.currentUser();
                    if(currentUser) currentUser.imageUrl = photo.url;
                    this.accountService.setCurrentUser(currentUser as User);
                    this.memberService.member.update(member => ({
                        ...member,
                        imageUrl: photo.url
                    }) as Member)
                }
            }
        )
    }

    deletePhoto(photoId: number){
        this.memberService.deletePhoto(photoId).subscribe({
            next: () => {
                this.photos.update(photos => photos.filter(x => x.id !== photoId))
            }
        })
    }
}
