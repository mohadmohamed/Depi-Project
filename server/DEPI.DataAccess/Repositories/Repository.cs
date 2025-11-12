using DEPI.DataAccess.Contracts;
using DEPI.DataAccess.DataContext;
using DEPI.DataAccess.Entites;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.DataAccess.Repositories
{
    internal class Repository<TEntity, TID> : IRepository<TEntity, TID> where TEntity : class
    {
        private readonly AppDbContext _context;
        private readonly DbSet<TEntity> _Dbset;

        public Repository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _Dbset = _context.Set<TEntity>();
        }

        public async Task AddAsync(TEntity entity)
        {
            await _Dbset.AddAsync(entity);
        }

        public async Task Delete(TID id)
        {
            TEntity? entity = await _Dbset.FindAsync(id);
            if (entity != null)
            {
                _Dbset.Remove(entity);
            }
        }

        public async Task<TEntity?> DeleteAsync(TID id)
        {
            TEntity? entity = await _Dbset.FindAsync(id);
            if (entity == null)
            {
                return null;
            }

            _Dbset.Remove(entity);
            return entity;
        }

        public async Task<TEntity?> FindAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return await _Dbset.FirstOrDefaultAsync(predicate);
        }

        public async Task<IEnumerable<TEntity>> GetAllAsync()
        {
            return await _Dbset.ToListAsync();
        }
        public async Task<IEnumerable<Resume>> GetAllByUserIdAsync(int userId)
        {
            return await _context.Resumes
                .Where(r => r.UserId == userId)
                .ToListAsync();
        }
        public async Task<IEnumerable<InterviewSession>> GetAllByUserIdAnalysisAsync(int userId)
        {
            return await _context.InterviewSessions
                .Where(r => r.UserId == userId)
                .ToListAsync();
        }
        public async Task<TEntity?> GetByIdAsync(TID id)
        {
            return await _Dbset.FindAsync(id);
        }

        public Task Update(TEntity entity)
        {
            _Dbset.Update(entity);
            return Task.CompletedTask;
        }
        public async Task<TEntity> GetLatestByUserIdAsync(int userId)
        {
            // For ResumeAnalysis, order by AnalyzedAt (or CreatedAt if you prefer)
            if (typeof(TEntity) == typeof(ResumeAnalysis))
            {
                var result = await _context.ResumeAnalyses
                    .Where(r => r.UserId == userId)
                    .OrderByDescending(r => r.AnalyzedAt)
                    .FirstOrDefaultAsync();
                return result as TEntity;
            }
            
            // For Resume, order by UploadedAt
            if (typeof(TEntity) == typeof(Resume))
            {
                var result = await _context.Resumes
                    .Where(r => r.UserId == userId)
                    .OrderByDescending(r => r.UploadedAt)
                    .FirstOrDefaultAsync();
                return result as TEntity;
            }
            
            // For InterviewSession, order by CreatedAt
            if (typeof(TEntity) == typeof(InterviewSession))
            {
                Console.WriteLine("I am here");
                var result = await _context.InterviewSessions
                    .Where(i => i.UserId == userId)
                    .OrderByDescending(i => i.CreatedAt)
                    .FirstOrDefaultAsync();
                return result as TEntity;
            }
            
            // Fallback: try to order by Id (assuming all entities have an Id property)
            return await _context.Set<TEntity>()
                .Where(e => EF.Property<int>(e, "UserId") == userId)
                .OrderByDescending(e => EF.Property<int>(e, "Id"))
                .FirstOrDefaultAsync();
        }

    }
}
