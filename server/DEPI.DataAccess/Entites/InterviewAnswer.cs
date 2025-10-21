using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI.DataAccess.Entites
{
    public class InterviewAnswer
    {
        public int Id { get; set; }
        public int InterviewSessionId { get; set; }
        public string Question { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public double Score { get; set; } 

        public InterviewSession InterviewSession { get; set; }
    }

}
