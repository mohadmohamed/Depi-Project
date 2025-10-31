using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.Application.DTOs
{
    public class QuizDto
    {
        public string QuizId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public List<QuestionDto> Questions { get; set; } = new();
    }
    public class QuestionDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty; // "mcq" or "essay"
        public string Question { get; set; } = string.Empty;
        public List<string>? Choices { get; set; }
        public string? Correct { get; set; }
        public string Explanation { get; set; } = string.Empty;
        public string? Placeholder { get; set; }
    }
}
