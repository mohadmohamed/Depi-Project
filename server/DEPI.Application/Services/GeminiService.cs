using DEPI.DataAccess.Contracts;
using DEPI.DataAccess.Entites;
using Microsoft.Extensions.Configuration;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace DEPI.Application.Services
{
    public class GeminiService : IGeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly IUnitOfWork _unitOfWork;

        public GeminiService(HttpClient httpClient, IConfiguration configuration, IUnitOfWork unitOfWork)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"];
            _unitOfWork = unitOfWork;
        }

        public async Task<string> GenerateQuizAsync(string topic, string difficulty)
        {
            // ✅ Use stable v1 endpoint
            var url = $"https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key={_apiKey}";

            var prompt = $"Generate 15 mcq interview preparation questions with answers about {topic} " +
                         $"at {difficulty} level." +
                         $"Return as JSON with fields: id, type, question, choices, correct, explanation.";

            var body = new
            {
                contents = new[]
                {
            new
            {
                parts = new[]
                {
                    new { text = prompt }
                }
            }
        }
            };

            var json = JsonSerializer.Serialize(body);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // ✅ Retry up to 3 times if the model is overloaded
            for (int attempt = 1; attempt <= 3; attempt++)
            {
                var response = await _httpClient.PostAsync(url, content);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    using var doc = JsonDocument.Parse(responseBody);
                    var root = doc.RootElement;

                    string generatedText = root
                        .GetProperty("candidates")[0]
                        .GetProperty("content")
                        .GetProperty("parts")[0]
                        .GetProperty("text")
                        .GetString();

                    return generatedText;
                }

                // Handle "model overloaded" case
                if ((int)response.StatusCode == 503 && attempt < 3)
                {
                    Console.WriteLine($"Model overloaded. Retrying... (Attempt {attempt}/3)");
                    await Task.Delay(3000); // Wait 3 seconds before retrying
                    continue;
                }

                throw new Exception($"Error: {response.StatusCode} - {responseBody}");
            }

            throw new Exception("Failed after 3 retry attempts.");
        }

    }
}
