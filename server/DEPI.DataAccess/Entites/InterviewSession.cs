using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.DataAccess.Entites
{
    public class InterviewSession
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ResumeId { get; set; }
        public string QuestionsJson { get; set; } = string.Empty; 
        public double Score { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; }
        public Resume Resume { get; set; }
        public ICollection<InterviewAnswer> Answers { get; set; }
    }

}
