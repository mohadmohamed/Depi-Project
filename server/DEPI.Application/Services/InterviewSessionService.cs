using System.Text.Json;
using System.Threading.Tasks;
using DEPI.DataAccess.Contracts;
using DEPI.DataAccess.Entites;

namespace DEPI.Application.Services
{
    public class InterviewSessionService
    {
        private readonly IUnitOfWork _unitOfWork;

        public InterviewSessionService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // ✅ Save quiz result as JSON in the InterviewSessions table
        public async Task SaveInterviewSessionAsync(int userId, object quizResponse)
        {
            string jsonData = JsonSerializer.Serialize(quizResponse);

            var newSession = new InterviewSession
            {
                UserId = userId,
                QuestionsJson = jsonData,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.InterviewSessions.AddAsync(newSession);
            await _unitOfWork.SaveChangesAsync();
        }

        // ✅ Retrieve the latest saved quiz for a specific user
        public async Task<InterviewSession?> GetLastSessionByUserIdAsync(int userId)
        {
            var sessions = await _unitOfWork.InterviewSessions.GetAllAsync();
            return sessions
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefault();
        }
    }
}
