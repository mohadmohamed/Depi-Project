using DEPI.DataAccess.Entites;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.DataAccess.Contracts
{
    internal interface IUnitOfWork
    {
        IRepository<InterviewAnswer ,int> InterviewAnswers { get; }
        IRepository<InterviewSession, int> InterviewSessions { get; }
        IRepository<Resume, int> Resumes { get; }
        IRepository<User, int> Users { get; } 
        IRepository<ResumeAnalysis, int> ResumeAnalysis { get; }
        void SaveChanges();
        Task SaveChangesAsync();
    }
}
