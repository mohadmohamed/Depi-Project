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

        public UnitOfWork(AppDbContext context) 
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _interviewAnswerRepository = new Lazy<IRepository<InterviewAnswer, int>>(() => 
            {
                return new Repository<InterviewAnswer, int>(_context);
            });
            _interviewSessionRepository = new Lazy<IRepository<InterviewSession, int>>(() => 
            {
                return new Repository<InterviewSession, int>(_context);
            });
            _Resume = new Lazy<IRepository<Resume, int>>(() => 
            {
                return new Repository<Resume, int>(_context);
            });
            _userRepository = new Lazy<IRepository<User, int>>(() => 
            {
                return new Repository<User, int>(_context);
            }); 
            _resumeAnalysisRepository = new Lazy<IRepository<ResumeAnalysis, int>>(() => 
            {
                return new Repository<ResumeAnalysis, int>(_context);
            }); 
        }

        public IRepository<InterviewAnswer, int> InterviewAnswers 
        { 
            get 
            { 
                return _interviewAnswerRepository.Value; 
            } 
        }

        public IRepository<InterviewSession, int> InterviewSessions 
        { 
            get 
            { 
                return _interviewSessionRepository.Value; 
            } 
        }

        public IRepository<Resume, int> Resumes 
        { 
            get 
            { 
                return _Resume.Value; 
            } 
        }

        public IRepository<User, int> Users 
        { 
            get 
            { 
                return _userRepository.Value; 
            } 
        }

        public IRepository<ResumeAnalysis, int> ResumeAnalysis 
        { 
            get 
            { 
                return _resumeAnalysisRepository.Value; 
            } 
        }

        public void SaveChanges()
        {
            _context.SaveChanges();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
