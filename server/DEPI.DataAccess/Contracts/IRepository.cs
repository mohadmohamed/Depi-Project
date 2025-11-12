using DEPI.DataAccess.Entites;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.DataAccess.Contracts
{
    public interface IRepository<T , TID> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<T?> GetByIdAsync(TID id);
        Task AddAsync(T entity);
        Task Update(T entity);
        Task Delete(TID id);
        Task<T?> DeleteAsync(TID id);
        public Task<T> FindAsync(Expression<Func<T, bool>> predicate);
        public Task<IEnumerable<Resume>> GetAllByUserIdAsync(int userId);
        public Task<T> GetLatestByUserIdAsync(int userId);
        Task<IEnumerable<InterviewSession>> GetAllByUserIdAnalysisAsync(int userid);
    }
}
