using System.Threading.Tasks;

namespace DEPI.Application.Services
{
    public interface IGeminiService
    {
        public Task<string> GenerateTextAsync(string prompt);
    }
}
