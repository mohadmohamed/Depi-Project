using DEPI.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.Application.Contracts
{
    public interface IinterviewService
    {
        public Task generateQuiz(int userId , int ResumeId , string targetJob );
        public Task evaluateAnswers(userAnswersDTO userAnswers);
    }
}
