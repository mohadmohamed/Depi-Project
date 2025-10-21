using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.DataAccess.Entites
{
    public class Resume
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string ParsedText { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; }
        public ResumeAnalysis Analysis { get; set; }
    }

}
