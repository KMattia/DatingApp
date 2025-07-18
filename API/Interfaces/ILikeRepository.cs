using System;
using API.Entities;

namespace API.Interfaces;

public interface ILikeRepository
{
    Task<MemberLike?> GetMemberLike(string sourceMemberId, string TargetMemberId);
    Task<IReadOnlyList<Member>> GetMemberLikes(string predicate, string memberId);
    Task<IReadOnlyList<string>> GetCurrentMemberLikeIds(string memberId);
    void DeleteLike(MemberLike like);
    void AddLike(MemberLike like);
    Task<bool> SaveAllChanges();
}
