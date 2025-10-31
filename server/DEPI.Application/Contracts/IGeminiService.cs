using System.Threading.Tasks;

namespace DEPI.Application.Services
{
    public interface IGeminiService
    {
        Task<string> GenerateQuizAsync(string topic, string difficulty);

    }
}
