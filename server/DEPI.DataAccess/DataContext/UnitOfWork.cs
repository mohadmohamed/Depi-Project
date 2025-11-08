using DEPI.DataAccess.Contracts;
using DEPI.DataAccess.Entites;
using DEPI.DataAccess.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.DataAccess.DataContext
{
    internal class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private readonly Lazy<IRepository<InterviewAnswer, int>> _interviewAnswerRepository;
        private readonly Lazy<IRepository<InterviewSession, int>> _interviewSessionRepository;
        private readonly Lazy<IRepository<Resume, int>> _Resume; 
        private readonly Lazy<IRepository<User, int>> _userRepository;
        private readonly Lazy<IRepository<ResumeAnalysis, int>> _resumeAnalysisRepository;
        private bool _disposed = false;

        public UnitOfWork(AppDbContext context) 
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _interviewAnswerRepository = new Lazy<IRepository<InterviewAnswer, int>>(() => 
            {
                ThrowIfDisposed();
                return new Repository<InterviewAnswer, int>(_context);
            });
            _interviewSessionRepository = new Lazy<IRepository<InterviewSession, int>>(() => 
            {
                ThrowIfDisposed();
                return new Repository<InterviewSession, int>(_context);
            });
            _Resume = new Lazy<IRepository<Resume, int>>(() => 
            {
                ThrowIfDisposed();
                return new Repository<Resume, int>(_context);
            });
            _userRepository = new Lazy<IRepository<User, int>>(() => 
            {
                ThrowIfDisposed();
                return new Repository<User, int>(_context);
            }); 
            _resumeAnalysisRepository = new Lazy<IRepository<ResumeAnalysis, int>>(() => 
            {
                ThrowIfDisposed();
                return new Repository<ResumeAnalysis, int>(_context);
            }); 
        }

        public IRepository<InterviewAnswer, int> InterviewAnswers 
        { 
            get 
            { 
                ThrowIfDisposed(); 
                return _interviewAnswerRepository.Value; 
            } 
        }

        public IRepository<InterviewSession, int> InterviewSessions 
        { 
            get 
            { 
                ThrowIfDisposed(); 
                return _interviewSessionRepository.Value; 
            } 
        }

        public IRepository<Resume, int> Resumes 
        { 
            get 
            { 
                ThrowIfDisposed(); 
                return _Resume.Value; 
            } 
        }

        public IRepository<User, int> Users 
        { 
            get 
            { 
                ThrowIfDisposed(); 
                return _userRepository.Value; 
            } 
        }

        public IRepository<ResumeAnalysis, int> ResumeAnalysis 
        { 
            get 
            { 
                ThrowIfDisposed(); 
                return _resumeAnalysisRepository.Value; 
            } 
        }

        public void SaveChanges()
        {
            ThrowIfDisposed();
            _context.SaveChanges();
        }

        public async Task SaveChangesAsync()
        {
            ThrowIfDisposed();
            await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed && disposing)
            {
                // Don't dispose the context - it's managed by the DI container
                // Just mark this UnitOfWork as disposed
                _disposed = true;
            }
        }

        private void ThrowIfDisposed()
        {
            if (_disposed)
                throw new ObjectDisposedException(nameof(UnitOfWork), "Cannot access a disposed UnitOfWork instance.");
        }
    }
}
