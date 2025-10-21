using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.DataAccess.Contracts
{
    internal interface IRepository<T , TID> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<T?> GetByIdAsync(TID id);
        Task AddAsync(T entity);
        Task Update(T entity);
        Task Delete(TID id);
        Task<T?> DeleteAsync(TID id);
    }
}
