using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.Application.DTOs
{
    public class userAnswersDTO
    {
        public int resumeId { get; set; }                    
        public int userId { get; set; }
        public int sessionId { get; set; }

        public List<string> Answers { get; set; } = new(); 
    }
}
