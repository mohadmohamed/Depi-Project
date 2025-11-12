using DEPI.Application.DTOs;
using DEPI.DataAccess.Entites;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.Application.Contracts
{
    public interface IinterviewService
    {
        public Task<int> generateQuiz(GenerateQuizDTO generateQuiz);
        public Task evaluateAnswers(userAnswersDTO userAnswers);
        public Task<object> getQuestions(InterviewQuestionDTO interviewQuestionDTO);
        public Task<InterviewSession> getLastestQuiz(int userid);
        public Task<IEnumerable<InterviewSession>> getAllQuizzes(int userid);
    }
}
