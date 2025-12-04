using DEPI.Application.DTOs;
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
        public Task<int> UploadResumeAsync(UploadResumeDTO upload);
        public Task AnalyzeResumeAsync(AnalyzeResumeRequestDTO AnalyzeResume);
        public Task RemoveResume(int resumeId);
        public Task<object> getResumeIdByUser(int userid);
        public Task<ResumeAnalysis> getAnalysisByResumeId(int resumeid , int userid);
        public Task<ResumeAnalysis> getLatestAnalysisByUserId(int userid);

    }
}
