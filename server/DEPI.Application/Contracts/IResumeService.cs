using DEPI.DataAccess.Entites;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.Application.Contracts
{
    public interface IResumeService
    {
        public Task<int> UploadResumeAsync(int userId, IFormFile file);
        public Task AnalyzeResumeAsync(int resumeId , string targetJob);
        public Task RemoveResume(int resumeId);
        public Task<object> getResumeIdByUser(int userid);
        public Task<ResumeAnalysis> getAnalysisByResumeId(int resumeid , int userid);
        public Task<ResumeAnalysis> getLatestAnalysisByUserId(int userid);

    }
}
