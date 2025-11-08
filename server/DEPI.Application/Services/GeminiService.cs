using System.Net.Http.Json; 
using System.Text.Json;
using System.Text.Json.Serialization; 
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using DEPI.Application.Settings;
using Google.GenAI;
using Microsoft.Extensions.Logging;

namespace DEPI.Application.Services
{
    public class GeminiService : IGeminiService
    {
        private readonly Client _client;
        private readonly string _modelName;
        private readonly ILogger<GeminiService>? _logger;

        public GeminiService(IOptions<gemeniSettings> geminiSettings, ILogger<GeminiService>? logger = null)
        {
            // Initialize Google.GenAI client
            _client = new Client(apiKey: geminiSettings.Value.ApiKey);
            _modelName = geminiSettings.Value.modelId ?? "gemini-1.5-flash";
            _logger = logger;
        }

        public async Task<string> GenerateTextAsync(string prompt)
        {
            var response = await _client.Models.GenerateContentAsync(
                model: _modelName,
                contents: prompt
            );
            
            return response.Candidates[0].Content.Parts[0].Text;
        }
    }
}