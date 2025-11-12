using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.DataAccess.Entites
{
    public class ResumeAnalysis
    {
        public int Id { get; set; }
        public int ResumeId { get; set; }
        public int UserId { get; set; }
        public string FeedbackJson { get; set; } = string.Empty; 
        public DateTime AnalyzedAt { get; set; } = DateTime.UtcNow;
        public Resume Resume { get; set; }
        public User User { get; set; } 
    }

}
